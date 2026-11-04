/**
 * =========================================
 * UTOY'S TAPSI
 * STAFF ORDER DASHBOARD
 * =========================================
 */


/**
 * =========================================
 * GET DASHBOARD DATA
 * =========================================
 */

function getDashboardOrders() {

  try {

    var ss =
      SpreadsheetApp
        .getActiveSpreadsheet();


    var ordersSheet =
      ss.getSheetByName(
        'ORDERS'
      );


    var itemsSheet =
      ss.getSheetByName(
        'ORDER_ITEMS'
      );


    if (!ordersSheet) {

      throw new Error(
        'ORDERS sheet was not found.'
      );

    }


    if (!itemsSheet) {

      throw new Error(
        'ORDER_ITEMS sheet was not found.'
      );

    }


    var orders =
      readDashboardSheet(
        ordersSheet
      );


    var items =
      readDashboardSheet(
        itemsSheet
      );


    /*
     * Build item lookup
     */

    var itemLookup = {};


    items.forEach(
      function(item) {

        var orderId =
          dashboardClean(
            dashboardField(
              item,
              'Order_ID'
            )
          );


        if (!orderId) {
          return;
        }


        if (!itemLookup[orderId]) {

          itemLookup[orderId] = [];

        }


        itemLookup[orderId].push({

          itemId:
            dashboardClean(
              dashboardField(
                item,
                'Item_ID'
              )
            ),

          itemName:
            dashboardClean(
              dashboardField(
                item,
                'Item_Name'
              )
            ),

          quantity:
            Number(
              dashboardField(
                item,
                'Quantity'
              ) || 0
            ),

          unitPrice:
            Number(
              dashboardField(
                item,
                'Unit_Price'
              ) || 0
            ),

          lineTotal:
            Number(
              dashboardField(
                item,
                'Line_Total'
              ) || 0
            ),

          specialInstructions:
            dashboardClean(
              dashboardField(
                item,
                'Special_Instructions'
              )
            )

        });

      }
    );


    /*
     * Build orders
     */

    var result = [];


    orders.forEach(
      function(order) {

        var orderId =
          dashboardClean(
            dashboardField(
              order,
              'Order_ID'
            )
          );


        if (!orderId) {
          return;
        }


        var orderStatus =
          dashboardClean(
            dashboardField(
              order,
              'Order_Status'
            )
          )
          .toUpperCase();


        /*
         * Don't display completed
         * or rejected orders in the
         * active dashboard.
         */

        if (
          orderStatus === 'COMPLETED' ||
          orderStatus === 'REJECTED'
        ) {

          return;

        }


        var orderDate =
          dashboardField(
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
            dashboardClean(
              dashboardField(
                order,
                'Table_ID'
              )
            ),

          customerName:
            dashboardClean(
              dashboardField(
                order,
                'Customer_Name'
              )
            ),

          customerPhone:
            dashboardClean(
              dashboardField(
                order,
                'Customer_Phone'
              )
            ),

          orderType:
            dashboardClean(
              dashboardField(
                order,
                'Order_Type'
              )
            ),

          paymentMethod:
            dashboardClean(
              dashboardField(
                order,
                'Payment_Method'
              )
            ),

          subtotal:
            Number(
              dashboardField(
                order,
                'Subtotal'
              ) || 0
            ),

          total:
            Number(
              dashboardField(
                order,
                'Total'
              ) || 0
            ),

          status:
            orderStatus || 'NEW',

          paymentStatus:
            dashboardClean(
              dashboardField(
                order,
                'Payment_Status'
              )
            )
            .toUpperCase() || 'UNPAID',

          customerNotes:
            dashboardClean(
              dashboardField(
                order,
                'Customer_Notes'
              )
            ),

          items:
            itemLookup[orderId] || []

        });

      }
    );


    /*
     * Newest first
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
     * Summary counters
     */

    var summary = {

      newOrders: 0,

      accepted: 0,

      preparing: 0,

      ready: 0,

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


/**
 * =========================================
 * UPDATE ORDER STATUS
 * =========================================
 */

function updateOrderStatus(
  orderId,
  newStatus
) {

  try {

    orderId =
      dashboardClean(
        orderId
      );


    newStatus =
      dashboardClean(
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
        'Invalid order status.'
      );

    }


    var ss =
      SpreadsheetApp
        .getActiveSpreadsheet();


    var sheet =
      ss.getSheetByName(
        'ORDERS'
      );


    if (!sheet) {

      throw new Error(
        'ORDERS sheet was not found.'
      );

    }


    var values =
      sheet
        .getDataRange()
        .getValues();


    if (
      values.length < 2
    ) {

      throw new Error(
        'There are no orders.'
      );

    }


    var headers =
      values[0];


    var orderIdColumn =
      findDashboardColumn(
        headers,
        'Order_ID'
      );


    var statusColumn =
      findDashboardColumn(
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
        dashboardClean(
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


/**
 * =========================================
 * UPDATE PAYMENT STATUS
 * =========================================
 */

function updatePaymentStatus(
  orderId,
  paymentStatus
) {

  try {

    orderId =
      dashboardClean(
        orderId
      );


    paymentStatus =
      dashboardClean(
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


    var ss =
      SpreadsheetApp
        .getActiveSpreadsheet();


    var sheet =
      ss.getSheetByName(
        'ORDERS'
      );


    if (!sheet) {

      throw new Error(
        'ORDERS sheet was not found.'
      );

    }


    var values =
      sheet
        .getDataRange()
        .getValues();


    var headers =
      values[0];


    var orderIdColumn =
      findDashboardColumn(
        headers,
        'Order_ID'
      );


    var paymentColumn =
      findDashboardColumn(
        headers,
        'Payment_Status'
      );


    if (
      orderIdColumn === -1 ||
      paymentColumn === -1
    ) {

      throw new Error(
        'Required payment columns were not found.'
      );

    }


    for (
      var r = 1;
      r < values.length;
      r++
    ) {

      if (
        dashboardClean(
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


/**
 * =========================================
 * READ SHEET
 * =========================================
 */

function readDashboardSheet(
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


  var result = [];


  for (
    var r = 1;
    r < values.length;
    r++
  ) {

    var object = {};


    headers.forEach(
      function(header, c) {

        object[
          String(
            header
          ).trim()
        ] =
          values[r][c];

      }
    );


    result.push(
      object
    );

  }


  return result;

}


/**
 * =========================================
 * FIND COLUMN
 * =========================================
 */

function findDashboardColumn(
  headers,
  name
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
        name
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
 * =========================================
 * GET FIELD
 * =========================================
 */

function dashboardField(
  object,
  fieldName
) {

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
      keys[i]
        .trim()
        .toLowerCase()

      ===

      fieldName
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
 * =========================================
 * CLEAN
 * =========================================
 */

function dashboardClean(
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
 * =========================================
 * FORMAT DATE
 * =========================================
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


  return dashboardClean(
    value
  );

}
