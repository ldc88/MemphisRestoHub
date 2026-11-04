/**
 * ============================================================
 * UTOY'S TAPSI
 * PAYMENT METHODS
 * ============================================================
 *
 * PURPOSE
 * -------
 * Central definition and validation of payment methods.
 *
 * CUSTOMER PAYMENT OPTIONS
 * -------------------------
 * ONLINE
 * CASH_ON_DELIVERY
 * PAY_ON_PICKUP
 *
 * ACTUAL PAYMENT METHODS
 * ----------------------
 * CASH
 * GCASH
 * MAYA
 * BANK_TRANSFER
 *
 * IMPORTANT
 * ---------
 * Customer payment options and actual payment methods are
 * intentionally separated.
 *
 * Example:
 *
 * Customer selects:
 *     ONLINE
 *
 * Later the customer may pay using:
 *     GCASH
 *
 * Staff may then verify the payment proof and create a
 * confirmed PAYMENTS record using:
 *     GCASH
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * CUSTOMER PAYMENT OPTIONS
 * ------------------------------------------------------------
 *
 * These are the choices displayed to customers.
 *
 * ------------------------------------------------------------
 */
function getCustomerPaymentOptions() {

  return [
    {
      code: 'ONLINE',
      name: 'Pay Online',
      description: 'Pay online using an available online payment method.',
      requiresPaymentProof: true,
      paymentTiming: 'BEFORE_ORDER_CONFIRMATION'
    },

    {
      code: 'CASH_ON_DELIVERY',
      name: 'Cash on Delivery',
      description: 'Pay in cash when your order is delivered.',
      requiresPaymentProof: false,
      paymentTiming: 'ON_DELIVERY'
    },

    {
      code: 'PAY_ON_PICKUP',
      name: 'Pay on Pick-up',
      description: 'Pay in cash when you collect your order.',
      requiresPaymentProof: false,
      paymentTiming: 'ON_PICKUP'
    }
  ];
}


/**
 * ------------------------------------------------------------
 * ACTUAL PAYMENT METHODS
 * ------------------------------------------------------------
 *
 * These represent the actual payment instruments/tenders.
 *
 * ------------------------------------------------------------
 */
function getActualPaymentMethods() {

  return [
    {
      code: 'CASH',
      name: 'Cash',
      type: 'CASH',
      customerSelectable: false,
      requiresProof: false
    },

    {
      code: 'GCASH',
      name: 'GCash',
      type: 'ONLINE',
      customerSelectable: true,
      requiresProof: true
    },

    {
      code: 'MAYA',
      name: 'Maya',
      type: 'ONLINE',
      customerSelectable: true,
      requiresProof: true
    },

    {
      code: 'BANK_TRANSFER',
      name: 'Bank Transfer',
      type: 'ONLINE',
      customerSelectable: true,
      requiresProof: true
    }
  ];
}


/**
 * ------------------------------------------------------------
 * GET CUSTOMER PAYMENT OPTION
 * ------------------------------------------------------------
 */
function getCustomerPaymentOption(code) {

  var normalizedCode =
    normalizePaymentMethodCode_(code);

  var options =
    getCustomerPaymentOptions();

  for (var i = 0; i < options.length; i++) {

    if (options[i].code === normalizedCode) {
      return options[i];
    }

  }

  return null;
}


/**
 * ------------------------------------------------------------
 * GET ACTUAL PAYMENT METHOD
 * ------------------------------------------------------------
 */
function getActualPaymentMethod(code) {

  var normalizedCode =
    normalizePaymentMethodCode_(code);

  var methods =
    getActualPaymentMethods();

  for (var i = 0; i < methods.length; i++) {

    if (methods[i].code === normalizedCode) {
      return methods[i];
    }

  }

  return null;
}


/**
 * ------------------------------------------------------------
 * VALIDATE CUSTOMER PAYMENT OPTION
 * ------------------------------------------------------------
 *
 * Returns true when the supplied option is valid.
 *
 * ------------------------------------------------------------
 */
function isValidCustomerPaymentOption(code) {

  return getCustomerPaymentOption(code) !== null;
}


/**
 * ------------------------------------------------------------
 * VALIDATE ACTUAL PAYMENT METHOD
 * ------------------------------------------------------------
 */
function isValidActualPaymentMethod(code) {

  return getActualPaymentMethod(code) !== null;
}


/**
 * ------------------------------------------------------------
 * NORMALIZE PAYMENT METHOD CODE
 * ------------------------------------------------------------
 *
 * Converts:
 *
 * " cash "
 * "Cash"
 * "cash"
 *
 * into:
 *
 * CASH
 *
 * ------------------------------------------------------------
 */
function normalizePaymentMethodCode_(code) {

  if (code === null || code === undefined) {
    return '';
  }

  return String(code)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}


/**
 * ------------------------------------------------------------
 * VALIDATE PAYMENT METHOD FOR CUSTOMER ORDER
 * ------------------------------------------------------------
 *
 * This validates the payment option selected during checkout.
 *
 * ------------------------------------------------------------
 */
function validateCustomerPaymentOption(code) {

  var normalizedCode =
    normalizePaymentMethodCode_(code);

  var option =
    getCustomerPaymentOption(normalizedCode);

  if (!option) {

    throw new Error(
      'Invalid customer payment option: ' +
      normalizedCode
    );

  }

  return option;
}


/**
 * ------------------------------------------------------------
 * VALIDATE ACTUAL PAYMENT METHOD
 * ------------------------------------------------------------
 *
 * This validates the actual method used when a payment is
 * recorded in PAYMENTS.
 *
 * ------------------------------------------------------------
 */
function validateActualPaymentMethod(code) {

  var normalizedCode =
    normalizePaymentMethodCode_(code);

  var method =
    getActualPaymentMethod(normalizedCode);

  if (!method) {

    throw new Error(
      'Invalid payment method: ' +
      normalizedCode
    );

  }

  return method;
}


/**
 * ------------------------------------------------------------
 * GET ONLINE PAYMENT METHODS
 * ------------------------------------------------------------
 *
 * Used later by the customer website.
 *
 * Returns only online methods that require payment proof.
 *
 * ------------------------------------------------------------
 */
function getOnlinePaymentMethods() {

  return getActualPaymentMethods().filter(
    function(method) {
      return (
        method.type === 'ONLINE' &&
        method.customerSelectable === true
      );
    }
  );

}


/**
 * ------------------------------------------------------------
 * CHECK IF PAYMENT OPTION REQUIRES PROOF
 * ------------------------------------------------------------
 */
function paymentOptionRequiresProof(code) {

  var option =
    getCustomerPaymentOption(code);

  if (!option) {
    return false;
  }

  return option.requiresPaymentProof === true;
}


/**
 * ------------------------------------------------------------
 * CHECK IF ACTUAL PAYMENT METHOD REQUIRES PROOF
 * ------------------------------------------------------------
 */
function actualPaymentMethodRequiresProof(code) {

  var method =
    getActualPaymentMethod(code);

  if (!method) {
    return false;
  }

  return method.requiresProof === true;
}


/**
 * ------------------------------------------------------------
 * GET CUSTOMER PAYMENT OPTION LABEL
 * ------------------------------------------------------------
 */
function getCustomerPaymentOptionLabel(code) {

  var option =
    getCustomerPaymentOption(code);

  return option
    ? option.name
    : '';
}


/**
 * ------------------------------------------------------------
 * GET ACTUAL PAYMENT METHOD LABEL
 * ------------------------------------------------------------
 */
function getActualPaymentMethodLabel(code) {

  var method =
    getActualPaymentMethod(code);

  return method
    ? method.name
    : '';
}


/**
 * ============================================================
 * TESTS
 * ============================================================
 *
 * These tests are READ-ONLY.
 *
 * They do not create orders or payments.
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * TEST PAYMENT METHODS
 * ------------------------------------------------------------
 */
function testPaymentMethods() {

  Logger.log(
    '========================================'
  );

  Logger.log(
    'PAYMENT METHODS TEST'
  );

  Logger.log(
    '========================================'
  );


  /**
   * ----------------------------------------------------------
   * CUSTOMER OPTIONS
   * ----------------------------------------------------------
   */
  var customerOptions =
    getCustomerPaymentOptions();

  Logger.log(
    'Customer payment options: ' +
    customerOptions.length
  );

  customerOptions.forEach(
    function(option) {

      Logger.log(
        option.code +
        ' | ' +
        option.name +
        ' | Proof=' +
        option.requiresPaymentProof +
        ' | Timing=' +
        option.paymentTiming
      );

    }
  );


  /**
   * ----------------------------------------------------------
   * EXPECTED CUSTOMER OPTIONS
   * ----------------------------------------------------------
   */
  var expectedCustomerOptions = [
    'ONLINE',
    'CASH_ON_DELIVERY',
    'PAY_ON_PICKUP'
  ];

  expectedCustomerOptions.forEach(
    function(code) {

      Logger.log(
        'Customer option "' +
        code +
        '": ' +
        (
          isValidCustomerPaymentOption(code)
            ? 'PASS'
            : 'FAIL'
        )
      );

    }
  );


  /**
   * ----------------------------------------------------------
   * ACTUAL PAYMENT METHODS
   * ----------------------------------------------------------
   */
  var actualMethods =
    getActualPaymentMethods();

  Logger.log(
    'Actual payment methods: ' +
    actualMethods.length
  );

  actualMethods.forEach(
    function(method) {

      Logger.log(
        method.code +
        ' | ' +
        method.name +
        ' | Type=' +
        method.type +
        ' | Proof=' +
        method.requiresProof
      );

    }
  );


  /**
   * ----------------------------------------------------------
   * EXPECTED ACTUAL METHODS
   * ----------------------------------------------------------
   */
  var expectedActualMethods = [
    'CASH',
    'GCASH',
    'MAYA',
    'BANK_TRANSFER'
  ];

  expectedActualMethods.forEach(
    function(code) {

      Logger.log(
        'Actual method "' +
        code +
        '": ' +
        (
          isValidActualPaymentMethod(code)
            ? 'PASS'
            : 'FAIL'
        )
      );

    }
  );


  /**
   * ----------------------------------------------------------
   * NORMALIZATION TEST
   * ----------------------------------------------------------
   */
  Logger.log(
    'Normalization " cash ": ' +
    (
      normalizePaymentMethodCode_(' cash ') === 'CASH'
        ? 'PASS'
        : 'FAIL'
    )
  );

  Logger.log(
    'Normalization "Cash On Delivery": ' +
    (
      normalizePaymentMethodCode_(
        'Cash On Delivery'
      ) === 'CASH_ON_DELIVERY'
        ? 'PASS'
        : 'FAIL'
    )
  );


  /**
   * ----------------------------------------------------------
   * PROOF TEST
   * ----------------------------------------------------------
   */
  Logger.log(
    'ONLINE requires proof: ' +
    (
      paymentOptionRequiresProof('ONLINE')
        ? 'PASS'
        : 'FAIL'
    )
  );

  Logger.log(
    'CASH_ON_DELIVERY requires no proof: ' +
    (
      !paymentOptionRequiresProof(
        'CASH_ON_DELIVERY'
      )
        ? 'PASS'
        : 'FAIL'
    )
  );

  Logger.log(
    'GCASH requires proof: ' +
    (
      actualPaymentMethodRequiresProof('GCASH')
        ? 'PASS'
        : 'FAIL'
    )
  );

  Logger.log(
    'CASH requires no proof: ' +
    (
      !actualPaymentMethodRequiresProof('CASH')
        ? 'PASS'
        : 'FAIL'
    )
  );


  /**
   * ----------------------------------------------------------
   * ONLINE METHODS
   * ----------------------------------------------------------
   */
  var onlineMethods =
    getOnlinePaymentMethods();

  Logger.log(
    'Online payment methods available: ' +
    onlineMethods.length
  );

  onlineMethods.forEach(
    function(method) {

      Logger.log(
        'Online method: ' +
        method.code +
        ' - ' +
        method.name
      );

    }
  );


  Logger.log(
    '========================================'
  );

  Logger.log(
    'PAYMENT METHODS TEST COMPLETE'
  );

  Logger.log(
    '========================================'
  );
}
