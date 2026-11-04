/**
 * ============================================================
 * UTOY'S TAPSI
 * PAYMENT TESTS
 * ============================================================
 *
 * READ-ONLY TESTS ONLY
 *
 * These tests do NOT:
 * - create payments
 * - modify orders
 * - create test orders
 * - modify production data
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * TEST PAYMENT PROCESSING FOUNDATION
 * ------------------------------------------------------------
 */
function testPaymentProcessing() {

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var paymentsSheet = ss.getSheetByName(
    CONFIG.PAYMENTS_SHEET
  );

  if (!paymentsSheet) {
    throw new Error(
      'PAYMENTS sheet not found.'
    );
  }

  var paymentValues =
    paymentsSheet.getDataRange().getValues();

  var paymentHeaders =
    paymentValues.length > 0
      ? paymentValues[0].map(function(header) {
          return String(header).trim();
        })
      : [];

  var expectedHeaders = [
    'Payment_ID',
    'Order_ID',
    'Payment_Date',
    'Payment_Method',
    'Payment_Amount',
    'Payment_Status',
    'Reference'
  ];

  Logger.log(
    'PAYMENTS column count: ' +
    paymentHeaders.length
  );

  Logger.log(
    'Expected column count: ' +
    expectedHeaders.length
  );

  var headersMatch =
    JSON.stringify(paymentHeaders) ===
    JSON.stringify(expectedHeaders);

  Logger.log(
    'PAYMENTS exact headers: ' +
    (headersMatch ? 'PASS' : 'FAIL')
  );

  /**
   * ----------------------------------------------------------
   * ORDERS PAYMENT COLUMNS
   * ----------------------------------------------------------
   */
  var ordersSheet = ss.getSheetByName(
    CONFIG.ORDERS_SHEET
  );

  if (!ordersSheet) {
    throw new Error(
      'ORDERS sheet not found.'
    );
  }

  var orderValues =
    ordersSheet.getDataRange().getValues();

  var orderHeaders =
    orderValues.length > 0
      ? orderValues[0].map(function(header) {
          return String(header).trim();
        })
      : [];

  var requiredOrderHeaders = [
    'Order_ID',
    'Total',
    'Payment_Status'
  ];

  requiredOrderHeaders.forEach(function(header) {

    Logger.log(
      'ORDERS required header "' +
      header +
      '": ' +
      (
        orderHeaders.indexOf(header) !== -1
          ? 'PASS'
          : 'FAIL'
      )
    );

  });

  /**
   * ----------------------------------------------------------
   * RECORD COUNT
   * ----------------------------------------------------------
   */
  var paymentRecordCount =
    Math.max(0, paymentValues.length - 1);

  Logger.log(
    'Existing payment records: ' +
    paymentRecordCount
  );

  /**
   * ----------------------------------------------------------
   * FUNCTION AVAILABILITY
   * ----------------------------------------------------------
   */
  Logger.log(
    'createPayment(): ' +
    (
      typeof createPayment === 'function'
        ? 'AVAILABLE'
        : 'MISSING'
    )
  );

  Logger.log(
    'getPaymentHistory(): ' +
    (
      typeof getPaymentHistory === 'function'
        ? 'AVAILABLE'
        : 'MISSING'
    )
  );

  Logger.log(
    'getPaymentSummaryForOrder(): ' +
    (
      typeof getPaymentSummaryForOrder === 'function'
        ? 'AVAILABLE'
        : 'MISSING'
    )
  );

  /**
   * ----------------------------------------------------------
   * GENERATOR TEST
   * ----------------------------------------------------------
   */
  var paymentId1 = generatePaymentId();
  var paymentId2 = generatePaymentId();

  Logger.log(
    'Generated payment ID 1: ' +
    paymentId1
  );

  Logger.log(
    'Generated payment ID 2: ' +
    paymentId2
  );

  Logger.log(
    'Payment ID generator uniqueness test: ' +
    (
      paymentId1 !== paymentId2
        ? 'PASS'
        : 'CHECK'
    )
  );

  Logger.log(
    'Payment processing foundation test complete.'
  );
}


/**
 * ------------------------------------------------------------
 * TEST PAYMENT DATA INTEGRITY
 * ------------------------------------------------------------
 *
 * Read-only.
 *
 * Checks:
 * - Payment IDs
 * - Duplicate payment IDs
 * - Order linkage
 * - Amounts
 * - Payment status
 * - Order payment status consistency
 *
 * ------------------------------------------------------------
 */
function testPaymentIntegrity() {

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var paymentsSheet = ss.getSheetByName(
    CONFIG.PAYMENTS_SHEET
  );

  var ordersSheet = ss.getSheetByName(
    CONFIG.ORDERS_SHEET
  );

  if (!paymentsSheet) {
    throw new Error(
      'PAYMENTS sheet not found.'
    );
  }

  if (!ordersSheet) {
    throw new Error(
      'ORDERS sheet not found.'
    );
  }

  /**
   * ----------------------------------------------------------
   * READ ORDERS
   * ----------------------------------------------------------
   */
  var orderValues =
    ordersSheet.getDataRange().getValues();

  var orderHeaders =
    orderValues[0].map(function(header) {
      return String(header).trim();
    });

  var orderIdIndex =
    orderHeaders.indexOf('Order_ID');

  var orderTotalIndex =
    orderHeaders.indexOf('Total');

  var orderPaymentStatusIndex =
    orderHeaders.indexOf('Payment_Status');

  if (
    orderIdIndex === -1 ||
    orderTotalIndex === -1 ||
    orderPaymentStatusIndex === -1
  ) {

    throw new Error(
      'ORDERS is missing required payment columns.'
    );

  }

  var ordersById = {};

  for (var i = 1; i < orderValues.length; i++) {

    var currentOrderId =
      String(
        orderValues[i][orderIdIndex]
      ).trim();

    if (!currentOrderId) {
      continue;
    }

    ordersById[currentOrderId] = {
      total: Number(
        orderValues[i][orderTotalIndex]
      ),
      paymentStatus: String(
        orderValues[i][orderPaymentStatusIndex]
      ).trim().toUpperCase()
    };

  }

  /**
   * ----------------------------------------------------------
   * READ PAYMENTS
   * ----------------------------------------------------------
   */
  var paymentValues =
    paymentsSheet.getDataRange().getValues();

  if (paymentValues.length < 2) {

    Logger.log(
      'No payment records to validate.'
    );

    return;
  }

  var paymentHeaders =
    paymentValues[0].map(function(header) {
      return String(header).trim();
    });

  var paymentIdIndex =
    paymentHeaders.indexOf('Payment_ID');

  var paymentOrderIdIndex =
    paymentHeaders.indexOf('Order_ID');

  var paymentAmountIndex =
    paymentHeaders.indexOf('Payment_Amount');

  var paymentStatusIndex =
    paymentHeaders.indexOf('Payment_Status');

  if (
    paymentIdIndex === -1 ||
    paymentOrderIdIndex === -1 ||
    paymentAmountIndex === -1 ||
    paymentStatusIndex === -1
  ) {

    throw new Error(
      'PAYMENTS is missing required columns.'
    );

  }

  var paymentIds = {};
  var paymentsByOrder = {};

  var duplicateIds = 0;
  var missingOrders = 0;
  var invalidAmounts = 0;
  var invalidStatuses = 0;

  for (var p = 1; p < paymentValues.length; p++) {

    var paymentId =
      String(
        paymentValues[p][paymentIdIndex]
      ).trim();

    var paymentOrderId =
      String(
        paymentValues[p][paymentOrderIdIndex]
      ).trim();

    var paymentAmount =
      Number(
        paymentValues[p][paymentAmountIndex]
      );

    var paymentStatus =
      String(
        paymentValues[p][paymentStatusIndex]
      ).trim().toUpperCase();

    /**
     * Payment ID
     */
    if (!paymentId) {

      duplicateIds++;

    } else if (paymentIds[paymentId]) {

      duplicateIds++;

    } else {

      paymentIds[paymentId] = true;

    }

    /**
     * Order linkage
     */
    if (!paymentOrderId || !ordersById[paymentOrderId]) {

      missingOrders++;

    }

    /**
     * Amount
     */
    if (!isFinite(paymentAmount) || paymentAmount <= 0) {

      invalidAmounts++;

    }

    /**
     * Status
     */
    if (paymentStatus !== 'PAID') {

      invalidStatuses++;

    }

    /**
     * Group by order
     */
    if (!paymentsByOrder[paymentOrderId]) {
      paymentsByOrder[paymentOrderId] = [];
    }

    paymentsByOrder[paymentOrderId].push({
      amount: paymentAmount,
      status: paymentStatus
    });

  }

  Logger.log(
    'Duplicate/missing payment IDs: ' +
    duplicateIds
  );

  Logger.log(
    'Payments linked to missing orders: ' +
    missingOrders
  );

  Logger.log(
    'Invalid payment amounts: ' +
    invalidAmounts
  );

  Logger.log(
    'Unexpected payment statuses: ' +
    invalidStatuses
  );

  /**
   * ----------------------------------------------------------
   * CHECK ORDER PAYMENT STATUS CONSISTENCY
   * ----------------------------------------------------------
   */
  var inconsistentOrders = 0;

  Object.keys(paymentsByOrder).forEach(function(orderId) {

    var order = ordersById[orderId];

    if (!order) {
      return;
    }

    var paidAmount = 0;

    paymentsByOrder[orderId].forEach(function(payment) {

      if (payment.status === 'PAID') {
        paidAmount += payment.amount;
      }

    });

    paidAmount = roundMoney(paidAmount);

    var orderTotal = roundMoney(order.total);

    if (paidAmount > orderTotal) {

      inconsistentOrders++;

      Logger.log(
        'OVERPAID ORDER: ' +
        orderId +
        ' | Paid=' +
        paidAmount +
        ' | Total=' +
        orderTotal
      );

      return;
    }

    var expectedStatus =
      getOrderPaymentStatus(
        paidAmount,
        orderTotal
      );

    if (
      order.paymentStatus !== expectedStatus
    ) {

      inconsistentOrders++;

      Logger.log(
        'STATUS MISMATCH: ' +
        orderId +
        ' | ORDERS=' +
        order.paymentStatus +
        ' | EXPECTED=' +
        expectedStatus
      );

    }

  });

  Logger.log(
    'Order payment-status inconsistencies: ' +
    inconsistentOrders
  );

  Logger.log(
    'Payment integrity test complete.'
  );

  Logger.log(
    'Overall integrity result: ' +
    (
      duplicateIds === 0 &&
      missingOrders === 0 &&
      invalidAmounts === 0 &&
      invalidStatuses === 0 &&
      inconsistentOrders === 0
        ? 'PASS'
        : 'CHECK'
    )
  );
}


/**
 * ------------------------------------------------------------
 * TEST PAYMENT SUMMARY
 * ------------------------------------------------------------
 *
 * Automatically selects the first existing payment's order.
 *
 * Read-only.
 *
 * ------------------------------------------------------------
 */
function testPaymentSummaryReadOnly() {

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName(
    CONFIG.PAYMENTS_SHEET
  );

  if (!sheet) {
    throw new Error(
      'PAYMENTS sheet not found.'
    );
  }

  var values =
    sheet.getDataRange().getValues();

  if (values.length < 2) {

    Logger.log(
      'No payment records available for summary test.'
    );

    return;
  }

  var headers =
    values[0].map(function(header) {
      return String(header).trim();
    });

  var orderIdIndex =
    headers.indexOf('Order_ID');

  if (orderIdIndex === -1) {
    throw new Error(
      'PAYMENTS is missing Order_ID.'
    );
  }

  var orderId = '';

  for (var i = 1; i < values.length; i++) {

    var candidate =
      String(
        values[i][orderIdIndex]
      ).trim();

    if (candidate) {
      orderId = candidate;
      break;
    }

  }

  if (!orderId) {

    Logger.log(
      'No valid payment order found.'
    );

    return;
  }

  var result =
    getPaymentSummaryForOrder(orderId);

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  Logger.log(
    'Payment summary test complete.'
  );
}
