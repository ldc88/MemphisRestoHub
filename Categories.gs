/**
 * ============================================================
 * UTOY'S TAPSI
 * RESTAURANT DIGITAL MENU + ONLINE ORDERING SYSTEM
 * ============================================================
 *
 * CUSTOMER:
 *   Web App URL
 *
 * STAFF:
 *   Web App URL?page=dashboard
 *
 * GOOGLE SHEETS:
 *   CATEGORIES
 *   MENU
 *   ORDERS
 *   ORDER_ITEMS
 *
 * ============================================================
 */


/**
 * ============================================================
 * GET CURRENT WEB APP URL
 * ============================================================
 */

function getWebAppUrl() {

  return ScriptApp
    .getService()
    .getUrl();

}


/**
 * ============================================================
 * WEB APP ROUTER
 * ============================================================
 *
 * CUSTOMER MENU
 *   /dev
 *
 * STAFF DASHBOARD
 *   /dev?page=dashboard
 *
 * TABLE QR CODE MANAGER
 *   /dev?page=qr
 *
 * TEMPORARY DRIVE TEST
 *   /dev?page=drive-test
 *
 * ============================================================
 */


/** doGet */

function doGet(e) {

  try {

    var page = '';

    /*
     * ========================================================
     * READ URL PARAMETERS
     * ========================================================
     */

    if (
      e &&
      e.parameter &&
      e.parameter.page ) {

      page = String(e.parameter.page).trim().toLowerCase();

    }

/*
 * ========================================================
 * TEMPORARY DRIVE IDENTITY TEST
 * ========================================================
 *
 * Used only to verify the Google account and authorization
 * context used by the deployed web app.
 *
 * TEST URL:
 *
 *   /dev?page=drive-identity-test
 *
 * IMPORTANT:
 *
 * This is a temporary diagnostic route.
 * Remove it after testing.
 */

if (
  page === 'drive-identity-test'
) {

  try {

    var effectiveUser =
      Session
        .getEffectiveUser()
        .getEmail();


    var activeUser =
      Session
        .getActiveUser()
        .getEmail();


    var authInfo =
      ScriptApp
        .getAuthorizationInfo(
          ScriptApp.AuthMode.FULL
        );


    var authorizationStatus =
      authInfo.getAuthorizationStatus();


    return HtmlService
      .createHtmlOutput(

        '<h2>Drive Identity Test</h2>' +

        '<p><strong>Effective User:</strong> ' +
        escapeHtmlServer(
          effectiveUser ||
          '(empty)'
        ) +
        '</p>' +

        '<p><strong>Active User:</strong> ' +
        escapeHtmlServer(
          activeUser ||
          '(empty)'
        ) +
        '</p>' +

        '<p><strong>Authorization Status:</strong> ' +
        escapeHtmlServer(
          String(
            authorizationStatus
          )
        ) +
        '</p>'

      )

      .setTitle(
        'Drive Identity Test'
      )

      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );


  } catch (error) {

    return HtmlService
      .createHtmlOutput(

        '<h2>Drive Identity Test: FAIL</h2>' +

        '<p>' +

        escapeHtmlServer(
          error &&
          error.message
            ? error.message
            : String(error)
        ) +

        '</p>'

      )

      .setTitle(
        'Drive Identity Test'
      )

      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );

  }

}


    /*
     * ========================================================
     * STAFF DASHBOARD
     * ========================================================
     *
     * dashboard.html may continue using template processing.
     */

    if (
      page === 'dashboard'
    ) {

      return HtmlService
        .createTemplateFromFile(
          'dashboard'
        )
        .evaluate()
        .setTitle(
          CONFIG.RESTAURANT_NAME +
          ' - Staff Dashboard'
        )
        .setXFrameOptionsMode(
          HtmlService.XFrameOptionsMode.ALLOWALL
        );

    }




    /*
     * ========================================================
     * TEMPORARY DRIVE CREATE-FILE TEST
     * ========================================================
     *
     * Used only to verify that the deployed web app
     * can create a file in the payment proof folder.
     *
     * TEST URL:
     *
     *   /dev?page=drive-test
     *
     * IMPORTANT:
     *
     * This is a temporary diagnostic route.
     * Remove it after testing.
     */

    if (
      page === 'drive-test'
    ) {

      try {

        var folderName =
          "Utoy's Tapsi Payment Proofs";


        var folders =
          DriveApp.getFoldersByName(
            folderName
          );


        if (
          !folders.hasNext()
        ) {

          throw new Error(
            'Payment proof folder was not found.'
          );

        }


        var folder =
          folders.next();


        var blob =
          Utilities.newBlob(
            'WEB APP DRIVE TEST',
            'text/plain',
            'webapp-drive-test.txt'
          );


        var file =
          folder.createFile(
            blob
          );


        return HtmlService
          .createHtmlOutput(
            '<h2>Drive Test: PASS</h2>' +
            '<p>Web app successfully created the test file.</p>' +
            '<p><strong>File ID:</strong> ' +
            escapeHtmlServer(
              file.getId()
            ) +
            '</p>' +
            '<p><strong>File Name:</strong> ' +
            escapeHtmlServer(
              file.getName()
            ) +
            '</p>'
          )
          .setTitle(
            'Drive Authorization Test'
          )
          .setXFrameOptionsMode(
            HtmlService.XFrameOptionsMode.ALLOWALL
          );

      } catch (error) {

        return HtmlService
          .createHtmlOutput(
            '<h2>Drive Test: FAIL</h2>' +
            '<p>' +
            escapeHtmlServer(
              error.message ||
              error
            ) +
            '</p>'
          )
          .setTitle(
            'Drive Authorization Test'
          )
          .setXFrameOptionsMode(
            HtmlService.XFrameOptionsMode.ALLOWALL
          );

      }

    }


    /*
     * ========================================================
     * TABLE QR CODE MANAGER
     * ========================================================
     */

    if (
      page === 'qr'
    ) {

      return HtmlService
        .createTemplateFromFile(
          'QR'
        )
        .evaluate()
        .setTitle(
          CONFIG.RESTAURANT_NAME +
          ' - Table QR Code Manager'
        )
        .setXFrameOptionsMode(
          HtmlService.XFrameOptionsMode.ALLOWALL
        );

    }


    /*
     * ========================================================
     * CUSTOMER MENU
     * ========================================================
     *
     * IMPORTANT:
     *
     * Index.html is now served as a normal HTML file.
     *
     * We deliberately DO NOT use:
     *
     * createTemplateFromFile()
     *
     * and we DO NOT pass tableId into the template.
     *
     * Index.html obtains tableId on the browser side using:
     *
     * google.script.url.getLocation()
     */

    return HtmlService
      .createHtmlOutputFromFile(
        'Index'
      )
      .setTitle(
        CONFIG.RESTAURANT_NAME +
        ' - Online Menu'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );


  } catch (error) {

    return HtmlService
      .createHtmlOutput(
        '<h2>Application Error</h2>' +
        '<p>' +
        String(
          error.message ||
          error
        ) +
        '</p>'
      );

  }

}


/* ============================================================
   CUSTOMER MENU
   ============================================================ */


/**
 * ------------------------------------------------------------
 * GET APPLICATION DATA
 * ------------------------------------------------------------
 *
 * This is the main function used by Menu.html.
 *
 * Returns:
 *
 * {
 *   success: true,
 *   restaurantName: "...",
 *   categories: [...],
 *   menu: [...]
 * }
 *
 */

function getApplicationData() {

  try {

    var categories =
      getCategories();


    var menu =
      getMenu();


    return {

      success: true,

      restaurantName:
        CONFIG.RESTAURANT_NAME,

      categories:
        categories,

      menu:
        menu

    };


  } catch (error) {

    console.error(
      'Error in getApplicationData:',
      error
    );


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
 * GET CATEGORIES
 * ------------------------------------------------------------
 */

/**
 * ============================================================
 * GET CATEGORIES
 * ============================================================
 *
 * Reads the CATEGORIES sheet using the current Utoy's
 * Tapsi category structure.
 *
 * Columns:
 *
 * 1 - Category_ID
 * 2 - Category_Name
 * 3 - Sort_Order
 * 4 - Active
 *
 * ============================================================
 */

function getCategories() {

  var sheet =
    getRequiredSheet(
      CONFIG.CATEGORY_SHEET
    );


  var values =
    sheet
      .getDataRange()
      .getValues();


  /*
   * No category rows.
   */

  if (
    values.length < 2
  ) {

    return [];

  }


  var categories = [];


  /*
   * Zero-based column positions.
   */

  var COL = {

    CATEGORY_ID: 0,

    CATEGORY_NAME: 1,

    SORT_ORDER: 2,

    ACTIVE: 3

  };


  /*
   * Read category rows.
   */

  for (
    var r = 1;
    r < values.length;
    r++
  ) {

    var row =
      values[r];


    if (
      !row ||
      row.length === 0
    ) {

      continue;

    }


    var categoryId =
      cleanValue(
        row[COL.CATEGORY_ID]
      );


    var categoryName =
      cleanValue(
        row[COL.CATEGORY_NAME]
      );


    /*
     * Skip invalid rows.
     */

    if (
      !categoryId ||
      !categoryName
    ) {

      continue;

    }


    /*
     * Active must be YES.
     */

    var active =
      normalizeYesNo(
        row[COL.ACTIVE]
      );


    if (
      active !== 'YES'
    ) {

      continue;

    }


    categories.push({

      categoryId:
        categoryId,

      categoryName:
        categoryName,

      sortOrder:
        Number(
          row[COL.SORT_ORDER] || 9999
        ),

      active:
        'YES'

    });

  }


  /*
   * Sort categories.
   */

  categories.sort(
    function(a, b) {

      return (
        a.sortOrder -
        b.sortOrder
      );

    }
  );


  return categories;

}


/**
 * ------------------------------------------------------------
 * GET MENU
 * ------------------------------------------------------------
 *
 * This function was previously missing in your project.
 *
 */


/**
 * ============================================================
 * GET MENU
 * ============================================================
 *
 * Reads the MENU sheet directly using the known column
 * structure of Utoy's Tapsi.
 *
 * Current MENU columns:
 *
 * 1  Item_ID
 * 2  SKU
 * 3  Category_ID
 * 4  Item_Name
 * 5  Description
 * 6  Price
 * 7  Cost
 * 8  Image_URL
 * 9  Available
 * 10 Featured
 * 11 Sort_Order
 * 12 Loyverse_Item_ID
 * 13 Loyverse_Variant_ID
 * 14 Track_Inventory
 * 15 Stock_Status
 * 16 Created
 * 17 Updated
 *
 * ============================================================
 */

function getMenu() {

  var sheet =
    getRequiredSheet(
      CONFIG.MENU_SHEET
    );


  var values =
    sheet
      .getDataRange()
      .getValues();


  /*
   * No data rows.
   */

  if (
    values.length < 2
  ) {

    return [];

  }


  var menu = [];


  /*
   * Column positions are zero-based.
   */

  var COL = {

    ITEM_ID: 0,

    SKU: 1,

    CATEGORY_ID: 2,

    ITEM_NAME: 3,

    DESCRIPTION: 4,

    PRICE: 5,

    COST: 6,

    IMAGE_URL: 7,

    AVAILABLE: 8,

    FEATURED: 9,

    SORT_ORDER: 10,

    LOYVERSE_ITEM_ID: 11,

    LOYVERSE_VARIANT_ID: 12,

    TRACK_INVENTORY: 13,

    STOCK_STATUS: 14,

    CREATED: 15,

    UPDATED: 16

  };


  /*
   * Read each menu item.
   */

  for (
    var r = 1;
    r < values.length;
    r++
  ) {

    var row =
      values[r];


    /*
     * Skip completely empty rows.
     */

    if (
      !row ||
      row.length === 0
    ) {

      continue;

    }


    var itemId =
      cleanValue(
        row[COL.ITEM_ID]
      );


    var itemName =
      cleanValue(
        row[COL.ITEM_NAME]
      );


    /*
     * An item without an ID or name
     * isn't a valid menu item.
     */

    if (
      !itemId ||
      !itemName
    ) {

      continue;

    }


    /*
     * Available column.
     *
     * Your current data contains:
     *
     * YES
     *
     */

    var available =
      normalizeYesNo(
        row[COL.AVAILABLE]
      );


    /*
     * Only show active/available items
     * to customers.
     */

    if (
      available !== 'YES'
    ) {

      continue;

    }


    /*
     * Price.
     */

    var price =
      Number(
        row[COL.PRICE] || 0
      );


    /*
     * Sort order.
     */

    var sortOrder =
      Number(
        row[COL.SORT_ORDER] || 9999
      );


    /*
     * Build menu object.
     */

    menu.push({

      itemId:
        itemId,

      sku:
        cleanValue(
          row[COL.SKU]
        ),

      categoryId:
        cleanValue(
          row[COL.CATEGORY_ID]
        ),

      itemName:
        itemName,

      description:
        cleanValue(
          row[COL.DESCRIPTION]
        ),

      price:
        price,

      cost:
        Number(
          row[COL.COST] || 0
        ),

      imageUrl:
        cleanValue(
          row[COL.IMAGE_URL]
        ),

      available:
        'YES',

      featured:
        normalizeYesNo(
          row[COL.FEATURED]
        ),

      sortOrder:
        sortOrder,

      loyverseItemId:
        cleanValue(
          row[COL.LOYVERSE_ITEM_ID]
        ),

      loyverseVariantId:
        cleanValue(
          row[COL.LOYVERSE_VARIANT_ID]
        ),

      trackInventory:
        normalizeYesNo(
          row[COL.TRACK_INVENTORY]
        ),

      stockStatus:
        cleanValue(
          row[COL.STOCK_STATUS]
        ),

      created:
        row[COL.CREATED],

      updated:
        row[COL.UPDATED]

    });

  }


  /*
   * Sort menu by Sort_Order.
   */

  menu.sort(
    function(a, b) {

      return (
        a.sortOrder -
        b.sortOrder
      );

    }
  );


  return menu;

}


/* ============================================================
   OPTIONAL MENU TEST
   ============================================================ */


/**
 * Run this manually from Apps Script
 * to check whether your menu database
 * is being read correctly.
 */

function testMenu() {

  console.log(
    '================================'
  );

  console.log(
    'MENU TEST'
  );

  console.log(
    '================================'
  );


  var menu =
    getMenu();


  console.log(
    'Number of menu records: ' +
    menu.length
  );


  menu.forEach(
    function(item, index) {

      console.log(

        'Item ' +
        (index + 1) +
        ': ' +

        item.itemId +
        ' | ' +

        item.itemName +
        ' | Price=' +

        item.price +
        ' | Available=' +

        item.available

      );

    }
  );


  console.log(
    '================================'
  );

}


/* ============================================================
   TEST ORDER SUBMISSION
   ============================================================ */

function testSubmitOrder() {

  var testOrder = {

    customerName:
      'TEST CUSTOMER',

    customerPhone:
      '09876543210',

    tableId:
      'T01',

    orderType:
      'DINE_IN',

    paymentMethod:
      'CASH',

    customerNotes:
      'SYSTEM TEST',

    items: [

      {
        Item_ID:
          'ITM005',

        Qty:
          5,

        Special_Instructions:
          ''
      }
    ]
  };


  var result =
    submitOrder(
      testOrder
    );


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}


/* ============================================================
   SAVE ORDER
   ============================================================ */

function appendOrder(order) {

  var sheet =
    getRequiredSheet(
      CONFIG.ORDERS_SHEET
    );


  var headers =
    getSheetHeaders(
      sheet
    );


  var row =
    headers.map(
      function(header) {

        return getObjectField(
          order,
          header
        );

      }
    );


  sheet
    .appendRow(
      row
    );

}


/* ============================================================
   SAVE ORDER ITEMS
   ============================================================ */

function appendOrderItems(
  orderId,
  items
) {

  var sheet =
    getRequiredSheet(
      CONFIG.ORDER_ITEMS_SHEET
    );


  var headers =
    getSheetHeaders(
      sheet
    );


  if (!orderId) {

    throw new Error(
      'Order ID is required.'
    );

  }


  if (
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {

    throw new Error(
      'No order items were provided.'
    );

  }


  items.forEach(
    function(item) {

      /*
       * Accept the internal JavaScript
       * property name as well as the
       * Google Sheets column name.
       */

      var itemId =
        cleanValue(
          item.itemId ||
          item.Item_ID ||
          item.id ||
          ''
        );


      if (!itemId) {

        throw new Error(
          'An order item is missing its Item_ID.'
        );

      }


      var itemName =
        cleanValue(
          item.itemName ||
          item.Item_Name ||
          ''
        );


      var quantity =
        Number(
          item.quantity ||
          item.Quantity ||
          item.qty ||
          0
        );


      var unitPrice =
        Number(
          item.unitPrice ||
          item.Unit_Price ||
          item.price ||
          0
        );


      var lineTotal =
        Number(
          item.lineTotal ||
          item.Line_Total ||
          0
        );


      var specialInstructions =
        cleanValue(
          item.specialInstructions ||
          item.Special_Instructions ||
          item.instructions ||
          item.note ||
          ''
        );


      if (
        quantity <= 0
      ) {

        throw new Error(
          'Invalid quantity for item ' +
          itemId +
          '.'
        );

      }


      var record = {

        Order_ID:
          orderId,

        Item_ID:
          itemId,

        Item_Name:
          itemName,

        Quantity:
          quantity,

        Unit_Price:
          unitPrice,

        Line_Total:
          lineTotal,

        Special_Instructions:
          specialInstructions

      };


      var row =
        headers.map(
          function(header) {

            return getObjectField(
              record,
              header
            );

          }
        );


      sheet
        .appendRow(
          row
        );

    }
  );

}


/* ============================================================
   GENERATE ORDER ID
   ============================================================ */

function generateOrderId() {

  var now =
    new Date();


  var timezone =
    Session.getScriptTimeZone();


  var datePart =
    Utilities.formatDate(
      now,
      timezone,
      'yyyyMMdd'
    );


  var timePart =
    Utilities.formatDate(
      now,
      timezone,
      'HHmmss'
    );


  var randomPart =
    Math.floor(
      100 +
      Math.random() * 900
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


/* ============================================================
   STAFF DASHBOARD
   ============================================================ */


/**
 * ------------------------------------------------------------
 * GET DASHBOARD ORDERS
 * ------------------------------------------------------------
 */

function getDashboardOrders() {

  try {

    var ordersSheet =
      getRequiredSheet(
        CONFIG.ORDERS_SHEET
      );


    var itemsSheet =
      getRequiredSheet(
        CONFIG.ORDER_ITEMS_SHEET
      );


    var orders =
      readSheetAsObjects(
        ordersSheet
      );


    var items =
      readSheetAsObjects(
        itemsSheet
      );


    /*
     * Build item lookup.
     */

    var itemLookup = {};


    items.forEach(
      function(item) {

        var orderId =
          cleanValue(
            getField(
              item,
              'Order_ID'
            )
          );


        if (!orderId) {

          return;

        }


        if (
          !itemLookup[orderId]
        ) {

          itemLookup[orderId] = [];

        }


        itemLookup[orderId].push({

          itemId:
            cleanValue(
              getField(
                item,
                'Item_ID'
              )
            ),

          itemName:
            cleanValue(
              getField(
                item,
                'Item_Name'
              )
            ),

          quantity:
            Number(
              getField(
                item,
                'Quantity'
              ) || 0
            ),

          unitPrice:
            Number(
              getField(
                item,
                'Unit_Price'
              ) || 0
            ),

          lineTotal:
            Number(
              getField(
                item,
                'Line_Total'
              ) || 0
            ),

          specialInstructions:
            cleanValue(
              getField(
                item,
                'Special_Instructions'
              )
            )

        });

      }
    );


    /*
     * Build active orders.
     */

    var result = [];


    orders.forEach(
      function(order) {

        var orderId =
          cleanValue(
            getField(
              order,
              'Order_ID'
            )
          );


        if (!orderId) {

          return;

        }


        var status =
          cleanValue(
            getField(
              order,
              'Order_Status'
            )
          )
          .toUpperCase();


        /*
         * Completed and rejected
         * orders are not active.
         */

        if (
          status === 'COMPLETED' ||
          status === 'REJECTED'
        ) {

          return;

        }


        var orderDate =
          getField(
            order,
            'Order_Date'
          );


        result.push({

          orderId:
            orderId,

          orderDate:
            formatDashboardDate(
              orderDate
            ),

          timestamp:
            orderDate instanceof Date
              ? orderDate.getTime()
              : 0,

          tableId:
            cleanValue(
              getField(
                order,
                'Table_ID'
              )
            ),

          customerName:
            cleanValue(
              getField(
                order,
                'Customer_Name'
              )
            ),

          customerPhone:
            cleanValue(
              getField(
                order,
                'Customer_Phone'
              )
            ),

          orderType:
            cleanValue(
              getField(
                order,
                'Order_Type'
              )
            ),

          paymentMethod:
            cleanValue(
              getField(
                order,
                'Payment_Method'
              )
            ),

          subtotal:
            Number(
              getField(
                order,
                'Subtotal'
              ) || 0
            ),

          total:
            Number(
              getField(
                order,
                'Total'
              ) || 0
            ),

          status:
            status || 'NEW',

          paymentStatus:
            cleanValue(
              getField(
                order,
                'Payment_Status'
              )
            )
            .toUpperCase() ||
            'UNPAID',

          customerNotes:
            cleanValue(
              getField(
                order,
                'Customer_Notes'
              )
            ),

          items:
            itemLookup[
              orderId
            ] || []

        });

      }
    );


    /*
     * Newest orders first.
     */

    result.sort(
      function(a, b) {

        return (
          b.timestamp -
          a.timestamp
        );

      }
    );


    /*
     * Dashboard counters.
     */

    var summary = {

      newOrders:
        0,

      accepted:
        0,

      preparing:
        0,

      ready:
        0,

      totalActive:
        result.length

    };


    result.forEach(
      function(order) {

        switch (
          order.status
        ) {

          case 'NEW':

            summary.newOrders++;

            break;


          case 'ACCEPTED':

            summary.accepted++;

            break;


          case 'PREPARING':

            summary.preparing++;

            break;


          case 'READY':

            summary.ready++;

            break;

        }

      }
    );


    return {

      success:
        true,

      orders:
        result,

      summary:
        summary

    };


  } catch (error) {

    console.error(
      'Dashboard error:',
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


/* ============================================================
   UPDATE ORDER STATUS
   ============================================================ */

function updateOrderStatus(
  orderId,
  newStatus
) {

  try {

    orderId =
      cleanValue(
        orderId
      );


    newStatus =
      cleanValue(
        newStatus
      )
      .toUpperCase();


    if (!orderId) {

      throw new Error(
        'Order ID is required.'
      );

    }


    var allowedStatuses = [

      'NEW',

      'ACCEPTED',

      'PREPARING',

      'READY',

      'COMPLETED',

      'REJECTED'

    ];


    if (
      allowedStatuses.indexOf(
        newStatus
      ) === -1
    ) {

      throw new Error(
        'Invalid order status: ' +
        newStatus
      );

    }


    var sheet =
      getRequiredSheet(
        CONFIG.ORDERS_SHEET
      );


    var values =
      sheet
        .getDataRange()
        .getValues();


    if (
      values.length < 2
    ) {

      throw new Error(
        'No orders were found.'
      );

    }


    var headers =
      values[0];


    var orderIdColumn =
      findColumn(
        headers,
        'Order_ID'
      );


    var statusColumn =
      findColumn(
        headers,
        'Order_Status'
      );


    if (
      orderIdColumn === -1
    ) {

      throw new Error(
        'Order_ID column was not found.'
      );

    }


    if (
      statusColumn === -1
    ) {

      throw new Error(
        'Order_Status column was not found.'
      );

    }


    for (
      var r = 1;
      r < values.length;
      r++
    ) {

      var currentOrderId =
        cleanValue(
          values[r][
            orderIdColumn
          ]
        );


      if (
        currentOrderId ===
        orderId
      ) {

        sheet
          .getRange(
            r + 1,
            statusColumn + 1
          )
          .setValue(
            newStatus
          );


        SpreadsheetApp
          .flush();


        return {

          success:
            true,

          orderId:
            orderId,

          status:
            newStatus

        };

      }

    }


    throw new Error(
      'Order ' +
      orderId +
      ' was not found.'
    );


  } catch (error) {

    console.error(
      'Status update error:',
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


/* ============================================================
   UPDATE PAYMENT STATUS
   ============================================================ */

function updatePaymentStatus(
  orderId,
  paymentStatus
) {

  try {

    orderId =
      cleanValue(
        orderId
      );


    paymentStatus =
      cleanValue(
        paymentStatus
      )
      .toUpperCase();


    var allowed = [

      'UNPAID',

      'PAID',

      'REFUNDED'

    ];


    if (
      allowed.indexOf(
        paymentStatus
      ) === -1
    ) {

      throw new Error(
        'Invalid payment status.'
      );

    }


    var sheet =
      getRequiredSheet(
        CONFIG.ORDERS_SHEET
      );


    var values =
      sheet
        .getDataRange()
        .getValues();


    if (
      values.length < 2
    ) {

      throw new Error(
        'No orders were found.'
      );

    }


    var headers =
      values[0];


    var orderIdColumn =
      findColumn(
        headers,
        'Order_ID'
      );


    var paymentColumn =
      findColumn(
        headers,
        'Payment_Status'
      );


    if (
      orderIdColumn === -1
    ) {

      throw new Error(
        'Order_ID column was not found.'
      );

    }


    if (
      paymentColumn === -1
    ) {

      throw new Error(
        'Payment_Status column was not found.'
      );

    }


    for (
      var r = 1;
      r < values.length;
      r++
    ) {

      if (
        cleanValue(
          values[r][
            orderIdColumn
          ]
        )
        ===
        orderId
      ) {

        sheet
          .getRange(
            r + 1,
            paymentColumn + 1
          )
          .setValue(
            paymentStatus
          );


        SpreadsheetApp
          .flush();


        return {

          success:
            true,

          orderId:
            orderId,

          paymentStatus:
            paymentStatus

        };

      }

    }


    throw new Error(
      'Order not found.'
    );


  } catch (error) {

    return {

      success:
        false,

      error:
        error.message ||
        String(error)

    };

  }

}


/* ============================================================
   SHEET HELPERS
   ============================================================ */


/**
 * Get a sheet or throw a useful error.
 */

function getRequiredSheet(
  sheetName
) {

  var ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  var sheet =
    ss.getSheetByName(
      sheetName
    );


  if (!sheet) {

    throw new Error(
      'Sheet "' +
      sheetName +
      '" was not found.'
    );

  }


  return sheet;

}


/**
 * Read a sheet and convert
 * every row to an object.
 */

function readSheetAsObjects(
  sheet
) {

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

    var object = {};


    for (
      var c = 0;
      c < headers.length;
      c++
    ) {

      var header =
        String(
          headers[c]
        ).trim();


      object[
        header
      ] =
        values[r][c];

    }


    records.push(
      object
    );

  }


  return records;

}


/**
 * Get sheet headers.
 */

function getSheetHeaders(
  sheet
) {

  var lastColumn =
    sheet.getLastColumn();


  if (
    lastColumn < 1
  ) {

    return [];

  }


  return sheet
    .getRange(
      1,
      1,
      1,
      lastColumn
    )
    .getValues()[0]

    .map(
      function(header) {

        return String(
          header
        ).trim();

      }
    );

}


/**
 * Find column index.
 */

function findColumn(
  headers,
  columnName
) {

  for (
    var i = 0;
    i < headers.length;
    i++
  ) {

    if (
      String(
        headers[i]
      )
      .trim()
      .toLowerCase()

      ===

      String(
        columnName
      )
      .trim()
      .toLowerCase()
    ) {

      return i;

    }

  }


  return -1;

}


/**
 * Get field from object
 * without worrying about
 * capitalization.
 */

function getField(
  object,
  fieldName
) {

  if (!object) {

    return '';

  }


  var keys =
    Object.keys(
      object
    );


  for (
    var i = 0;
    i < keys.length;
    i++
  ) {

    if (
      String(
        keys[i]
      )
      .trim()
      .toLowerCase()

      ===

      String(
        fieldName
      )
      .trim()
      .toLowerCase()
    ) {

      return object[
        keys[i]
      ];

    }

  }


  return '';

}


/**
 * Get an object's field using
 * its actual header name.
 */

function getObjectField(
  object,
  fieldName
) {

  if (!object) {

    return '';

  }


  var keys =
    Object.keys(
      object
    );


  for (
    var i = 0;
    i < keys.length;
    i++
  ) {

    if (
      String(
        keys[i]
      )
      .trim()
      .toLowerCase()

      ===

      String(
        fieldName
      )
      .trim()
      .toLowerCase()
    ) {

      return object[
        keys[i]
      ];

    }

  }


  return '';

}


/**
 * Return first available field.
 */

function firstAvailable(
  object,
  fieldNames
) {

  for (
    var i = 0;
    i < fieldNames.length;
    i++
  ) {

    var value =
      getField(
        object,
        fieldNames[i]
      );


    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ''
    ) {

      return value;

    }

  }


  return '';

}


/**
 * Clean value.
 */

function cleanValue(
  value
) {

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
 * Normalize YES/NO.
 */

function normalizeYesNo(
  value
) {

  var result =
    cleanValue(
      value
    )
    .toUpperCase();


  if (
    result === 'TRUE'
  ) {

    return 'YES';

  }


  if (
    result === '1'
  ) {

    return 'YES';

  }


  return result;

}


/**
 * Format dashboard date.
 */

function formatDashboardDate(
  value
) {

  if (
    value instanceof Date
  ) {

    return Utilities
      .formatDate(
        value,
        Session.getScriptTimeZone(),
        'MMM d, yyyy h:mm:ss a'
      );

  }


  return cleanValue(
    value
  );

}


/**
 * Server-side HTML escaping.
 */

function escapeHtmlServer(
  value
) {

  return String(
    value || ''
  )

    .replace(
      /&/g,
      '&amp;'
    )

    .replace(
      /</g,
      '&lt;'
    )

    .replace(
      />/g,
      '&gt;'
    )

    .replace(
      /"/g,
      '&quot;'
    )

    .replace(
      /'/g,
      '&#039;'
    );

}


function diagnoseMenuSheet() {

  var sheet =
    getRequiredSheet(
      CONFIG.MENU_SHEET
    );


  var values =
    sheet
      .getDataRange()
      .getValues();


  console.log(
    "================================"
  );

  console.log(
    "MENU SHEET DIAGNOSTIC"
  );

  console.log(
    "================================"
  );


  console.log(
    "Sheet name: " +
    sheet.getName()
  );


  console.log(
    "Rows: " +
    values.length
  );


  console.log(
    "Columns: " +
    (
      values.length > 0
        ? values[0].length
        : 0
    )
  );


  if (
    values.length === 0
  ) {

    console.log(
      "The sheet is completely empty."
    );

    return;

  }


  console.log(
    "HEADERS:"
  );


  values[0].forEach(
    function(header, index) {

      console.log(
        "Column " +
        (index + 1) +
        ": [" +
        String(header) +
        "]"
      );

    }
  );


  console.log(
    "================================"
  );


  console.log(
    "DATA:"
  );


  for (
    var r = 1;
    r < values.length;
    r++
  ) {

    console.log(
      "Row " +
      (r + 1) +
      ": " +
      JSON.stringify(
        values[r]
      )
    );

  }


  console.log(
    "================================"
  );

}


function testApplicationData() {

  var data =
    getApplicationData();


  console.log(
    "================================"
  );


  console.log(
    "APPLICATION DATA TEST"
  );


  console.log(
    "================================"
  );


  console.log(
    "Restaurant: " +
    data.restaurantName
  );


  console.log(
    "Categories: " +
    (
      data.categories
        ? data.categories.length
        : 0
    )
  );


  console.log(
    "Menu items: " +
    (
      data.menu
        ? data.menu.length
        : 0
    )
  );


  console.log(
    "================================"
  );


  if (
    data.categories
  ) {

    data.categories.forEach(
      function(category, index) {

        console.log(
          "Category " +
          (index + 1) +
          ": " +
          JSON.stringify(
            category
          )
        );

      }
    );

  }


  console.log(
    "================================"
  );


  if (
    data.menu
  ) {

    data.menu.forEach(
      function(item, index) {

        console.log(
          "Menu " +
          (index + 1) +
          ": " +
          item.itemId +
          " | " +
          item.itemName +
          " | Price=" +
          item.price
        );

      }
    );

  }


  console.log(
    "================================"
  );

}


/**
 * =========================================
 * DASHBOARD DIAGNOSTIC
 * =========================================
 */

function testDashboardData() {

  Logger.log(
    '================================'
  );

  Logger.log(
    'DASHBOARD DATA TEST'
  );

  Logger.log(
    '================================'
  );


  var ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  Logger.log(
    'Spreadsheet name: ' +
    ss.getName()
  );


  Logger.log(
    'Spreadsheet ID: ' +
    ss.getId()
  );


  var ordersSheet =
    ss.getSheetByName(
      'ORDERS'
    );


  if (!ordersSheet) {

    Logger.log(
      'ERROR: ORDERS sheet not found.'
    );

    return;

  }


  Logger.log(
    'ORDERS sheet found.'
  );


  var values =
    ordersSheet
      .getDataRange()
      .getValues();


  Logger.log(
    'ORDERS rows including header: ' +
    values.length
  );


  if (
    values.length < 2
  ) {

    Logger.log(
      'NO ORDER DATA FOUND.'
    );

    return;

  }


  var headers =
    values[0];


  Logger.log(
    'Headers: ' +
    JSON.stringify(
      headers
    )
  );


  for (
    var r = 1;
    r < values.length;
    r++
  ) {

    Logger.log(
      'ORDER ROW ' +
      r +
      ': ' +
      JSON.stringify(
        values[r]
      )
    );

  }


  Logger.log(
    '--------------------------------'
  );


  var dashboardResponse =
    getDashboardOrders();


  Logger.log(
    'getDashboardOrders() response:'
  );


  Logger.log(
    JSON.stringify(
      dashboardResponse,
      null,
      2
    )
  );


  Logger.log(
    '================================'
  );

}


/* ============================================================
   END OF CODE
   ============================================================ */