/**
 * ============================================================
 * UTOY'S TAPSI
 * PAYMENT VERIFICATION
 * ============================================================
 *
 * PURPOSE
 * -------
 * Staff verification of customer-submitted payment proofs.
 *
 * FLOW
 * ----
 *
 * PAYMENT_PROOFS
 *      ↓
 *    PENDING
 *      ↓
 * staff review
 *      ↓
 * APPROVED / REJECTED
 *
 * APPROVED
 *      ↓
 * createPayment()
 *      ↓
 * PAYMENTS
 *      ↓
 * ORDERS.Payment_Status
 *
 * IMPORTANT
 * ---------
 * Customer submission never creates a confirmed payment.
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CONVERT VALUE TO WEB-SAFE VALUE
 * ------------------------------------------------------------
 *
 * google.script.run cannot return JavaScript Date objects
 * directly to browser-side HTML.
 *
 * Convert Date values to ISO strings while preserving all
 * other values.
 *
 * ------------------------------------------------------------
 */
function paymentVerificationWebSafeValue_(value) {

  if (
    Object.prototype.toString.call(value) ===
    '[object Date]'
  ) {

    if (isNaN(value.getTime())) {
      return '';
    }

    return value.toISOString();

  }

  if (
    value === null ||
    value === undefined
  ) {

    return '';

  }

  return value;

}


/**
 * ------------------------------------------------------------
 * CONVERT RECORD TO WEB-SAFE RECORD
 * ------------------------------------------------------------
 */
function paymentVerificationWebSafeRecord_(
  record
) {

  var result = {};

  Object.keys(record).forEach(
    function(key) {

      result[key] =
        paymentVerificationWebSafeValue_(
          record[key]
        );

    }
  );

  return result;

}


/**
 * ------------------------------------------------------------
 * GET ALL PAYMENT PROOFS
 * ------------------------------------------------------------
 *
 * Read-only internal helper.
 *
 * Values are converted to browser-safe values so this API
 * can safely be used by google.script.run.
 *
 * ------------------------------------------------------------
 */
function getAllPaymentProofs_() {

  var ss =
    SpreadsheetApp.getActiveSpreadsheet();

  var sheet =
    ss.getSheetByName(
      CONFIG.PAYMENT_PROOFS_SHEET
    );

  if (!sheet) {
    return [];
  }

  var values =
    sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  var headers =
    values[0].map(function(header) {
      return String(header).trim();
    });

  var proofs = [];

  for (
    var i = 1;
    i < values.length;
    i++
  ) {

    var record = {};

    headers.forEach(
      function(header, index) {

        record[header] =
          paymentVerificationWebSafeValue_(
            values[i][index]
          );

      }
    );

    proofs.push(record);

  }

  return proofs;

}


/**
 * ------------------------------------------------------------
 * GET PENDING PAYMENT PROOFS
 * ------------------------------------------------------------
 *
 * Read-only.
 *
 * ------------------------------------------------------------
 */
function getPendingPaymentProofs() {

  var proofs =
    getAllPaymentProofs_();

  return proofs.filter(
    function(proof) {

      return (
        String(
          proof.Verification_Status || ''
        )
        .trim()
        .toUpperCase() ===
        'PENDING'
      );

    }
  );

}


/**
 * ------------------------------------------------------------
 * GET PENDING PAYMENT PROOF
 * ------------------------------------------------------------
 *
 * Read-only.
 *
 * ------------------------------------------------------------
 */
function getPendingPaymentProof(
  paymentProofId
) {

  var proof =
    getPaymentProofById(
      paymentProofId
    );

  if (!proof) {

    throw new Error(
      'Payment proof not found: ' +
      paymentProofId
    );

  }

  if (
    proof.success === false
  ) {

    throw new Error(
      proof.error ||
      'Unable to load payment proof.'
    );

  }

  if (
    String(
      proof.Verification_Status || ''
    )
    .trim()
    .toUpperCase() !==
    'PENDING'
  ) {

    throw new Error(
      'Payment proof is not pending. Current status: ' +
      proof.Verification_Status
    );

  }

  return paymentVerificationWebSafeRecord_(
    proof
  );

}


/**
 * ------------------------------------------------------------
 * GET PAYMENT PROOF SHEET COLUMN MAP
 * ------------------------------------------------------------
 */
function getPaymentProofColumnMap_(
  sheet
) {

  var values =
    sheet.getDataRange().getValues();

  if (values.length < 1) {

    throw new Error(
      'PAYMENT_PROOFS sheet has no headers.'
    );

  }

  var headers =
    values[0].map(function(header) {
      return String(header).trim();
    });

  var map = {};

  headers.forEach(
    function(header, index) {
      map[header] = index + 1;
    }
  );

  return map;

}


/**
 * ------------------------------------------------------------
 * FIND PAYMENT PROOF ROW
 * ------------------------------------------------------------
 */
function findPaymentProofRow_(
  sheet,
  paymentProofId
) {

  var values =
    sheet.getDataRange().getValues();

  if (values.length < 2) {
    return -1;
  }

  var headers =
    values[0].map(function(header) {
      return String(header).trim();
    });

  var idIndex =
    headers.indexOf(
      'Payment_Proof_ID'
    );

  if (idIndex === -1) {

    throw new Error(
      'PAYMENT_PROOFS is missing Payment_Proof_ID column.'
    );

  }

  var targetId =
    cleanText(
      paymentProofId
    );

  for (
    var i = 1;
    i < values.length;
    i++
  ) {

    if (
      String(
        values[i][idIndex]
      ).trim() ===
      targetId
    ) {

      return i + 1;

    }

  }

  return -1;

}


/**
 * ------------------------------------------------------------
 * UPDATE PAYMENT PROOF FIELDS
 * ------------------------------------------------------------
 */
function updatePaymentProofFields_(
  sheet,
  rowNumber,
  fields
) {

  var columnMap =
    getPaymentProofColumnMap_(
      sheet
    );

  Object.keys(fields).forEach(
    function(field) {

      if (!columnMap[field]) {

        throw new Error(
          'PAYMENT_PROOFS is missing column: ' +
          field
        );

      }

      sheet
        .getRange(
          rowNumber,
          columnMap[field]
        )
        .setValue(
          fields[field]
        );

    }
  );

}


/**
 * ------------------------------------------------------------
 * APPROVE PAYMENT PROOF
 * ------------------------------------------------------------
 *
 * IMPORTANT
 * ---------
 * Approval creates a confirmed PAYMENTS record by calling
 * the existing createPayment() function.
 *
 * createPayment() has its own transaction lock.
 * Therefore this function does NOT hold the script lock
 * while calling createPayment().
 *
 * ------------------------------------------------------------
 */
function approvePaymentProof(
  paymentProofId,
  verifiedBy
) {

  paymentProofId =
    cleanText(
      paymentProofId
    );

  verifiedBy =
    cleanText(
      verifiedBy
    );

  if (!paymentProofId) {

    return {
      success: false,
      error:
        'Payment proof ID is required.'
    };

  }

  if (!verifiedBy) {

    return {
      success: false,
      error:
        'Verified By is required.'
    };

  }


  /**
   * ----------------------------------------------------------
   * PHASE 1
   * LOCK AND VALIDATE PROOF
   * ----------------------------------------------------------
   */
  var lock =
    LockService.getScriptLock();

  var proof;
  var orderId;
  var paymentMethod;
  var paymentAmount;
  var reference;

  try {

    lock.waitLock(15000);

    try {

      proof =
        getPaymentProofById(
          paymentProofId
        );

      if (!proof) {

        throw new Error(
          'Payment proof not found: ' +
          paymentProofId
        );

      }

      if (
        proof.success === false
      ) {

        throw new Error(
          proof.error ||
          'Unable to load payment proof.'
        );

      }


      /**
       * Only PENDING proofs may be approved.
       */
      var verificationStatus =
        String(
          proof.Verification_Status || ''
        )
        .trim()
        .toUpperCase();

      if (
        verificationStatus !==
        'PENDING'
      ) {

        throw new Error(
          'Payment proof cannot be approved. Current status: ' +
          proof.Verification_Status
        );

      }


      /**
       * Read payment information.
       */
      orderId =
        cleanText(
          proof.Order_ID
        );

      paymentMethod =
        normalizePaymentMethodCode_(
          proof.Payment_Method
        );

      paymentAmount =
        roundMoney(
          Number(
            proof.Payment_Amount
          )
        );

      reference =
        cleanText(
          proof.Reference
        );


      if (!orderId) {

        throw new Error(
          'Payment proof has no Order_ID.'
        );

      }

      if (!paymentMethod) {

        throw new Error(
          'Payment proof has no Payment_Method.'
        );

      }

      if (
        !isFinite(paymentAmount) ||
        paymentAmount <= 0
      ) {

        throw new Error(
          'Payment proof has an invalid Payment_Amount.'
        );

      }


      /**
       * Verify that the actual payment method exists
       * and is an online method.
       */
      var actualMethod =
        getActualPaymentMethod(
          paymentMethod
        );

      if (!actualMethod) {

        throw new Error(
          'Invalid payment method: ' +
          paymentMethod
        );

      }

      if (
        actualMethod.type !==
        'ONLINE'
      ) {

        throw new Error(
          'Only online payment methods can be approved from payment proof.'
        );

      }

    } finally {

      lock.releaseLock();

    }


    /**
     * ----------------------------------------------------------
     * PHASE 2
     * CREATE CONFIRMED PAYMENT
     * ----------------------------------------------------------
     */
    var paymentResult =
      createPayment({
        orderId:
          orderId,

        paymentMethod:
          paymentMethod,

        paymentAmount:
          paymentAmount,

        reference:
          reference
      });


    if (
      !paymentResult ||
      paymentResult.success !== true
    ) {

      return {
        success: false,

        error:
          (
            paymentResult &&
            paymentResult.error
          ) ||
          'Unable to create confirmed payment.'
      };

    }


    /**
     * ----------------------------------------------------------
     * PHASE 3
     * LOCK AND FINALIZE PROOF
     * ----------------------------------------------------------
     */
    lock.waitLock(15000);

    try {

      var ss =
        SpreadsheetApp.getActiveSpreadsheet();

      var sheet =
        ss.getSheetByName(
          CONFIG.PAYMENT_PROOFS_SHEET
        );

      if (!sheet) {

        throw new Error(
          'PAYMENT_PROOFS sheet not found.'
        );

      }


      /**
       * Reload the proof after payment creation.
       */
      var currentProof =
        getPaymentProofById(
          paymentProofId
        );

      if (!currentProof) {

        throw new Error(
          'Payment proof disappeared during approval.'
        );

      }

      if (
        currentProof.success === false
      ) {

        throw new Error(
          currentProof.error ||
          'Unable to reload payment proof.'
        );

      }


      /**
       * The proof should still be PENDING.
       */
      if (
        String(
          currentProof.Verification_Status || ''
        )
        .trim()
        .toUpperCase() !==
        'PENDING'
      ) {

        throw new Error(
          'Payment proof status changed unexpectedly during approval.'
        );

      }


      /**
       * Find the proof row.
       */
      var rowNumber =
        findPaymentProofRow_(
          sheet,
          paymentProofId
        );

      if (rowNumber === -1) {

        throw new Error(
          'Payment proof row not found.'
        );

      }


      /**
       * Mark proof APPROVED and link the confirmed
       * payment record.
       */
      updatePaymentProofFields_(
        sheet,
        rowNumber,
        {

          Verification_Status:
            'APPROVED',

          Payment_ID:
            paymentResult.paymentId,

          Verified_Date:
            new Date(),

          Verified_By:
            verifiedBy,

          Rejection_Reason:
            ''

        }
      );


      /**
       * Return successful result.
       */
      return {

        success: true,

        paymentProofId:
          paymentProofId,

        orderId:
          orderId,

        paymentId:
          paymentResult.paymentId,

        paymentAmount:
          paymentAmount,

        paymentResult:
          currentProof.Payment_Result,

        verificationStatus:
          'APPROVED',

        verifiedBy:
          verifiedBy,

        paymentStatus:
          paymentResult.paymentStatus,

        paidAmount:
          paymentResult.paidAmount,

        remainingAmount:
          paymentResult.remainingAmount,

        message:
          'Payment proof approved and confirmed payment created successfully.'

      };

    } finally {

      lock.releaseLock();

    }

  } catch (error) {

    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


/**
 * ------------------------------------------------------------
 * REJECT PAYMENT PROOF
 * ------------------------------------------------------------
 *
 * Rejection never creates a PAYMENTS record.
 *
 * ------------------------------------------------------------
 */
function rejectPaymentProof(
  paymentProofId,
  verifiedBy,
  rejectionReason
) {

  var lock =
    LockService.getScriptLock();

  try {

    paymentProofId =
      cleanText(
        paymentProofId
      );

    verifiedBy =
      cleanText(
        verifiedBy
      );

    rejectionReason =
      cleanText(
        rejectionReason
      );


    if (!paymentProofId) {

      throw new Error(
        'Payment proof ID is required.'
      );

    }

    if (!verifiedBy) {

      throw new Error(
        'Verified By is required.'
      );

    }

    if (!rejectionReason) {

      throw new Error(
        'Rejection reason is required.'
      );

    }


    lock.waitLock(15000);

    try {

      var ss =
        SpreadsheetApp.getActiveSpreadsheet();

      var sheet =
        ss.getSheetByName(
          CONFIG.PAYMENT_PROOFS_SHEET
        );

      if (!sheet) {

        throw new Error(
          'PAYMENT_PROOFS sheet not found.'
        );

      }


      /**
       * Load proof under lock.
       */
      var proof =
        getPaymentProofById(
          paymentProofId
        );

      if (!proof) {

        throw new Error(
          'Payment proof not found: ' +
          paymentProofId
        );

      }

      if (
        proof.success === false
      ) {

        throw new Error(
          proof.error ||
          'Unable to load payment proof.'
        );

      }


      /**
       * Only PENDING proofs may be rejected.
       */
      var verificationStatus =
        String(
          proof.Verification_Status || ''
        )
        .trim()
        .toUpperCase();

      if (
        verificationStatus !==
        'PENDING'
      ) {

        throw new Error(
          'Payment proof cannot be rejected. Current status: ' +
          proof.Verification_Status
        );

      }


      /**
       * Find proof row.
       */
      var rowNumber =
        findPaymentProofRow_(
          sheet,
          paymentProofId
        );

      if (rowNumber === -1) {

        throw new Error(
          'Payment proof row not found.'
        );

      }


      /**
       * Mark proof REJECTED.
       *
       * No PAYMENTS record is created.
       * ORDERS.Payment_Status is unchanged.
       */
      updatePaymentProofFields_(
        sheet,
        rowNumber,
        {

          Verification_Status:
            'REJECTED',

          Payment_ID:
            '',

          Verified_Date:
            new Date(),

          Verified_By:
            verifiedBy,

          Rejection_Reason:
            rejectionReason

        }
      );


      return {

        success: true,

        paymentProofId:
          paymentProofId,

        orderId:
          proof.Order_ID,

        verificationStatus:
          'REJECTED',

        verifiedBy:
          verifiedBy,

        rejectionReason:
          rejectionReason,

        message:
          'Payment proof rejected successfully.'

      };

    } finally {

      lock.releaseLock();

    }

  } catch (error) {

    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


/**
 * ============================================================
 * PAYMENT VERIFICATION READ API
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * GET PAYMENT VERIFICATION QUEUE
 * ------------------------------------------------------------
 */
function getPaymentVerificationQueue() {

  try {

    var proofs =
      getPendingPaymentProofs();

    return {

      success: true,

      count:
        proofs.length,

      proofs:
        proofs

    };

  } catch (error) {

    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


/**
 * ------------------------------------------------------------
 * GET PAYMENT VERIFICATION DETAILS
 * ------------------------------------------------------------
 *
 * Returns:
 *
 * - payment proof
 * - related order
 * - payment history
 *
 * All returned data is converted to browser-safe values.
 *
 * ------------------------------------------------------------
 */
function getPaymentVerificationDetails(
  paymentProofId
) {

  try {

    if (!paymentProofId) {

      return {

        success: false,

        error:
          'Payment proof ID is required.'

      };

    }

    var proofResult =
      getPaymentProofById(
        paymentProofId
      );

    if (!proofResult) {

      return {

        success: false,

        error:
          'Payment proof not found: ' +
          paymentProofId

      };

    }

    var proof =
      proofResult.proof ||
      proofResult;

    var orderId =
      proof.Order_ID;

    if (!orderId) {

      return {

        success: false,

        error:
          'Payment proof does not contain an Order_ID.'

      };

    }

    var ss =
      SpreadsheetApp.getActiveSpreadsheet();

    var order =
      getOrderById(
        ss,
        orderId
      );

    if (!order) {

      return {

        success: false,

        error:
          'Order not found: ' +
          orderId

      };

    }

    var payments =
      getPaymentsForOrder(
        ss,
        orderId
      );


    /**
     * Convert proof.
     */
    var safeProof =
      paymentVerificationWebSafeRecord_(
        proof
      );


    /**
     * Convert order.
     */
    var safeOrder =
      paymentVerificationWebSafeRecord_(
        order
      );


    /**
     * Convert payment history.
     */
    var safePayments =
      payments.map(
        function(payment) {

          return paymentVerificationWebSafeRecord_(
            payment
          );

        }
      );


    return {

      success: true,

      proof:
        safeProof,

      order:
        safeOrder,

      payments:
        safePayments

    };

  } catch (error) {

    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


/**
 * ------------------------------------------------------------
 * GET PAYMENT VERIFICATION SUMMARY
 * ------------------------------------------------------------
 */
function getPaymentVerificationSummary() {

  try {

    var pendingProofs =
      getPendingPaymentProofs();

    return {

      success: true,

      pendingCount:
        pendingProofs.length

    };

  } catch (error) {

    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


/**
 * ============================================================
 * STAFF PAYMENT VERIFICATION API
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * GET STAFF PAYMENT VERIFICATION DATA
 * ------------------------------------------------------------
 *
 * Returns the pending verification queue.
 *
 * Data is browser-safe for google.script.run.
 *
 * ------------------------------------------------------------
 */
function getStaffPaymentVerificationData() {

  try {

    var proofs =
      getPendingPaymentProofs();

    return {

      success: true,

      pendingCount:
        proofs.length,

      proofs:
        proofs

    };

  } catch (error) {

    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


/**
 * ------------------------------------------------------------
 * GET STAFF PAYMENT PROOF DETAIL
 * ------------------------------------------------------------
 *
 * Returns:
 *
 * - payment proof
 * - related order
 * - confirmed payment history
 *
 * ------------------------------------------------------------
 */
function getStaffPaymentProofDetail(
  paymentProofId
) {

  try {

    if (!paymentProofId) {

      return {

        success: false,

        error:
          'Payment proof ID is required.'

      };

    }

    return getPaymentVerificationDetails(
      paymentProofId
    );

  } catch (error) {

    return {

      success: false,

      error:
        error.message ||
        String(error)

    };

  }

}


/**
 * ------------------------------------------------------------
 * STAFF APPROVE PAYMENT PROOF
 * ------------------------------------------------------------
 *
 * Thin wrapper for the staff dashboard.
 *
 * The actual approval/payment logic remains inside
 * approvePaymentProof().
 *
 * ------------------------------------------------------------
 */
function staffApprovePaymentProof(
  paymentProofId,
  verifiedBy
) {

  if (!paymentProofId) {

    return {

      success: false,

      error:
        'Payment proof ID is required.'

    };

  }

  if (!verifiedBy) {

    return {

      success: false,

      error:
        'Verified by is required.'

    };

  }

  return approvePaymentProof(
    paymentProofId,
    verifiedBy
  );

}


/**
 * ------------------------------------------------------------
 * STAFF REJECT PAYMENT PROOF
 * ------------------------------------------------------------
 *
 * Thin wrapper for the staff dashboard.
 *
 * The actual rejection logic remains inside
 * rejectPaymentProof().
 *
 * ------------------------------------------------------------
 */
function staffRejectPaymentProof(
  paymentProofId,
  verifiedBy,
  rejectionReason
) {

  if (!paymentProofId) {

    return {

      success: false,

      error:
        'Payment proof ID is required.'

    };

  }

  if (!verifiedBy) {

    return {

      success: false,

      error:
        'Verified by is required.'

    };

  }

  if (
    !rejectionReason ||
    String(rejectionReason).trim() === ''
  ) {

    return {

      success: false,

      error:
        'Rejection reason is required.'

    };

  }

  return rejectPaymentProof(
    paymentProofId,
    verifiedBy,
    rejectionReason
  );

}


/**
 * ============================================================
 * TESTS
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * TEST APPROVE PAYMENT PROOF
 * ------------------------------------------------------------
 *
 * CONTROLLED TEST ONLY.
 *
 * Existing proof:
 *
 * PROOF-20260906-120139-620
 *
 * This proof has already been approved.
 *
 * DO NOT RUN AGAIN.
 *
 * ------------------------------------------------------------
 */
function testApprovePaymentProof() {

  var result =
    approvePaymentProof(
      'PROOF-20260906-120139-620',
      'TEST-STAFF'
    );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ------------------------------------------------------------
 * TEST REJECT VALIDATION
 * ------------------------------------------------------------
 *
 * Uses a nonexistent proof.
 *
 * No sheet data is modified.
 *
 * ------------------------------------------------------------
 */
function testRejectPaymentProofValidation() {

  var result =
    rejectPaymentProof(
      'TEST-NONEXISTENT-PROOF',
      'TEST-STAFF',
      'Test rejection'
    );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ------------------------------------------------------------
 * TEST PENDING PAYMENT PROOFS
 * ------------------------------------------------------------
 */
function testPendingPaymentProofs() {

  var proofs =
    getPendingPaymentProofs();

  Logger.log(
    JSON.stringify(
      {
        success: true,

        pendingCount:
          proofs.length,

        proofs:
          proofs

      },
      null,
      2
    )
  );

}


/**
 * ------------------------------------------------------------
 * TEST PAYMENT VERIFICATION QUEUE
 * ------------------------------------------------------------
 */
function testPaymentVerificationQueue() {

  var result =
    getPaymentVerificationQueue();

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ------------------------------------------------------------
 * TEST PAYMENT VERIFICATION DETAILS
 * ------------------------------------------------------------
 */
function testPaymentVerificationDetails() {

  var paymentProofId =
    'PROOF-20260906-120139-620';

  var result =
    getPaymentVerificationDetails(
      paymentProofId
    );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ------------------------------------------------------------
 * TEST PAYMENT VERIFICATION SUMMARY
 * ------------------------------------------------------------
 */
function testPaymentVerificationSummary() {

  var result =
    getPaymentVerificationSummary();

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ------------------------------------------------------------
 * TEST STAFF APPROVE VALIDATION
 * ------------------------------------------------------------
 */
function testStaffApprovePaymentProofValidation() {

  var result =
    staffApprovePaymentProof(
      '',
      'TEST-STAFF'
    );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ------------------------------------------------------------
 * TEST STAFF REJECT VALIDATION
 * ------------------------------------------------------------
 */
function testStaffRejectPaymentProofValidation() {

  var result =
    staffRejectPaymentProof(
      '',
      'TEST-STAFF',
      ''
    );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ------------------------------------------------------------
 * TEST SUBMIT PAYMENT PROOF FOR REJECTION
 * ------------------------------------------------------------
 *
 * Controlled test only.
 *
 * This creates a fresh PENDING proof.
 *
 * The resulting proof was:
 *
 * PROOF-20260906-190301-858
 *
 * It has already been rejected.
 *
 * DO NOT RUN AGAIN unless a new rejection test is
 * intentionally required.
 *
 * ------------------------------------------------------------
 */
function testSubmitPaymentProofForRejection() {

  var result =
    submitPaymentProof({

      orderId:
        'TEST-ORD-25DD9BB2',

      paymentMethod:
        'GCASH',

      paymentAmount:
        50,

      reference:
        'TEST-REJECT-001',

      proofFileId:
        'TEST-FILE-REJECT-001',

      proofFileUrl:
        'https://example.com/test-rejection-proof'

    });

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ------------------------------------------------------------
 * TEST STAFF REJECT PAYMENT PROOF
 * ------------------------------------------------------------
 *
 * The proof used here has already been rejected.
 *
 * DO NOT RUN AGAIN.
 *
 * ------------------------------------------------------------
 */
function testStaffRejectPaymentProof() {

  var result =
    staffRejectPaymentProof(
      'PROOF-20260906-190301-858',
      'TEST-STAFF',
      'Test rejection - proof intentionally rejected.'
    );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ============================================================
 * TEST STAFF PAYMENT VERIFICATION DATA
 * ============================================================
 */
function testStaffPaymentVerificationData() {

  var result =
    getStaffPaymentVerificationData();

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ============================================================
 * TEST STAFF PAYMENT PROOF DETAIL
 * ============================================================
 */
function testStaffPaymentProofDetail() {

  var result =
    getStaffPaymentProofDetail(
      'PROOF-20260906-190301-858'
    );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/**
 * ============================================================
 * TEST CREATE PENDING PAYMENT PROOF
 * ============================================================
 *
 * Controlled test.
 *
 * Existing proof:
 *
 * PROOF-20260906-232254-716
 *
 * This proof is intentionally PENDING.
 *
 * DO NOT RUN AGAIN.
 *
 * ============================================================
 */
function testCreatePendingPaymentProof() {

  var result =
    submitPaymentProof({

      orderId:
        'TEST-ORD-25DD9BB2',

      paymentMethod:
        'GCASH',

      paymentAmount:
        50,

      reference:
        'TEST-PENDING-001',

      proofFileId:
        'TEST-FILE-PENDING-001',

      proofFileUrl:
        'https://example.com/test-pending-proof'

    });

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;

}

function testCreatePendingPaymentProofForApproval() {

  var result = submitPaymentProof({
    orderId: 'TEST-ORD-25DD9BB2',
    paymentMethod: 'GCASH',
    paymentAmount: 50,
    reference: 'TEST-APPROVE-001',
    proofFileId: 'TEST-FILE-APPROVE-001',
    proofFileUrl: 'https://example.com/test-approval-proof'
  });

  Logger.log(JSON.stringify(result, null, 2));

  return result;
}

function testApprovedPaymentProofDetail() {

  var result =
    getStaffPaymentProofDetail(
      'PROOF-20260907-001405-938'
    );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}
