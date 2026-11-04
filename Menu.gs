/**
 * =========================================
 * UTOY'S TAPSI
 * ORDER PROCESSING ENGINE
 * =========================================
 *
 * Handles:
 *
 * 1. Checkout validation
 * 2. Menu price verification
 * 3. Order ID generation
 * 4. ORDERS record
 * 5. ORDER_ITEMS records
 * 6. Server-side total calculation
 * 7. ORDERS verification
 *
 * =========================================
 */


/**
 * =========================================
 * SUBMIT ORDER
 * =========================================
 */

function submitOrder(orderData) {

  try {

    if (!orderData) {

      throw new Error(
        'No order information was received.'
      );

    }


    /*
     * Validate customer information
     */

    var customerName =
      cleanText(
        orderData.customerName
      );

    var customerPhone =
      cleanText(
        orderData.customerPhone
      );

    var orderType =
      cleanText(
        orderData.orderType
      );

    var paymentMethod =
      cleanText(
        orderData.paymentMethod
      );

    var customerNotes =
      cleanText(
        orderData.customerNotes
      );

    var tableId =
      cleanText(
        orderData.tableId
      );


    if (!customerName) {

      throw new Error(
        'Customer name is required.'
      );

    }


    if (!orderType) {

      throw new Error(
        'Please select an order type.'
      );

    }


    if (!paymentMethod) {

      throw new Error(
        'Please select a payment method.'
      );

    }


    /*
     * Validate cart
     */

    var submittedItems =
      orderData.items;


    if (
      !Array.isArray(
        submittedItems
      ) ||
      submittedItems.length === 0
    ) {

      throw new Error(
        'Your cart is empty.'
      );

    }


    /*
     * Get spreadsheet
     */

    var ss =
      SpreadsheetApp
        .getActiveSpreadsheet();


    if (!ss) {

      throw new Error(
        'Restaurant spreadsheet could not be found.'
      );

    }


    /*
     * Load MENU
     */

    var menuSheet =
      ss.getSheetByName(
        'MENU'
      );


    if (!menuSheet) {

      throw new Error(
        'MENU sheet was not found.'
      );

    }


    var menuData =
      readSheetObjects(
        menuSheet
      );


    /*
     * Build secure menu lookup
     */

    var menuLookup = {};


    menuData.forEach(
      function(item) {

        var itemId =
          cleanText(
            getField(
              item,
              [
                'Item_ID',
                'ITEM_ID',
                'Item ID'
              ]
            )
          );


        if (!itemId) {
          return;
        }


        var available =
          getField(
            item,
            [
              'Available',
              'AVAILABLE',
              'Active'
            ]
          );


        menuLookup[itemId] = {

          itemId:
            itemId,

          itemName:
            cleanText(
              getField(
                item,
                [
                  'Item_Name',
                  'ITEM_NAME',
                  'Item Name'
                ]
              )
            ),

          price:
            Number(
              getField(
                item,
                [
                  'Price',
                  'PRICE'
                ]
              ) || 0
            ),

          available:
            isAvailable(
              available
            )

        };

      }
    );


    /*
     * Rebuild order items
     * using SERVER prices.
     */

    var verifiedItems = [];

    var orderSubtotal = 0;


    submittedItems.forEach(
      function(submittedItem) {

        var itemId =
          cleanText(
            submittedItem.Item_ID
          );


        var quantity =
          Number(
            submittedItem.Qty
          );


        if (!itemId) {

          throw new Error(
            'An order item is missing its Item_ID.'
          );

        }


        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity < 1 ||
          quantity > 99
        ) {

          throw new Error(
            'Invalid quantity for item ' +
            itemId
          );

        }


        var menuItem =
          menuLookup[itemId];


        if (!menuItem) {

          throw new Error(
            'Menu item ' +
            itemId +
            ' could not be found.'
          );

        }


        if (!menuItem.available) {

          throw new Error(
            menuItem.itemName +
            ' is currently unavailable.'
          );

        }


        var unitPrice =
          Number(
            menuItem.price
          );


        var lineTotal =
          unitPrice *
          quantity;


        orderSubtotal +=
          lineTotal;


        verifiedItems.push({

          itemId:
            menuItem.itemId,

          itemName:
            menuItem.itemName,

          unitPrice:
            unitPrice,

          quantity:
            quantity,

          lineTotal:
            lineTotal,

          specialInstructions:
            cleanText(
              submittedItem.Special_Instructions
            )

        });

      }
    );


    /*
     * Round total
     */

    orderSubtotal =
      roundMoney(
        orderSubtotal
      );


    /*
     * Generate order ID
     */

    var orderId =
      generateOrderId();


    var orderDate =
      new Date();


    /*
     * Lock spreadsheet
     *
     * Prevents simultaneous
     * submissions from creating
     * conflicting records.
     */

    var lock =
      LockService
        .getScriptLock();


    lock.waitLock(
      15000
    );


    try {

      /*
       * ORDERS SHEET
       */

      var ordersSheet =
        getOrCreateSheet(
          ss,
          'ORDERS'
        );


      ensureHeaders(
        ordersSheet,
        [
          'Order_ID',
          'Order_Date',
          'Table_ID',
          'Customer_Name',
          'Customer_Phone',
          'Order_Type',
          'Payment_Method',
          'Subtotal',
          'Total',
          'Order_Status',
          'Payment_Status',
          'Customer_Notes'
        ]
      );


      /*
       * ORDER ITEMS SHEET
       */

      var orderItemsSheet =
        getOrCreateSheet(
          ss,
          'ORDER_ITEMS'
        );


      ensureHeaders(
        orderItemsSheet,
        [
          'Order_ID',
          'Item_ID',
          'Item_Name',
          'Quantity',
          'Unit_Price',
          'Line_Total',
          'Special_Instructions'
        ]
      );


      /*
       * Write ORDER
       */

      appendObjectRow(
        ordersSheet,
        {

          Order_ID:
            orderId,

          Order_Date:
            orderDate,

          Table_ID:
            tableId,

          Customer_Name:
            customerName,

          Customer_Phone:
            customerPhone,

          Order_Type:
            orderType,

          Payment_Method:
            paymentMethod,

          Subtotal:
            orderSubtotal,

          Total:
            orderSubtotal,

          Order_Status:
            'NEW',

          Payment_Status:
            'UNPAID',

          Customer_Notes:
            customerNotes

        }
      );


      /*
       * Write ORDER ITEMS
       */

      verifiedItems.forEach(
        function(item) {

          appendObjectRow(
            orderItemsSheet,
            {

              Order_ID:
                orderId,

              Item_ID:
                item.itemId,

              Item_Name:
                item.itemName,

              Quantity:
                item.quantity,

              Unit_Price:
                item.unitPrice,

              Line_Total:
                item.lineTotal,

              Special_Instructions:
                item.specialInstructions

            }
          );

        }
      );


    } finally {

      lock.releaseLock();

    }


    /*
     * Return confirmation
     */

    return {

      success:
        true,

      orderId:
        orderId,

      tableId:
        tableId,

      customerName:
        customerName,

      subtotal:
        orderSubtotal,

      total:
        orderSubtotal,

      status:
        'NEW',

      paymentStatus:
        'UNPAID',

      message:
        'Your order has been received.'

    };


  } catch (error) {

    console.error(
      'submitOrder error:',
      error
    );


    return {

      success:
        false,

      error:
        error.message ||
        String(error)

    };

  }

}


/**
 * =========================================
 * GENERATE ORDER ID
 * =========================================
 */

function generateOrderId() {

  var now =
    new Date();


  var datePart =
    Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      'yyyyMMdd'
    );


  var timePart =
    Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      'HHmmss'
    );


  var randomPart =
    Math.floor(
      100 +
      Math.random() *
      900
    );


  return (
    'ORD-' +
    datePart +
    '-' +
    timePart +
    '-' +
    randomPart
  );

}


/**
 * =========================================
 * READ SHEET AS OBJECTS
 * =========================================
 */

function readSheetObjects(sheet) {

  var values =
    sheet
      .getDataRange()
      .getValues();


  if (
    values.length < 2
  ) {

    return [];

  }


  var headers =
    values[0];


  var records = [];


  for (
    var r = 1;
    r < values.length;
    r++
  ) {

    var row =
      values[r];


    var object = {};


    headers.forEach(
      function(header, c) {

        object[
          String(header).trim()
        ] =
          row[c];

      }
    );


    records.push(
      object
    );

  }


  return records;

}


/**
 * =========================================
 * GET FIELD
 * =========================================
 */

function getField(
  object,
  possibleNames
) {

  for (
    var i = 0;
    i < possibleNames.length;
    i++
  ) {

    var name =
      possibleNames[i];


    if (
      Object.prototype
        .hasOwnProperty
        .call(
          object,
          name
        )
    ) {

      return object[name];

    }

  }


  /*
   * Case-insensitive fallback
   */

  var keys =
    Object.keys(
      object
    );


  for (
    var j = 0;
    j < keys.length;
    j++
  ) {

    for (
      var k = 0;
      k < possibleNames.length;
      k++
    ) {

      if (
        String(
          keys[j]
        ).trim().toLowerCase()

        ===

        String(
          possibleNames[k]
        ).trim().toLowerCase()
      ) {

        return object[
          keys[j]
        ];

      }

    }

  }


  return '';

}


/**
 * =========================================
 * AVAILABILITY
 * =========================================
 */

function isAvailable(value) {

  if (
    value === true
  ) {

    return true;

  }


  var text =
    String(
      value || ''
    )
    .trim()
    .toUpperCase();


  return (
    text === 'YES' ||
    text === 'TRUE' ||
    text === 'AVAILABLE' ||
    text === '1'
  );

}


/**
 * =========================================
 * CLEAN TEXT
 * =========================================
 */

function cleanText(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return '';

  }


  return String(
    value
  ).trim();

}


/**
 * =========================================
 * ROUND MONEY
 * =========================================
 */

function roundMoney(value) {

  return Math.round(
    Number(value) *
    100
  ) / 100;

}


/**
 * =========================================
 * GET / CREATE SHEET
 * =========================================
 */

function getOrCreateSheet(
  spreadsheet,
  sheetName
) {

  var sheet =
    spreadsheet.getSheetByName(
      sheetName
    );


  if (!sheet) {

    sheet =
      spreadsheet.insertSheet(
        sheetName
      );

  }


  return sheet;

}


/**
 * =========================================
 * ENSURE HEADERS
 * =========================================
 */

function ensureHeaders(
  sheet,
  requiredHeaders
) {

  var lastColumn =
    sheet.getLastColumn();


  var headers = [];


  if (
    lastColumn > 0
  ) {

    headers =
      sheet
        .getRange(
          1,
          1,
          1,
          lastColumn
        )
        .getValues()[0];

  }


  /*
   * If sheet is empty,
   * create headers.
   */

  if (
    headers.length === 0 ||
    (
      headers.length === 1 &&
      headers[0] === ''
    )
  ) {

    sheet
      .getRange(
        1,
        1,
        1,
        requiredHeaders.length
      )
      .setValues([
        requiredHeaders
      ]);

    return;

  }


  /*
   * Add missing headers.
   */

  var normalized =
    headers.map(
      function(header) {

        return String(
          header
        )
        .trim()
        .toLowerCase();

      }
    );


  var newHeaders = [];


  requiredHeaders.forEach(
    function(header) {

      if (
        normalized.indexOf(
          String(header)
            .trim()
            .toLowerCase()
        ) === -1
      ) {

        newHeaders.push(
          header
        );

      }

    }
  );


  if (
    newHeaders.length
  ) {

    sheet
      .getRange(
        1,
        headers.length + 1,
        1,
        newHeaders.length
      )
      .setValues([
        newHeaders
      ]);

  }

}


/**
 * =========================================
 * APPEND OBJECT ROW
 * =========================================
 */

function appendObjectRow(
  sheet,
  object
) {

  var lastColumn =
    sheet.getLastColumn();


  var headers =
    sheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0];


  var row =
    headers.map(
      function(header) {

        var key =
          String(
            header
          ).trim();


        if (
          Object.prototype
            .hasOwnProperty
            .call(
              object,
              key
            )
        ) {

          return object[key];

        }


        /*
         * Case-insensitive lookup
         */

        var objectKeys =
          Object.keys(
            object
          );


        for (
          var i = 0;
          i < objectKeys.length;
          i++
        ) {

          if (
            objectKeys[i]
              .toLowerCase()

            ===

            key.toLowerCase()
          ) {

            return object[
              objectKeys[i]
            ];

          }

        }


        return '';

      }
    );


  sheet.appendRow(
    row
  );

}


/**
 * =========================================
 * TEST ORDERS
 * =========================================
 *
 * READ-ONLY VERIFICATION.
 *
 * This function does NOT:
 * - create orders
 * - modify orders
 * - modify ORDER_ITEMS
 * - change checkout
 * - change dashboard
 *
 * =========================================
 */

function testOrders() {

  Logger.log(
    "=== UTOY'S ORDERS VERIFICATION ==="
  );


  var ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  if (!ss) {

    Logger.log(
      "ERROR: Spreadsheet could not be found."
    );

    Logger.log(
      "=== ORDERS VERIFICATION COMPLETE ==="
    );

    return;

  }


  var sheet =
    ss.getSheetByName(
      'ORDERS'
    );


  if (!sheet) {

    Logger.log(
      "ERROR: ORDERS sheet was not found."
    );

    Logger.log(
      "=== ORDERS VERIFICATION COMPLETE ==="
    );

    return;

  }


  var data =
    sheet
      .getDataRange()
      .getValues();


  if (
    data.length === 0
  ) {

    Logger.log(
      "ORDERS sheet is empty."
    );

    Logger.log(
      "=== ORDERS VERIFICATION COMPLETE ==="
    );

    return;

  }


  var headers =
    data[0];


  Logger.log(
    "Rows including header: " +
    data.length
  );


  Logger.log(
    "Columns: " +
    headers.length
  );


  Logger.log(
    "Headers: " +
    headers.join(
      " | "
    )
  );


  /*
   * Required ORDERS headers.
   */

  var requiredHeaders = [

    "Order_ID",
    "Order_Date",
    "Table_ID",
    "Customer_Name",
    "Customer_Phone",
    "Order_Type",
    "Payment_Method",
    "Subtotal",
    "Total",
    "Order_Status",
    "Payment_Status",
    "Customer_Notes"

  ];


  var normalizedHeaders =
    headers.map(
      function(header) {

        return String(
          header
        )
        .trim()
        .toLowerCase();

      }
    );


  var missingHeaders = [];


  requiredHeaders.forEach(
    function(header) {

      if (
        normalizedHeaders.indexOf(
          String(header)
            .trim()
            .toLowerCase()
        ) === -1
      ) {

        missingHeaders.push(
          header
        );

      }

    }
  );


  if (
    missingHeaders.length > 0
  ) {

    Logger.log(
      "MISSING HEADERS: " +
      missingHeaders.join(
        ", "
      )
    );

  } else {

    Logger.log(
      "Required headers: ALL PRESENT"
    );

  }


  /*
   * Ignore completely blank rows.
   */

  var rows =
    data
      .slice(1)
      .filter(
        function(row) {

          return row.some(
            function(value) {

              return (
                value !== '' &&
                value !== null
              );

            }
          );

        }
      );


  Logger.log(
    "Order records: " +
    rows.length
  );


  /*
   * Locate important columns.
   */

  var orderIdIndex =
    normalizedHeaders.indexOf(
      "order_id"
    );


  var orderTypeIndex =
    normalizedHeaders.indexOf(
      "order_type"
    );


  var phoneIndex =
    normalizedHeaders.indexOf(
      "customer_phone"
    );


  var statusIndex =
    normalizedHeaders.indexOf(
      "order_status"
    );


  var paymentStatusIndex =
    normalizedHeaders.indexOf(
      "payment_status"
    );


  /*
   * Order IDs.
   */

  if (
    orderIdIndex >= 0
  ) {

    var orderIds =
      rows
        .map(
          function(row) {

            return String(
              row[
                orderIdIndex
              ] || ''
            ).trim();

          }
        )
        .filter(
          Boolean
        );


    var uniqueOrderIds =
      new Set(
        orderIds
      ).size;


    Logger.log(
      "Order IDs: " +
      orderIds.length
    );


    Logger.log(
      "Unique Order IDs: " +
      uniqueOrderIds
    );


    if (
      orderIds.length ===
      uniqueOrderIds
    ) {

      Logger.log(
        "Order ID uniqueness: PASS"
      );

    } else {

      Logger.log(
        "Order ID uniqueness: CHECK REQUIRED"
      );

    }

  }


  /*
   * Order types.
   */

  if (
    orderTypeIndex >= 0
  ) {

    var orderTypes = {};


    rows.forEach(
      function(row) {

        var type =
          String(
            row[
              orderTypeIndex
            ] || ''
          ).trim();


        if (type) {

          orderTypes[type] =
            (
              orderTypes[type] ||
              0
            ) + 1;

        }

      }
    );


    Logger.log(
      "Order Types: " +
      JSON.stringify(
        orderTypes
      )
    );

  }


  /*
   * Customer phones.
   */

  if (
    phoneIndex >= 0
  ) {

    var withPhone =
      rows.filter(
        function(row) {

          return (
            String(
              row[
                phoneIndex
              ] || ''
            ).trim() !== ''
          );

        }
      ).length;


    Logger.log(
      "Orders with Customer Phone: " +
      withPhone
    );

  }


  /*
   * Order statuses.
   */

  if (
    statusIndex >= 0
  ) {

    var statuses = {};


    rows.forEach(
      function(row) {

        var status =
          String(
            row[
              statusIndex
            ] || ''
          ).trim();


        if (status) {

          statuses[status] =
            (
              statuses[status] ||
              0
            ) + 1;

        }

      }
    );


    Logger.log(
      "Order Statuses: " +
      JSON.stringify(
        statuses
      )
    );

  }


  /*
   * Payment statuses.
   */

  if (
    paymentStatusIndex >= 0
  ) {

    var paymentStatuses = {};


    rows.forEach(
      function(row) {

        var status =
          String(
            row[
              paymentStatusIndex
            ] || ''
          ).trim();


        if (status) {

          paymentStatuses[status] =
            (
              paymentStatuses[status] ||
              0
            ) + 1;

        }

      }
    );


    Logger.log(
      "Payment Statuses: " +
      JSON.stringify(
        paymentStatuses
      )
    );

  }


  Logger.log(
    "=== ORDERS VERIFICATION COMPLETE ==="
  );

}

/**
 * =========================================
 * TEST ORDER ITEMS
 * =========================================
 *
 * READ-ONLY VERIFICATION.
 *
 * Does not create or modify any records.
 *
 * =========================================
 */

function testOrderItems() {

  Logger.log(
    "=== UTOY'S ORDER_ITEMS VERIFICATION ==="
  );


  var ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  if (!ss) {

    Logger.log(
      "ERROR: Spreadsheet could not be found."
    );

    Logger.log(
      "=== ORDER_ITEMS VERIFICATION COMPLETE ==="
    );

    return;

  }


  var sheet =
    ss.getSheetByName(
      'ORDER_ITEMS'
    );


  if (!sheet) {

    Logger.log(
      "ERROR: ORDER_ITEMS sheet was not found."
    );

    Logger.log(
      "=== ORDER_ITEMS VERIFICATION COMPLETE ==="
    );

    return;

  }


  var data =
    sheet
      .getDataRange()
      .getValues();


  if (
    data.length === 0
  ) {

    Logger.log(
      "ORDER_ITEMS sheet is empty."
    );

    Logger.log(
      "=== ORDER_ITEMS VERIFICATION COMPLETE ==="
    );

    return;

  }


  var headers =
    data[0];


  Logger.log(
    "Rows including header: " +
    data.length
  );


  Logger.log(
    "Columns: " +
    headers.length
  );


  Logger.log(
    "Headers: " +
    headers.join(
      " | "
    )
  );


  /*
   * Required ORDER_ITEMS headers.
   */

  var requiredHeaders = [

    "Order_ID",
    "Item_ID",
    "Item_Name",
    "Quantity",
    "Unit_Price",
    "Line_Total",
    "Special_Instructions"

  ];


  var normalizedHeaders =
    headers.map(
      function(header) {

        return String(
          header
        )
        .trim()
        .toLowerCase();

      }
    );


  var missingHeaders = [];


  requiredHeaders.forEach(
    function(header) {

      if (
        normalizedHeaders.indexOf(
          String(header)
            .trim()
            .toLowerCase()
        ) === -1
      ) {

        missingHeaders.push(
          header
        );

      }

    }
  );


  if (
    missingHeaders.length > 0
  ) {

    Logger.log(
      "MISSING HEADERS: " +
      missingHeaders.join(
        ", "
      )
    );

  } else {

    Logger.log(
      "Required headers: ALL PRESENT"
    );

  }


  /*
   * Ignore completely blank rows.
   */

  var rows =
    data
      .slice(1)
      .filter(
        function(row) {

          return row.some(
            function(value) {

              return (
                value !== '' &&
                value !== null
              );

            }
          );

        }
      );


  Logger.log(
    "Order item records: " +
    rows.length
  );


  /*
   * Locate important columns.
   */

  var orderIdIndex =
    normalizedHeaders.indexOf(
      "order_id"
    );


  var itemIdIndex =
    normalizedHeaders.indexOf(
      "item_id"
    );


  var quantityIndex =
    normalizedHeaders.indexOf(
      "quantity"
    );


  var unitPriceIndex =
    normalizedHeaders.indexOf(
      "unit_price"
    );


  var lineTotalIndex =
    normalizedHeaders.indexOf(
      "line_total"
    );


  /*
   * Unique orders represented
   * in ORDER_ITEMS.
   */

  if (
    orderIdIndex >= 0
  ) {

    var orderIds =
      rows
        .map(
          function(row) {

            return String(
              row[
                orderIdIndex
              ] || ''
            ).trim();

          }
        )
        .filter(
          Boolean
        );


    Logger.log(
      "Unique Order IDs: " +
      new Set(
        orderIds
      ).size
    );

  }


  /*
   * Unique item IDs.
   */

  if (
    itemIdIndex >= 0
  ) {

    var itemIds =
      rows
        .map(
          function(row) {

            return String(
              row[
                itemIdIndex
              ] || ''
            ).trim();

          }
        )
        .filter(
          Boolean
        );


    Logger.log(
      "Unique Item IDs: " +
      new Set(
        itemIds
      ).size
    );

  }


  /*
   * Quantity validation.
   */

  if (
    quantityIndex >= 0
  ) {

    var invalidQuantities =
      rows.filter(
        function(row) {

          var quantity =
            Number(
              row[
                quantityIndex
              ]
            );


          return (
            !Number.isInteger(
              quantity
            ) ||
            quantity < 1
          );

        }
      ).length;


    Logger.log(
      "Invalid Quantities: " +
      invalidQuantities
    );


    if (
      invalidQuantities === 0
    ) {

      Logger.log(
        "Quantity validation: PASS"
      );

    } else {

      Logger.log(
        "Quantity validation: CHECK REQUIRED"
      );

    }

  }


  /*
   * Price / line total validation.
   */

  if (
    unitPriceIndex >= 0 &&
    lineTotalIndex >= 0 &&
    quantityIndex >= 0
  ) {

    var invalidTotals = 0;


    rows.forEach(
      function(row) {

        var quantity =
          Number(
            row[
              quantityIndex
            ]
          );


        var unitPrice =
          Number(
            row[
              unitPriceIndex
            ]
          );


        var lineTotal =
          Number(
            row[
              lineTotalIndex
            ]
          );


        var expected =
          Math.round(
            unitPrice *
            quantity *
            100
          ) / 100;


        if (
          Math.abs(
            expected -
            lineTotal
          ) > 0.01
        ) {

          invalidTotals++;

        }

      }
    );


    Logger.log(
      "Invalid Line Totals: " +
      invalidTotals
    );


    if (
      invalidTotals === 0
    ) {

      Logger.log(
        "Line Total validation: PASS"
      );

    } else {

      Logger.log(
        "Line Total validation: CHECK REQUIRED"
      );

    }

  }


  Logger.log(
    "=== ORDER_ITEMS VERIFICATION COMPLETE ==="
  );

}

function testPayments() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('PAYMENTS');

  if (!sheet) {
    Logger.log('PAYMENTS sheet NOT FOUND');
    return;
  }

  const data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    Logger.log('PAYMENTS sheet is empty');
    return;
  }

  const headers = data[0].map(String);
  const rows = data.slice(1);

  Logger.log('===== PAYMENTS VERIFICATION =====');
  Logger.log('Rows including header: ' + data.length);
  Logger.log('Columns: ' + headers.length);
  Logger.log('Headers: ' + headers.join(' | '));

  // Basic required fields.
  const requiredHeaders = [
    'Payment_ID',
    'Order_ID',
    'Payment_Method',
    'Payment_Amount',
    'Payment_Status'
  ];

  const missing = requiredHeaders.filter(h => headers.indexOf(h) === -1);

  if (missing.length > 0) {
    Logger.log('Missing required headers: ' + missing.join(', '));
  } else {
    Logger.log('Required headers: ALL PRESENT');
  }

  // Build column indexes.
  const idx = {};
  headers.forEach((h, i) => {
    idx[h] = i;
  });

  // Payment ID uniqueness.
  if (idx.Payment_ID !== undefined) {
    const ids = rows
      .map(r => String(r[idx.Payment_ID] || '').trim())
      .filter(Boolean);

    const uniqueIds = new Set(ids);

    Logger.log('Payment IDs: ' + ids.length);
    Logger.log('Unique Payment IDs: ' + uniqueIds.size);
    Logger.log(
      'Payment ID uniqueness: ' +
      (ids.length === uniqueIds.size ? 'PASS' : 'FAIL')
    );
  }

  // Order ID coverage.
  if (idx.Order_ID !== undefined) {
    const orderIds = rows
      .map(r => String(r[idx.Order_ID] || '').trim())
      .filter(Boolean);

    Logger.log('Payments with Order ID: ' + orderIds.length);
  }

  // Paayment Amount validation.
  if (idx.Payment_Amount !== undefined) {
    let invalidAmounts = 0;

    rows.forEach(r => {
      const value = r[idx.Payment_Amount];

      if (
        value !== '' &&
        value !== null &&
        (isNaN(Number(value)) || Number(value) < 0)
      ) {
        invalidAmounts++;
      }
    });

    Logger.log('Invalid Amounts: ' + invalidAmounts);
    Logger.log(
      'Payment_Amount validation: ' +
      (invalidAmounts === 0 ? 'PASS' : 'FAIL')
    );
  }

  // Payment method summary.
  if (idx.Payment_Method !== undefined) {
    const methods = {};

    rows.forEach(r => {
      const method = String(r[idx.Payment_Method] || '').trim();

      if (method) {
        methods[method] = (methods[method] || 0) + 1;
      }
    });

    Logger.log('Payment Methods: ' + JSON.stringify(methods));
  }

  // Payment status summary.
  if (idx.Payment_Status !== undefined) {
    const statuses = {};

    rows.forEach(r => {
      const status = String(r[idx.Payment_Status] || '').trim();

      if (status) {
        statuses[status] = (statuses[status] || 0) + 1;
      }
    });

    Logger.log('Payment Statuses: ' + JSON.stringify(statuses));
  }

  Logger.log('===== PAYMENTS VERIFICATION COMPLETE =====');
}

