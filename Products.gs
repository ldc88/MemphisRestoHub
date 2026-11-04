/**
 * ============================================================
 * UTOY'S TAPSI
 * QR CODE DATA LAYER
 * ============================================================
 *
 * QR_CODES is the operational QR registry.
 *
 * TABLES remains the source for table information.
 * QR_CODES stores the QR mapping used by the system.
 *
 * IMPORTANT:
 * - Does NOT modify ORDERS.
 * - Does NOT modify dashboard code.
 * - Does NOT replace the existing QR.html page.
 * - Does NOT depend on Loyverse.
 * ============================================================
 */

const QR_CODES_HEADERS = [
  'QR_Code_ID',
  'Table_ID',
  'Table_Name',
  'QR_Code',
  'QR_URL',
  'Status',
  'Created_At',
  'Last_Synced',
  'Notes'
];


/**
 * ============================================================
 * GET / CREATE QR_CODES SHEET
 * ============================================================
 */
function getOrCreateQrCodesSheet_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error(
      'Unable to access the active Google Spreadsheet.'
    );
  }

  let sheet =
    ss.getSheetByName('QR_CODES');

  if (!sheet) {

    sheet =
      ss.insertSheet('QR_CODES');

    sheet
      .getRange(
        1,
        1,
        1,
        QR_CODES_HEADERS.length
      )
      .setValues([
        QR_CODES_HEADERS
      ]);

    sheet
      .getRange(
        1,
        1,
        1,
        QR_CODES_HEADERS.length
      )
      .setFontWeight('bold');

    sheet.setFrozenRows(1);

  }

  return sheet;
}


/**
 * ============================================================
 * BUILD QR CODE ID
 * ============================================================
 */
function buildQrCodeId_(tableId) {

  const id =
    String(tableId || '').trim();

  if (!id) {
    throw new Error(
      'Cannot build QR_Code_ID without Table_ID.'
    );
  }

  return 'QR-' + id;
}


/**
 * ============================================================
 * READ TABLES FOR QR SYNC
 * ============================================================
 */
function getTablesForQrSync_() {

  const tables =
    getTables();

  if (!tables || !tables.length) {
    throw new Error(
      'No active tables found in TABLES.'
    );
  }

  return tables;
}


/**
 * ============================================================
 * BUILD QR_CODES ROWS
 * ============================================================
 */
function buildQrCodesRows_(tables) {

  const now =
    new Date();

  return tables.map(function(table) {

    const tableId =
      String(
        table.Table_ID || ''
      ).trim();

    const tableName =
      String(
        table.Table_Name ||
        tableId
      ).trim();

    const qrCode =
      String(
        table.QR_Code ||
        buildQrCodeId_(tableId)
      ).trim();

    const qrUrl =
      String(
        table.QR_URL ||
        buildTableUrl(tableId)
      ).trim();

    const status =
      String(
        table.Status ||
        'YES'
      ).trim().toUpperCase();

    return [
      buildQrCodeId_(tableId),
      tableId,
      tableName,
      qrCode,
      qrUrl,
      status,
      now,
      now,
      String(
        table.Notes || ''
      ).trim()
    ];

  });

}


/**
 * ============================================================
 * VALIDATE QR_CODES
 * ============================================================
 */
function validateQrCodesRows_(rows) {

  const seen =
    {};

  rows.forEach(function(row, index) {

    const rowNumber =
      index + 2;

    const qrCodeId =
      String(
        row[0] || ''
      ).trim();

    const tableId =
      String(
        row[1] || ''
      ).trim();

    const qrUrl =
      String(
        row[4] || ''
      ).trim();

    if (!qrCodeId) {
      throw new Error(
        'QR_CODES row ' +
        rowNumber +
        ' is missing QR_Code_ID.'
      );
    }

    if (!tableId) {
      throw new Error(
        'QR_CODES row ' +
        rowNumber +
        ' is missing Table_ID.'
      );
    }

    if (!qrUrl) {
      throw new Error(
        'QR_CODES row ' +
        rowNumber +
        ' is missing QR_URL.'
      );
    }

    if (seen[qrCodeId]) {
      throw new Error(
        'Duplicate QR_Code_ID: ' +
        qrCodeId
      );
    }

    seen[qrCodeId] =
      true;

  });

}


/**
 * ============================================================
 * WRITE QR_CODES
 * ============================================================
 */
function writeQrCodes_(rows) {

  const sheet =
    getOrCreateQrCodesSheet_();

  const requiredColumns =
    QR_CODES_HEADERS.length;

  /*
   * Make sure the sheet has enough columns.
   */
  if (
    sheet.getMaxColumns() <
    requiredColumns
  ) {

    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      requiredColumns -
      sheet.getMaxColumns()
    );

  }

  /*
   * Clear only the area maintained
   * by this QR system.
   */
  const lastRow =
    sheet.getLastRow();

  if (lastRow > 1) {

    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        requiredColumns
      )
      .clearContent();

  }

  /*
   * Restore headers.
   */
  sheet
    .getRange(
      1,
      1,
      1,
      requiredColumns
    )
    .setValues([
      QR_CODES_HEADERS
    ]);

  if (!rows.length) {
    SpreadsheetApp.flush();
    return;
  }

  sheet
    .getRange(
      2,
      1,
      rows.length,
      requiredColumns
    )
    .setValues(rows);

  SpreadsheetApp.flush();
}


/**
 * ============================================================
 * SYNC TABLES → QR_CODES
 * ============================================================
 */
function syncQrCodes() {

  const start =
    new Date().getTime();

  Logger.log(
    '=== UTOY\'S QR_CODES SYNC START ==='
  );

  const tables =
    getTablesForQrSync_();

  Logger.log(
    'Active TABLES: ' +
    tables.length
  );

  const rows =
    buildQrCodesRows_(tables);

  Logger.log(
    'Prepared QR_CODES rows: ' +
    rows.length
  );

  validateQrCodesRows_(
    rows
  );

  writeQrCodes_(
    rows
  );

  const elapsed =
    new Date().getTime() -
    start;

  Logger.log(
    'QR_CODES: ' +
    rows.length
  );

  Logger.log(
    'Elapsed ms: ' +
    elapsed
  );

  Logger.log(
    '=== UTOY\'S QR_CODES SYNC COMPLETE ==='
  );
}


/**
 * ============================================================
 * VERIFY QR_CODES
 * ============================================================
 */
function verifyQrCodes() {

  Logger.log(
    '=== QR_CODES VERIFICATION ==='
  );

  const sheet =
    getOrCreateQrCodesSheet_();

  const values =
    sheet.getDataRange()
      .getValues();

  if (values.length < 2) {

    Logger.log(
      'QR_CODES contains no records.'
    );

    return;

  }

  const headers =
    values[0].map(function(header) {

      return String(
        header
      ).trim();

    });

  const qrCodeIdColumn =
    headers.indexOf(
      'QR_Code_ID'
    );

  const tableIdColumn =
    headers.indexOf(
      'Table_ID'
    );

  const statusColumn =
    headers.indexOf(
      'Status'
    );

  const urlColumn =
    headers.indexOf(
      'QR_URL'
    );

  if (
    qrCodeIdColumn === -1 ||
    tableIdColumn === -1 ||
    statusColumn === -1 ||
    urlColumn === -1
  ) {

    throw new Error(
      'QR_CODES is missing one or more required columns.'
    );

  }

  const records =
    values.slice(1);

  const qrIds =
    {};

  const tableIds =
    {};

  let activeCount =
    0;

  let urlsCount =
    0;

  records.forEach(function(row) {

    const qrId =
      String(
        row[qrCodeIdColumn] || ''
      ).trim();

    const tableId =
      String(
        row[tableIdColumn] || ''
      ).trim();

    const status =
      String(
        row[statusColumn] || ''
      ).trim().toUpperCase();

    const url =
      String(
        row[urlColumn] || ''
      ).trim();

    if (qrId) {
      qrIds[qrId] = true;
    }

    if (tableId) {
      tableIds[tableId] = true;
    }

    if (status === 'YES') {
      activeCount++;
    }

    if (url) {
      urlsCount++;
    }

  });

  Logger.log(
    'Rows including header: ' +
    values.length
  );

  Logger.log(
    'Columns: ' +
    headers.length
  );

  Logger.log(
    'QR Codes: ' +
    records.length
  );

  Logger.log(
    'Unique QR_Code_IDs: ' +
    Object.keys(qrIds).length
  );

  Logger.log(
    'Unique Table_IDs: ' +
    Object.keys(tableIds).length
  );

  Logger.log(
    'Active QR Codes: ' +
    activeCount
  );

  Logger.log(
    'With QR URLs: ' +
    urlsCount
  );

  Logger.log(
    'Headers: ' +
    headers.join(' | ')
  );

  Logger.log(
    '=== QR_CODES VERIFICATION COMPLETE ==='
  );
}


/**
 * ============================================================
 * TEST QR_CODES
 * ============================================================
 */
function testQrCodes() {

  Logger.log(
    '=== QR_CODES TEST ==='
  );

  const tables =
    getTables();

  Logger.log(
    'Active tables: ' +
    tables.length
  );

  tables.forEach(function(table) {

    const tableId =
      String(
        table.Table_ID || ''
      ).trim();

    Logger.log(
      tableId +
      ' | ' +
      String(
        table.Table_Name ||
        tableId
      ).trim() +
      ' | ' +
      buildTableUrl(tableId)
    );

  });

  Logger.log(
    '=== QR_CODES TEST COMPLETE ==='
  );
}
