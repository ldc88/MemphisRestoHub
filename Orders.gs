/* ============================================================
   PAYMENT PROOFS
   ============================================================ */

/*
 * PAYMENT PROOF LIFECYCLE
 *
 * Customer submits proof
 *        ↓
 * PAYMENT_PROOFS
 *        ↓
 * PENDING
 *        ↓
 * Staff verification
 *        ↓
 * APPROVED / REJECTED
 *
 * APPROVED:
 *      createPayment()
 *      ↓
 * PAYMENTS
 *      ↓
 * ORDERS.Payment_Status
 *
 * Customer proof NEVER directly creates a confirmed payment.
 */


/* ============================================================
   CONSTANTS
   ============================================================ */

var PAYMENT_PROOF_HEADERS = [
  'Payment_Proof_ID',
  'Order_ID',
  'Submitted_Date',
  'Payment_Method',
  'Payment_Amount',
  'Reference',
  'Proof_File_ID',
  'Proof_File_URL',
  'Verification_Status',
  'Payment_Result',
  'Payment_ID',
  'Verified_Date',
  'Verified_By',
  'Rejection_Reason'
];

var PAYMENT_PROOF_VERIFICATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED'
];

var PAYMENT_PROOF_RESULTS = [
  'PARTIAL PAYMENT',
  'FULLY PAID'
];

var PAYMENT_PROOF_MAX_FILE_SIZE = 5 * 1024 * 1024;


/* ============================================================
   SHEET
   ============================================================ */

function getPaymentProofsSheet_() {

  var ss =
    SpreadsheetApp.getActiveSpreadsheet();

  var sheet =
    ss.getSheetByName(
      CONFIG.PAYMENT_PROOFS_SHEET
    );

  if (!sheet) {

    sheet =
      ss.insertSheet(
        CONFIG.PAYMENT_PROOFS_SHEET
      );

  }

  ensurePaymentProofHeaders_(sheet);

  return sheet;

}


/* ============================================================
   ENSURE HEADERS
   ============================================================ */

function ensurePaymentProofHeaders_(sheet) {

  var lastColumn =
    Math.max(
      sheet.getLastColumn(),
      1
    );

  var existingHeaders =
    sheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0]
      .map(function(value) {
        return String(value || '').trim();
      });

  var hasHeaders =
    existingHeaders.some(function(value) {
      return value !== '';
    });

  if (!hasHeaders) {

    sheet
      .getRange(
        1,
        1,
        1,
        PAYMENT_PROOF_HEADERS.length
      )
      .setValues([
        PAYMENT_PROOF_HEADERS
      ]);

    return;

  }

  var missingHeaders =
    PAYMENT_PROOF_HEADERS.filter(
      function(header) {
        return existingHeaders.indexOf(header) === -1;
      }
    );

  if (
    missingHeaders.length > 0
  ) {

    sheet
      .getRange(
        1,
        existingHeaders.length + 1,
        1,
        missingHeaders.length
      )
      .setValues([
        missingHeaders
      ]);

  }

}


/* ============================================================
   COLUMN MAP
   ============================================================ */

function getPaymentProofColumnMap_(sheet) {

  var lastColumn =
    sheet.getLastColumn();

  if (
    lastColumn < 1
  ) {

    return {};

  }

  var headers =
    sheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0];

  var map = {};

  headers.forEach(
    function(header, index) {

      var name =
        String(
          header || ''
        ).trim();

      if (name) {

        map[name] =
          index + 1;

      }

    }
  );

  return map;

}


/* ============================================================
   GENERATE PROOF ID
   ============================================================ */

function generatePaymentProofId() {

  var now =
    new Date();

  var timestamp =
    Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      'yyyyMMdd-HHmmss'
    );

  var random =
    Math.floor(
      100 +
      Math.random() * 900
    );

  return (
    'PROOF-' +
    timestamp +
    '-' +
    random
  );

}


/* ============================================================
   TEXT HELPERS
   ============================================================ */

function cleanPaymentProofText_(value) {

  return String(
    value === undefined ||
    value === null
      ? ''
      : value
  ).trim();

}


/* ============================================================
   NUMBER HELPER
   ============================================================ */

function paymentProofMoney_(value) {

  var number =
    Number(value);

  if (
    !isFinite(number)
  ) {

    return 0;

  }

  return Math.round(
    number * 100
  ) / 100;

}


/* ============================================================
   RESULT
   ============================================================ */

function getPaymentProofResult_(
  paidAmount,
  orderTotal
) {

  paidAmount =
    paymentProofMoney_(
      paidAmount
    );

  orderTotal =
    paymentProofMoney_(
      orderTotal
    );

  if (
    paidAmount >= orderTotal
  ) {

    return 'FULLY PAID';

  }

  return 'PARTIAL PAYMENT';

}


/* ============================================================
   DUPLICATE REFERENCE
   ============================================================ */

function paymentProofReferenceExists_(
  sheet,
  orderId,
  reference
) {

  var order =
    cleanPaymentProofText_(
      orderId
    );

  var ref =
    cleanPaymentProofText_(
      reference
    );

  if (!ref) {

    return false;

  }

  var lastRow =
    sheet.getLastRow();

  if (
    lastRow < 2
  ) {

    return false;

  }

  var map =
    getPaymentProofColumnMap_(
      sheet
    );

  var orderColumn =
    map.Order_ID;

  var referenceColumn =
    map.Reference;

  if (
    !orderColumn ||
    !referenceColumn
  ) {

    return false;

  }

  var rows =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        sheet.getLastColumn()
      )
      .getValues();

  return rows.some(
    function(row) {

      return (
        cleanPaymentProofText_(
          row[orderColumn - 1]
        ) === order &&
        cleanPaymentProofText_(
          row[referenceColumn - 1]
        ) === ref
      );

    }
  );

}


/* ============================================================
   FILE UPLOAD
   ============================================================ */

function getPaymentProofFolder_() {

  var folderName =
    "Utoy's Tapsi Payment Proofs";

  var folders =
    DriveApp.getFoldersByName(
      folderName
    );

  if (
    folders.hasNext()
  ) {

    return folders.next();

  }

  return DriveApp.createFolder(
    folderName
  );

}


/* ============================================================
   CREATE PAYMENT PROOF FILE
   ============================================================ */

function savePaymentProofFile_(
  fileData,
  paymentProofId
) {

  if (
    !fileData
  ) {

    return {
      fileId: '',
      fileUrl: ''
    };

  }

  var dataUrl =
    cleanPaymentProofText_(
      fileData.dataUrl
    );

  var fileName =
    cleanPaymentProofText_(
      fileData.fileName
    ) ||
    (
      paymentProofId +
      '-proof'
    );

  var mimeType =
    cleanPaymentProofText_(
      fileData.mimeType
    );

  if (!dataUrl) {

    throw new Error(
      'Payment proof file data is missing.'
    );

  }

  if (
    dataUrl.indexOf(
      'data:'
    ) !== 0
  ) {

    throw new Error(
      'Invalid payment proof file.'
    );

  }

  var commaIndex =
    dataUrl.indexOf(',');

  if (
    commaIndex === -1
  ) {

    throw new Error(
      'Invalid payment proof file data.'
    );

  }

  var encoded =
    dataUrl.substring(
      commaIndex + 1
    );

  var bytes =
    Utilities.base64Decode(
      encoded
    );

  if (
    bytes.length >
    PAYMENT_PROOF_MAX_FILE_SIZE
  ) {

    throw new Error(
      'Payment proof file is too large. Maximum size is 5 MB.'
    );

  }

  var allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (
    allowedTypes.indexOf(
      mimeType
    ) === -1
  ) {

    throw new Error(
      'Unsupported payment proof file type.'
    );

  }

  var blob =
    Utilities.newBlob(
      bytes,
      mimeType,
      fileName
    );

  var folder =
    getPaymentProofFolder_();

  var file =
    folder.createFile(
      blob
    );

  file.setDescription(
    'Payment proof ' +
    paymentProofId
  );

  return {
    fileId:
      file.getId(),

    fileUrl:
      file.getUrl()
  };

}


/* ============================================================
   SUBMIT PAYMENT PROOF
   ============================================================ */

function submitPaymentProof(
  proofData
) {

  try {

    proofData =
      proofData || {};

    var orderId =
      cleanPaymentProofText_(
        proofData.orderId
      );

    var paymentMethod =
      cleanPaymentProofText_(
        proofData.paymentMethod
      ).toUpperCase();

    var paymentAmount =
      paymentProofMoney_(
        proofData.paymentAmount
      );

    var reference =
      cleanPaymentProofText_(
        proofData.reference
      );

    if (!orderId) {

      return {
        success: false,
        error: 'Order ID is required.'
      };

    }

    if (!paymentMethod) {

      return {
        success: false,
        error: 'Payment method is required.'
      };

    }

    if (
      !isValidActualPaymentMethod(
        paymentMethod
      )
    ) {

      return {
        success: false,
        error: 'Invalid payment method.'
      };

    }

    if (
      !actualPaymentMethodRequiresProof(
        paymentMethod
      )
    ) {

      return {
        success: false,
        error:
          'This payment method does not require payment proof.'
      };

    }

    if (
      paymentAmount <= 0
    ) {

      return {
        success: false,
        error:
          'Payment amount must be greater than zero.'
      };

    }

    if (!reference) {

      return {
        success: false,
        error:
          'Payment reference is required.'
      };

    }


    var ss =
      SpreadsheetApp.getActiveSpreadsheet();

    var sheet =
      getPaymentProofsSheet_();


    /*
     * LOCK
     *
     * Prevent duplicate submissions
     * from being accepted simultaneously.
     */

    var lock =
      LockService.getScriptLock();

    lock.waitLock(
      30000
    );

    try {

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

      var orderTotal =
        paymentProofMoney_(
          order.Total ||
          order.Grand_Total ||
          order.Subtotal
        );

      if (
        orderTotal <= 0
      ) {

        return {
          success: false,
          error:
            'Order total is invalid.'
        };

      }


      var payments =
        getPaymentsForOrder(
          ss,
          orderId
        );

      var currentlyPaidAmount =
        paymentProofMoney_(
          calculatePaidAmount_(
            payments
          )
        );

      var remainingBeforeProof =
        paymentProofMoney_(
          orderTotal -
          currentlyPaidAmount
        );


      if (
        remainingBeforeProof <= 0
      ) {

        return {
          success: false,
          error:
            'This order is already fully paid.'
        };

      }


      if (
        paymentAmount >
        remainingBeforeProof
      ) {

        return {
          success: false,
          error:
            'Payment amount exceeds the remaining balance of ' +
            remainingBeforeProof.toFixed(2) +
            '.'
        };

      }


      if (
        paymentProofReferenceExists_(
          sheet,
          orderId,
          reference
        )
      ) {

        return {
          success: false,
          error:
            'A payment proof with reference "' +
            reference +
            '" already exists for this order.'
        };

      }


      var paymentProofId =
        generatePaymentProofId();


      /*
       * Save file only after all
       * business validation passes.
       */

      var file =
        savePaymentProofFile_(
          proofData.proofFile,
          paymentProofId
        );


      var paymentResult =
        getPaymentProofResult_(
          currentlyPaidAmount +
          paymentAmount,
          orderTotal
        );


      var record = {

        Payment_Proof_ID:
          paymentProofId,

        Order_ID:
          orderId,

        Submitted_Date:
          new Date(),

        Payment_Method:
          paymentMethod,

        Payment_Amount:
          paymentAmount,

        Reference:
          reference,

        Proof_File_ID:
          file.fileId,

        Proof_File_URL:
          file.fileUrl,

        Verification_Status:
          'PENDING',

        Payment_Result:
          paymentResult,

        Payment_ID:
          '',

        Verified_Date:
          '',

        Verified_By:
          '',

        Rejection_Reason:
          ''

      };


      appendPaymentProofRecord_(
        sheet,
        record
      );


      return {

        success: true,

        paymentProofId:
          paymentProofId,

        orderId:
          orderId,

        paymentMethod:
          paymentMethod,

        paymentAmount:
          paymentAmount,

        orderTotal:
          orderTotal,

        currentlyPaidAmount:
          currentlyPaidAmount,

        remainingBeforeProof:
          remainingBeforeProof,

        paymentResult:
          paymentResult,

        verificationStatus:
          'PENDING',

        message:
          'Payment proof submitted successfully and is pending verification.'

      };

    } finally {

      lock.releaseLock();

    }

  } catch (error) {

    return {

      success: false,

      error:
        error &&
        error.message
          ? error.message
          : String(error)

    };

  }

}


/* ============================================================
   APPEND RECORD
   ============================================================ */

function appendPaymentProofRecord_(
  sheet,
  record
) {

  var map =
    getPaymentProofColumnMap_(
      sheet
    );

  var lastColumn =
    sheet.getLastColumn();

  var row =
    new Array(
      lastColumn
    ).fill('');

  PAYMENT_PROOF_HEADERS.forEach(
    function(header) {

      var column =
        map[header];

      if (
        column
      ) {

        row[column - 1] =
          record[header] !== undefined
            ? record[header]
            : '';

      }

    }
  );

  sheet
    .appendRow(
      row
    );

}


/* ============================================================
   GET PROOF BY ID
   ============================================================ */

function getPaymentProofById(
  paymentProofId
) {

  try {

    paymentProofId =
      cleanPaymentProofText_(
        paymentProofId
      );

    if (!paymentProofId) {

      return null;

    }

    var sheet =
      getPaymentProofsSheet_();

    var lastRow =
      sheet.getLastRow();

    if (
      lastRow < 2
    ) {

      return null;

    }

    var map =
      getPaymentProofColumnMap_(
        sheet
      );

    var idColumn =
      map.Payment_Proof_ID;

    if (
      !idColumn
    ) {

      return null;

    }

    var values =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          sheet.getLastColumn()
        )
        .getValues();

    for (
      var i = 0;
      i < values.length;
      i++
    ) {

      if (
        String(
          values[i][idColumn - 1]
        ).trim() ===
        paymentProofId
      ) {

        return paymentProofRowToObject_(
          sheet,
          values[i]
        );

      }

    }

    return null;

  } catch (error) {

    return {
      success: false,
      error:
        error.message ||
        String(error)
    };

  }

}


/* ============================================================
   ROW → OBJECT
   ============================================================ */

function paymentProofRowToObject_(
  sheet,
  row
) {

  var map =
    getPaymentProofColumnMap_(
      sheet
    );

  var object = {};

  Object.keys(map).forEach(
    function(header) {

      object[header] =
        row[
          map[header] - 1
        ];

    }
  );

  return object;

}


/* ============================================================
   PAYMENT PROOF HISTORY
   ============================================================ */

function getPaymentProofHistory(
  orderId
) {

  try {

    orderId =
      cleanPaymentProofText_(
        orderId
      );

    if (!orderId) {

      return [];

    }

    var sheet =
      getPaymentProofsSheet_();

    var lastRow =
      sheet.getLastRow();

    if (
      lastRow < 2
    ) {

      return [];

    }

    var values =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          sheet.getLastColumn()
        )
        .getValues();

    return values
      .map(function(row) {

        return paymentProofRowToObject_(
          sheet,
          row
        );

      })
      .filter(function(proof) {

        return (
          cleanPaymentProofText_(
            proof.Order_ID
          ) === orderId
        );

      });

  } catch (error) {

    return {
      success: false,
      error:
        error.message ||
        String(error)
    };

  }

}


/* ============================================================
   TEST
   ============================================================ */

function testPaymentProofsFileUploadValidation() {

  var result =
    submitPaymentProof({

      orderId:
        'TEST-ORD-DOES-NOT-EXIST',

      paymentMethod:
        'GCASH',

      paymentAmount:
        50,

      reference:
        'TEST-FILE-VALIDATION-' +
        Date.now(),

      proofFile: {

        fileName:
          'test.jpg',

        mimeType:
          'image/jpeg',

        dataUrl:
          'data:image/jpeg;base64,'

      }

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

/* ============================================================
   DRIVE AUTHORIZATION TEST
   ============================================================ */

/**
 * Manually run this function from the Apps Script editor.
 *
 * Purpose:
 * - Confirms DriveApp authorization
 * - Confirms the payment-proof folder can be found/created
 * - Does NOT create a payment
 * - Does NOT modify ORDERS
 * - Does NOT modify PAYMENTS
 * - Does NOT create a PAYMENT_PROOFS record
 */
function testPaymentProofDriveAccess() {

  try {

    var folder =
      getPaymentProofFolder_();

    if (!folder) {

      throw new Error(
        'Payment proof folder could not be accessed.'
      );

    }

    Logger.log(
      'Drive authorization: PASS'
    );

    Logger.log(
      'Payment proof folder name: ' +
      folder.getName()
    );

    Logger.log(
      'Payment proof folder ID: ' +
      folder.getId()
    );

    Logger.log(
      'Payment proof folder URL: ' +
      folder.getUrl()
    );

    return {
      success: true,
      folderName: folder.getName(),
      folderId: folder.getId(),
      folderUrl: folder.getUrl()
    };

  } catch (error) {

    Logger.log(
      'Drive authorization: FAIL'
    );

    Logger.log(
      error &&
      error.message
        ? error.message
        : String(error)
    );

    throw error;

  }

}
