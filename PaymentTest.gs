/**
 * ============================================================
 * UTOY'S TAPSI
 * PAYMENT PROCESSING ENGINE
 * ============================================================
 *
 * PURPOSE
 * -------
 * Handles confirmed payment transactions only.
 *
 * IMPORTANT
 * ---------
 * Customer payment proof uploads will NOT directly create
 * confirmed payments.
 *
 * Future flow:
 *
 * CUSTOMER
 *   ↓
 * PAYMENT_PROOFS
 *   ↓
 * STAFF VERIFICATION
 *   ↓
 * APPROVED
 *   ↓
 * createPayment()
 *   ↓
 * PAYMENTS
 *   ↓
 * ORDERS.Payment_Status
 *
 * Existing production PAYMENTS schema is preserved:
 *
 * Payment_ID
 * Order_ID
 * Payment_Date
 * Payment_Method
 * Payment_Amount
 * Payment_Status
 * Reference
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CREATE PAYMENT
 * ------------------------------------------------------------
 *
 * Creates a confirmed payment for an existing order.
 *
 * Supports:
 * - Full payment
 * - Partial payment
 * - Multiple payments against one order
 * - Duplicate reference protection
 * - Overpayment protection
 * - Concurrent transaction protection
 *
 * Order payment status:
 * - UNPAID
 * - PARTIAL
 * - PAID
 *
 * PAYMENTS.Payment_Status:
 * - PAID
 *
 * ------------------------------------------------------------
 */
function createPayment(paymentData) {

  var lock = LockService.getScriptLock();

  try {

    if (!paymentData || typeof paymentData !== 'object') {
      throw new Error('Payment data is required.');
    }

    var orderId = cleanText(paymentData.orderId);
    var paymentMethod = cleanText(paymentData.paymentMethod).toUpperCase();
    var reference = cleanText(paymentData.reference);

    var paymentAmount = Number(paymentData.paymentAmount);

    if (!orderId) {
      throw new Error('Order ID is required.');
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required.');
    }

    if (!isFinite(paymentAmount)) {
      throw new Error('Payment amount must be a valid number.');
    }

    paymentAmount = roundMoney(paymentAmount);

    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    /**
     * --------------------------------------------------------
     * LOCK THE ENTIRE PAYMENT TRANSACTION
     * --------------------------------------------------------
     *
     * The lock must be acquired BEFORE reading the order and
     * existing payments so another payment cannot modify the
     * same order between validation and write.
     *
     * --------------------------------------------------------
     */
    lock.waitLock(15000);

    try {

      /**
       * ------------------------------------------------------
       * LOAD ORDER
       * ------------------------------------------------------
       */
      var order = getOrderById(ss, orderId);

      if (!order) {
        throw new Error('Order not found: ' + orderId);
      }

      var orderTotal = Number(order.Total);

      if (!isFinite(orderTotal)) {
        throw new Error('Order total is invalid for order ' + orderId + '.');
      }

      orderTotal = roundMoney(orderTotal);

      if (orderTotal <= 0) {
        throw new Error(
          'Order total must be greater than zero for payment processing.'
        );
      }

      /**
       * ------------------------------------------------------
       * ENSURE PAYMENTS SHEET
       * ------------------------------------------------------
       */
      var paymentsSheet = getOrCreateSheet(ss,CONFIG.PAYMENTS_SHEET);

      ensureHeaders(
        paymentsSheet,
        [
          'Payment_ID',
          'Order_ID',
          'Payment_Date',
          'Payment_Method',
          'Payment_Amount',
          'Payment_Status',
          'Reference'
        ]
      );

      /**
       * ------------------------------------------------------
       * RELOAD EXISTING PAYMENTS INSIDE LOCK
       * ------------------------------------------------------
       */
      var payments = getPaymentsForOrder(ss, orderId);

      var paidAmount = calculatePaidAmount_(payments);

      /**
       * ------------------------------------------------------
       * DATA INTEGRITY CHECK
       * ------------------------------------------------------
       */
      if (paidAmount > orderTotal) {
        throw new Error(
          'Payment data integrity error: existing paid amount (' +
          paidAmount.toFixed(2) +
          ') exceeds order total (' +
          orderTotal.toFixed(2) +
          ').'
        );
      }

      var remainingAmount = roundMoney(orderTotal - paidAmount);

      /**
       * ------------------------------------------------------
       * ALREADY FULLY PAID
       * ------------------------------------------------------
       */
      if (remainingAmount <= 0) {
        throw new Error(
          'Order ' + orderId + ' is already fully paid.'
        );
      }

      /**
       * ------------------------------------------------------
       * OVERPAYMENT PROTECTION
       * ------------------------------------------------------
       */
      if (paymentAmount > remainingAmount) {
        throw new Error(
          'Payment amount exceeds the remaining balance of ' +
          remainingAmount.toFixed(2) +
          '.'
        );
      }

      /**
       * ------------------------------------------------------
       * DUPLICATE REFERENCE PROTECTION
       * ------------------------------------------------------
       *
       * IMPORTANT:
       * This check is intentionally INSIDE the lock.
       *
       * This prevents two simultaneous requests from using the
       * same payment reference.
       *
       * Comparison is case-insensitive and ignores surrounding
       * whitespace.
       *
       * ------------------------------------------------------
       */
      if (reference) {

        var normalizedReference = reference.toUpperCase();

        for (var i = 0; i < payments.length; i++) {

          var existingReference = cleanText(
            payments[i].Reference
          );

          if (
            existingReference &&
            existingReference.toUpperCase() === normalizedReference
          ) {

            throw new Error(
              'A payment with reference "' +
              reference +
              '" already exists for this order.'
            );
          }
        }
      }

      /**
       * ------------------------------------------------------
       * DETERMINE RESULTING PAYMENT STATUS
       * ------------------------------------------------------
       */
      var finalPaidAmount = roundMoney(
        paidAmount + paymentAmount
      );

      var finalPaymentStatus = getOrderPaymentStatus(
        finalPaidAmount,
        orderTotal
      );

      /**
       * ------------------------------------------------------
       * GENERATE UNIQUE PAYMENT ID
       * ------------------------------------------------------
       */
      var paymentId = generateUniquePaymentId_(ss);

      /**
       * ------------------------------------------------------
       * CREATE PAYMENT RECORD
       * ------------------------------------------------------
       */
      appendObjectRow(
        paymentsSheet,
        {
          Payment_ID: paymentId,
          Order_ID: orderId,
          Payment_Date: new Date(),
          Payment_Method: paymentMethod,
          Payment_Amount: paymentAmount,
          Payment_Status: 'PAID',
          Reference: reference
        }
      );

      /**
       * ------------------------------------------------------
       * UPDATE ORDER PAYMENT STATUS
       * ------------------------------------------------------
       */
      updateOrderPaymentStatus(
        ss,
        orderId,
        finalPaymentStatus
      );

      /**
       * ------------------------------------------------------
       * RETURN PAYMENT RESULT
       * ------------------------------------------------------
       */
      var finalRemainingAmount = roundMoney(
        orderTotal - finalPaidAmount
      );

      return {
        success: true,
        paymentId: paymentId,
        orderId: orderId,
        paymentMethod: paymentMethod,
        paymentAmount: paymentAmount,
        orderTotal: orderTotal,
        paidAmount: finalPaidAmount,
        remainingAmount: finalRemainingAmount,
        paymentStatus: finalPaymentStatus,
        reference: reference
      };

    } finally {

      lock.releaseLock();

    }

  } catch (error) {

    return {
      success: false,
      error: error.message || String(error)
    };

  }
}


/**
 * ------------------------------------------------------------
 * GENERATE PAYMENT ID
 * ------------------------------------------------------------
 *
 * Format:
 *
 * PAY-yyyyMMdd-HHmmss-random3
 *
 * Example:
 *
 * PAY-20260906-003540-481
 *
 * ------------------------------------------------------------
 */
function generatePaymentId() {

  var now = new Date();

  var timezone = Session.getScriptTimeZone();

  var timestamp = Utilities.formatDate(
    now,
    timezone,
    'yyyyMMdd-HHmmss'
  );

  var randomPart = Math.floor(
    100 + Math.random() * 900
  );

  return 'PAY-' + timestamp + '-' + randomPart;
}


/**
 * ------------------------------------------------------------
 * GENERATE UNIQUE PAYMENT ID
 * ------------------------------------------------------------
 *
 * The existing ID format is preserved, but we additionally
 * check the sheet for collisions.
 *
 * ------------------------------------------------------------
 */
function generateUniquePaymentId_(ss) {

  for (var attempt = 0; attempt < 20; attempt++) {

    var candidate = generatePaymentId();

    if (!paymentIdExists_(ss, candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Unable to generate a unique payment ID.'
  );
}


/**
 * ------------------------------------------------------------
 * CHECK PAYMENT ID EXISTENCE
 * ------------------------------------------------------------
 */
function paymentIdExists_(ss, paymentId) {

  var sheet = ss.getSheetByName(
    CONFIG.PAYMENTS_SHEET
  );

  if (!sheet) {
    return false;
  }

  var values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return false;
  }

  var headers = values[0].map(function(header) {
    return String(header).trim();
  });

  var paymentIdIndex = headers.indexOf('Payment_ID');

  if (paymentIdIndex === -1) {
    return false;
  }

  for (var i = 1; i < values.length; i++) {

    if (
      String(values[i][paymentIdIndex]).trim() ===
      paymentId
    ) {
      return true;
    }
  }

  return false;
}


/**
 * ------------------------------------------------------------
 * GET ORDER BY ID
 * ------------------------------------------------------------
 */
function getOrderById(ss, orderId) {

  var sheet = ss.getSheetByName(
    CONFIG.ORDERS_SHEET
  );

  if (!sheet) {
    throw new Error(
      'ORDERS sheet not found.'
    );
  }

  var values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  var headers = values[0].map(function(header) {
    return String(header).trim();
  });

  var orderIdIndex = headers.indexOf('Order_ID');

  if (orderIdIndex === -1) {
    throw new Error(
      'ORDERS sheet is missing Order_ID column.'
    );
  }

  var targetOrderId = cleanText(orderId);

  for (var i = 1; i < values.length; i++) {

    if (
      String(values[i][orderIdIndex]).trim() ===
      targetOrderId
    ) {

      var record = {};

      headers.forEach(function(header, index) {
        record[header] = values[i][index];
      });

      return record;
    }
  }

  return null;
}


/**
 * ------------------------------------------------------------
 * GET PAYMENTS FOR ORDER
 * ------------------------------------------------------------
 */
function getPaymentsForOrder(ss, orderId) {

  var sheet = ss.getSheetByName(
    CONFIG.PAYMENTS_SHEET
  );

  if (!sheet) {
    return [];
  }

  var values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  var headers = values[0].map(function(header) {
    return String(header).trim();
  });

  var orderIdIndex = headers.indexOf('Order_ID');

  if (orderIdIndex === -1) {
    throw new Error(
      'PAYMENTS sheet is missing Order_ID column.'
    );
  }

  var targetOrderId = cleanText(orderId);

  var results = [];

  for (var i = 1; i < values.length; i++) {

    if (
      String(values[i][orderIdIndex]).trim() ===
      targetOrderId
    ) {

      var record = {};

      headers.forEach(function(header, index) {
        record[header] = values[i][index];
      });

      results.push(record);
    }
  }

  return results;
}


/**
 * ------------------------------------------------------------
 * CALCULATE PAID AMOUNT
 * ------------------------------------------------------------
 *
 * Only confirmed PAID transactions are included.
 *
 * ------------------------------------------------------------
 */
function calculatePaidAmount_(payments) {

  var total = 0;

  payments.forEach(function(payment) {

    var status = cleanText(
      payment.Payment_Status
    ).toUpperCase();

    if (status !== 'PAID') {
      return;
    }

    var amount = Number(
      payment.Payment_Amount
    );

    if (!isFinite(amount) || amount <= 0) {

      throw new Error(
        'Invalid PAID payment amount found for payment "' +
        cleanText(payment.Payment_ID) +
        '".'
      );
    }

    total += amount;
  });

  return roundMoney(total);
}


/**
 * ------------------------------------------------------------
 * GET ORDER PAYMENT STATUS
 * ------------------------------------------------------------
 *
 * Internal system values:
 *
 * UNPAID
 * PARTIAL
 * PAID
 *
 * Customer/staff UI can later display:
 *
 * UNPAID
 * PARTIAL PAYMENT
 * FULLY PAID
 *
 * ------------------------------------------------------------
 */
function getOrderPaymentStatus(
  paidAmount,
  orderTotal
) {

  paidAmount = roundMoney(
    Number(paidAmount) || 0
  );

  orderTotal = roundMoney(
    Number(orderTotal) || 0
  );

  if (paidAmount <= 0) {
    return 'UNPAID';
  }

  if (paidAmount >= orderTotal) {
    return 'PAID';
  }

  return 'PARTIAL';
}


/**
 * ------------------------------------------------------------
 * UPDATE ORDER PAYMENT STATUS
 * ------------------------------------------------------------
 */
function updateOrderPaymentStatus(
  ss,
  orderId,
  paymentStatus
) {

  var sheet = ss.getSheetByName(
    CONFIG.ORDERS_SHEET
  );

  if (!sheet) {
    throw new Error(
      'ORDERS sheet not found.'
    );
  }

  var values = sheet.getDataRange().getValues();

  if (values.length < 1) {
    throw new Error(
      'ORDERS sheet has no header row.'
    );
  }

  var headers = values[0].map(function(header) {
    return String(header).trim();
  });

  var orderIdIndex = headers.indexOf('Order_ID');
  var paymentStatusIndex = headers.indexOf('Payment_Status');

  if (orderIdIndex === -1) {
    throw new Error(
      'ORDERS sheet is missing Order_ID column.'
    );
  }

  if (paymentStatusIndex === -1) {
    throw new Error(
      'ORDERS sheet is missing Payment_Status column.'
    );
  }

  for (var i = 1; i < values.length; i++) {

    if (
      String(values[i][orderIdIndex]).trim() ===
      cleanText(orderId)
    ) {

      sheet
        .getRange(
          i + 1,
          paymentStatusIndex + 1
        )
        .setValue(paymentStatus);

      return true;
    }
  }

  throw new Error(
    'Unable to update payment status. Order not found: ' +
    orderId
  );
}


/**
 * ------------------------------------------------------------
 * GET PAYMENT HISTORY
 * ------------------------------------------------------------
 *
 * Read-only function for future staff/customer interfaces.
 *
 * ------------------------------------------------------------
 */
function getPaymentHistory(orderId) {

  try {

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var order = getOrderById(
      ss,
      orderId
    );

    if (!order) {
      throw new Error(
        'Order not found: ' + orderId
      );
    }

    var payments = getPaymentsForOrder(
      ss,
      orderId
    );

    return {
      success: true,
      orderId: orderId,
      payments: payments
    };

  } catch (error) {

    return {
      success: false,
      error: error.message || String(error)
    };

  }
}


/**
 * ------------------------------------------------------------
 * GET PAYMENT SUMMARY FOR ORDER
 * ------------------------------------------------------------
 *
 * Read-only helper for:
 *
 * - Staff dashboard
 * - Customer order status
 * - Payment verification
 * - Payment history
 * - Future reporting
 *
 * ------------------------------------------------------------
 */
function getPaymentSummaryForOrder(orderId) {

  try {

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var order = getOrderById(
      ss,
      orderId
    );

    if (!order) {
      throw new Error(
        'Order not found: ' + orderId
      );
    }

    var orderTotal = roundMoney(
      Number(order.Total)
    );

    if (!isFinite(orderTotal)) {
      throw new Error(
        'Order total is invalid.'
      );
    }

    var payments = getPaymentsForOrder(
      ss,
      orderId
    );

    var paidAmount = calculatePaidAmount_(
      payments
    );

    if (paidAmount > orderTotal) {
      throw new Error(
        'Payment data integrity error: paid amount exceeds order total.'
      );
    }

    var remainingAmount = roundMoney(
      orderTotal - paidAmount
    );

    var paymentStatus = getOrderPaymentStatus(
      paidAmount,
      orderTotal
    );

    return {
      success: true,
      orderId: orderId,
      orderTotal: orderTotal,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      paymentStatus: paymentStatus,
      paymentCount: payments.length,
      payments: payments
    };

  } catch (error) {

    return {
      success: false,
      error: error.message || String(error)
    };

  }
}
