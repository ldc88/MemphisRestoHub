/**
 * ============================================================
 * UTOY'S TAPSI
 * TABLE / QR SYSTEM
 * ============================================================
 *
 * Canonical URL parameter:
 *
 *     tableId
 *
 * Example:
 *
 *     /exec?tableId=T01
 *
 * TABLES SHEET COLUMNS:
 *
 *     Table_ID
 *     Table_Name
 *     Area
 *     Capacity
 *     QR_Code
 *     QR_URL
 *     Status
 *     Current_Order
 *     Sort_Order
 *     Notes
 *
 * IMPORTANT:
 *     Status = YES means the table is active.
 *
 * ============================================================
 */


/**
 * ============================================================
 * GET TABLE SHEET
 * ============================================================
 */

function getTablesSheet() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {

    throw new Error(
      'Unable to access the active Google Spreadsheet.'
    );

  }

  const sheet =
    ss.getSheetByName(
      'TABLES'
    );

  if (!sheet) {

    throw new Error(
      'Sheet "TABLES" was not found.'
    );

  }

  return sheet;

}


/**
 * ============================================================
 * GET ALL ACTIVE TABLES
 * ============================================================
 *
 * Active table condition:
 *
 *     Status = YES
 *
 * Results are sorted by Sort_Order.
 *
 * ============================================================
 */

function getTables() {

  const sheet =
    getTablesSheet();


  const values =
    sheet
      .getDataRange()
      .getValues();


  if (
    values.length < 2
  ) {

    return [];

  }


  const headers =
    values[0].map(
      function(header) {

        return String(
          header
        ).trim();

      }
    );


  return values
    .slice(1)
    .map(
      function(row) {

        const record = {};

        headers.forEach(
          function(header, index) {

            record[header] =
              row[index];

          }
        );

        return record;

      }
    )
    .filter(
      function(row) {

        /*
         * Your TABLES sheet uses Status,
         * not Active.
         *
         * YES = active table.
         */

        return String(
          row.Status || 'YES'
        )
        .trim()
        .toUpperCase() === 'YES';

      }
    )
    .sort(
      function(a, b) {

        return Number(
          a.Sort_Order || 9999
        ) -
        Number(
          b.Sort_Order || 9999
        );

      }
    );

}


/**
 * ============================================================
 * GET ONE TABLE BY ID
 * ============================================================
 */

function getTableById(tableId) {

  const id =
    String(
      tableId || ''
    )
    .trim();


  if (!id) {

    return null;

  }


  const tables =
    getTables();


  for (
    let i = 0;
    i < tables.length;
    i++
  ) {

    const currentId =
      String(
        tables[i].Table_ID || ''
      )
      .trim();


    if (
      currentId === id
    ) {

      return tables[i];

    }

  }


  return null;

}


/**
 * ============================================================
 * PRODUCTION WEB APP URL
 * ============================================================
 *
 * IMPORTANT:
 * This is the existing production /exec URL.
 *
 * Do not change this unless the production deployment
 * itself changes.
 *
 * ============================================================
 */

function getProductionWebAppUrl() {

  return 'https://script.google.com/macros/s/AKfycbz4qgYtiftFU0BrnBXgT4W7IfPfsQAhX7m7VIQSjEvi7UFa8Y2JQm9r0viao0iL1M7Z/exec';

}


/**
 * ============================================================
 * BUILD TABLE URL
 * ============================================================
 */

function buildTableUrl(tableId) {

  const id =
    String(
      tableId || ''
    )
    .trim();


  if (!id) {

    throw new Error(
      'Table ID is required.'
    );

  }


  return (
    getProductionWebAppUrl() +
    '?tableId=' +
    encodeURIComponent(id)
  );

}


/**
 * ============================================================
 * GENERATE TABLE URLS
 * ============================================================
 *
 * Generates QR_URL for every active table.
 *
 * Active:
 *     Status = YES
 *
 * Inactive:
 *     Status != YES
 *
 * ============================================================
 */

function generateTableUrls() {

  const sheet =
    getTablesSheet();


  const values =
    sheet
      .getDataRange()
      .getValues();


  if (
    values.length < 2
  ) {

    throw new Error(
      'TABLES sheet contains no table records.'
    );

  }


  const headers =
    values[0].map(
      function(header) {

        return String(
          header
        ).trim();

      }
    );


  const tableIdColumn =
    headers.indexOf(
      'Table_ID'
    );


  const qrUrlColumn =
    headers.indexOf(
      'QR_URL'
    );


  const statusColumn =
    headers.indexOf(
      'Status'
    );


  if (
    tableIdColumn === -1
  ) {

    throw new Error(
      'TABLES sheet is missing the Table_ID column.'
    );

  }


  if (
    qrUrlColumn === -1
  ) {

    throw new Error(
      'TABLES sheet is missing the QR_URL column.'
    );

  }


  if (
    statusColumn === -1
  ) {

    throw new Error(
      'TABLES sheet is missing the Status column.'
    );

  }


  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    const tableId =
      String(
        values[rowIndex][tableIdColumn] || ''
      )
      .trim();


    if (!tableId) {

      continue;

    }


    const status =
      String(
        values[rowIndex][statusColumn] ||
        'YES'
      )
      .trim()
      .toUpperCase();


    if (
      status === 'YES'
    ) {

      sheet
        .getRange(
          rowIndex + 1,
          qrUrlColumn + 1
        )
        .setValue(
          buildTableUrl(
            tableId
          )
        );

    } else {

      sheet
        .getRange(
          rowIndex + 1,
          qrUrlColumn + 1
        )
        .clearContent();

    }

  }


  SpreadsheetApp.flush();


  Logger.log(
    'Table URLs generated successfully.'
  );

}


/**
 * ============================================================
 * TABLE SYSTEM TEST
 * ============================================================
 */

function testTables() {

  Logger.log(
    '================================'
  );

  Logger.log(
    'TABLE SYSTEM TEST'
  );

  Logger.log(
    '================================'
  );


  const tables =
    getTables();


  Logger.log(
    'Active tables: ' +
    tables.length
  );


  tables.forEach(
    function(table, index) {

      const id =
        table.Table_ID;

      const name =
        table.Table_Name;


      const url =
        buildTableUrl(
          id
        );


      Logger.log(
        'Table ' +
        (index + 1) +
        ': ' +
        id +
        ' | ' +
        name
      );


      Logger.log(
        'URL: ' +
        url
      );

    }
  );


  Logger.log(
    '================================'
  );

}


/**
 * ============================================================
 * DATA FOR QR MANAGEMENT PAGE
 * ============================================================
 *
 * Used by QR.html.
 *
 * ============================================================
 */

function getTablesForQrPage() {

  const tables =
    getTables();


  return tables.map(
    function(table) {

      const tableId =
        String(
          table.Table_ID || ''
        )
        .trim();


      const tableName =
        String(
          table.Table_Name ||
          tableId
        )
        .trim();


      return {

        tableId:
          tableId,

        tableName:
          tableName,

        url:
          buildTableUrl(
            tableId
          )

      };

    }
  );

}


/**
 * ============================================================
 * QR PAGE DATA TEST
 * ============================================================
 */

function testQrPageData() {

  Logger.log(
    '================================'
  );

  Logger.log(
    'QR PAGE DATA TEST'
  );

  Logger.log(
    '================================'
  );


  try {

    const data =
      getTablesForQrPage();


    Logger.log(
      'QR records: ' +
      data.length
    );


    data.forEach(
      function(row, index) {

        Logger.log(
          'QR ' +
          (index + 1) +
          ': ' +
          JSON.stringify(row)
        );

      }
    );


    Logger.log(
      '================================'
    );

  } catch (error) {

    Logger.log(
      'QR DATA ERROR: ' +
      (
        error.message ||
        error
      )
    );


    throw error;

  }

}
