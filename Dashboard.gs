function getSheet(sheetName) {

  const ss =
    SpreadsheetApp.openById(
      CONFIG.SPREADSHEET_ID
    );

  const sheet =
    ss.getSheetByName(
      sheetName
    );

  if (!sheet) {

    throw new Error(
      'Sheet not found: ' +
      sheetName
    );

  }

  return sheet;

}


function getSheetData(sheetName) {

  const sheet =
    getSheet(sheetName);

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
        return String(header).trim();
      }
    );

  return values
    .slice(1)
    .map(function(row) {

      const record = {};

      headers.forEach(
        function(header, index) {

          record[header] =
            row[index];

        }
      );

      return record;

    });

}


function getSettings() {

  const data =
    getSheetData(
      CONFIG.SHEETS.SETTINGS
    );

  const settings = {};

  data.forEach(
    function(row) {

      if (row.Setting) {

        settings[
          String(row.Setting).trim()
        ] =
          row.Value;

      }

    }
  );

  return settings;

}
