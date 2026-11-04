/**
 * UTOY'S TAPSI
 * MODIFIERS + MODIFIER_OPTIONS SYNC
 *
 * Source of truth:
 *   Loyverse
 *
 * Destination:
 *   MODIFIERS
 *   MODIFIER_OPTIONS
 *
 * Operational rule:
 *   Only ACTIVE Loyverse modifiers and modifier options
 *   are written to the operational catalog sheets.
 *
 * Deleted Loyverse records are retrieved for inspection,
 * but excluded from MODIFIERS and MODIFIER_OPTIONS.
 *
 * This file does NOT modify:
 *   - ORDERS
 *   - ORDER_ITEMS
 *   - PRODUCTS
 *   - PRODUCT_VARIANTS
 *   - Customer UI
 *   - Dashboard
 *   - Production V23
 */


/* =========================================================
 * CONFIGURATION
 * ========================================================= */

const MODIFIERS_SHEET_NAME = 'MODIFIERS';
const MODIFIER_OPTIONS_SHEET_NAME = 'MODIFIER_OPTIONS';


const MODIFIERS_HEADERS = [
  'Modifier_ID',
  'Loyverse_Modifier_ID',
  'Modifier_Name',
  'Position',
  'Store_IDs_JSON',
  'Options_Count',
  'Active',
  'Created_At',
  'Updated_At',
  'Deleted_At',
  'Last_Synced'
];


const MODIFIER_OPTIONS_HEADERS = [
  'Modifier_Option_ID',
  'Modifier_ID',
  'Loyverse_Modifier_ID',
  'Loyverse_Option_ID',
  'Option_Name',
  'Price',
  'Position',
  'Active',
  'Created_At',
  'Updated_At',
  'Deleted_At',
  'Last_Synced'
];


/* =========================================================
 * LOYVERSE RETRIEVAL
 * ========================================================= */

/**
 * Retrieve all modifiers from Loyverse.
 *
 * show_deleted=true is intentional so that we can inspect
 * deleted records and understand the complete Loyverse state.
 *
 * Deleted records are NOT written to the operational
 * MODIFIERS / MODIFIER_OPTIONS sheets.
 */
function getAllLoyverseModifiersForSync_() {

  const modifiers = [];
  let cursor = null;

  while (true) {

    let endpoint =
      '/modifiers?limit=250&show_deleted=true';

    if (cursor) {
      endpoint +=
        '&cursor=' +
        encodeURIComponent(cursor);
    }

    const response =
      loyverseGet(endpoint);

    if (
      !response ||
      !Array.isArray(response.modifiers)
    ) {
      throw new Error(
        'Invalid Loyverse modifiers response.'
      );
    }

    response.modifiers.forEach(function(modifier) {
      modifiers.push(modifier);
    });

    cursor =
      response.cursor || null;

    if (!cursor) {
      break;
    }
  }

  return modifiers;
}


/* =========================================================
 * INSPECTION
 * ========================================================= */

/**
 * READ-ONLY inspection.
 *
 * This function does NOT create or modify any Sheet.
 *
 * Deleted modifiers and options are intentionally displayed
 * here so we can inspect Loyverse's complete modifier state.
 */
function inspectLoyverseModifiers() {

  const modifiers =
    getAllLoyverseModifiersForSync_();

  let totalOptions = 0;
  let activeModifiers = 0;
  let deletedModifiers = 0;

  Logger.log(
    '=== LOYVERSE MODIFIER INSPECTION ==='
  );

  Logger.log(
    'Total modifiers: ' +
    modifiers.length
  );

  modifiers.forEach(function(modifier, index) {

    const options =
      Array.isArray(modifier.modifier_options)
        ? modifier.modifier_options
        : [];

    totalOptions += options.length;

    const isDeleted =
      !!modifier.deleted_at;

    if (isDeleted) {
      deletedModifiers++;
    } else {
      activeModifiers++;
    }

    Logger.log(
      (index + 1) +
      '. ' +
      (modifier.name || '') +
      ' | ID: ' +
      (modifier.id || '') +
      ' | Position: ' +
      (modifier.position ?? '') +
      ' | Options: ' +
      options.length +
      ' | Deleted: ' +
      (modifier.deleted_at || 'NO')
    );

    options.forEach(function(option, optionIndex) {

      Logger.log(
        '   Option ' +
        (optionIndex + 1) +
        ': ' +
        (option.name || '') +
        ' | ID: ' +
        (option.id || '') +
        ' | Price: ' +
        (option.price ?? '') +
        ' | Position: ' +
        (option.position ?? '') +
        ' | Deleted: ' +
        (option.deleted_at || 'NO')
      );
    });
  });

  Logger.log(
    'Total modifier options: ' +
    totalOptions
  );

  Logger.log(
    'Active modifiers: ' +
    activeModifiers
  );

  Logger.log(
    'Deleted modifiers: ' +
    deletedModifiers
  );

  Logger.log(
    '=== LOYVERSE MODIFIER INSPECTION COMPLETE ==='
  );

  return {
    success: true,
    modifiers: modifiers.length,
    modifierOptions: totalOptions,
    activeModifiers: activeModifiers,
    deletedModifiers: deletedModifiers
  };
}


/* =========================================================
 * TRANSFORMATION
 * ========================================================= */

/**
 * Build MODIFIERS rows.
 *
 * IMPORTANT:
 * Only active Loyverse modifiers are written.
 *
 * Deleted modifiers are intentionally excluded because
 * MODIFIERS is an operational catalog table.
 */
function buildModifiersRows_(modifiers) {

  const now = new Date();

  const activeModifiers =
    modifiers.filter(function(modifier) {

      return !modifier.deleted_at;
    });

  return activeModifiers.map(function(modifier) {

    if (!modifier.id) {
      throw new Error(
        'Loyverse modifier is missing id.'
      );
    }

    if (!modifier.name) {
      throw new Error(
        'Loyverse modifier ' +
        modifier.id +
        ' is missing name.'
      );
    }

    /*
     * Only active options count toward the operational
     * Options_Count value.
     */
    const options =
      Array.isArray(modifier.modifier_options)
        ? modifier.modifier_options.filter(function(option) {

            return !option.deleted_at;

          })
        : [];

    return [
      'MOD-' + modifier.id,
      modifier.id,
      modifier.name,
      Number(modifier.position || 0),
      JSON.stringify(
        Array.isArray(modifier.stores)
          ? modifier.stores
          : []
      ),
      options.length,
      true,
      modifier.created_at || '',
      modifier.updated_at || '',
      '',
      now
    ];
  });
}


/**
 * Build MODIFIER_OPTIONS rows.
 *
 * One row per ACTIVE modifier option.
 *
 * Deleted modifiers are excluded.
 * Deleted options are excluded.
 */
function buildModifierOptionsRows_(modifiers) {

  const now = new Date();
  const rows = [];

  /*
   * Only process active modifiers.
   */
  const activeModifiers =
    modifiers.filter(function(modifier) {

      return !modifier.deleted_at;
    });

  activeModifiers.forEach(function(modifier) {

    const options =
      Array.isArray(modifier.modifier_options)
        ? modifier.modifier_options
        : [];

    /*
     * Only active options belong in the operational
     * MODIFIER_OPTIONS table.
     */
    const activeOptions =
      options.filter(function(option) {

        return !option.deleted_at;

      });

    activeOptions.forEach(function(option) {

      if (!option.id) {
        throw new Error(
          'Modifier option is missing id for modifier ' +
          modifier.id
        );
      }

      if (!option.name) {
        throw new Error(
          'Modifier option ' +
          option.id +
          ' is missing name.'
        );
      }

      rows.push([
        'MODOPT-' + option.id,
        'MOD-' + modifier.id,
        modifier.id,
        option.id,
        option.name,
        Number(option.price || 0),
        Number(option.position || 0),
        true,
        option.created_at || '',
        option.updated_at || '',
        '',
        now
      ]);
    });
  });

  return rows;
}


/* =========================================================
 * VALIDATION
 * ========================================================= */

function validateModifiersRows_(rows) {

  const modifierIds = {};
  const loyverseIds = {};
  const names = {};

  rows.forEach(function(row, index) {

    const rowNumber = index + 2;

    const modifierId =
      String(row[0] || '').trim();

    const loyverseId =
      String(row[1] || '').trim();

    const name =
      String(row[2] || '').trim();

    if (!modifierId) {
      throw new Error(
        'MODIFIERS validation failed: missing Modifier_ID at row ' +
        rowNumber
      );
    }

    if (!loyverseId) {
      throw new Error(
        'MODIFIERS validation failed: missing Loyverse_Modifier_ID at row ' +
        rowNumber
      );
    }

    if (!name) {
      throw new Error(
        'MODIFIERS validation failed: missing Modifier_Name at row ' +
        rowNumber
      );
    }

    if (modifierIds[modifierId]) {
      throw new Error(
        'Duplicate Modifier_ID detected: ' +
        modifierId
      );
    }

    if (loyverseIds[loyverseId]) {
      throw new Error(
        'Duplicate Loyverse_Modifier_ID detected: ' +
        loyverseId
      );
    }

    const nameKey =
      name.toLowerCase();

    if (names[nameKey]) {
      throw new Error(
        'Duplicate modifier name detected: ' +
        name
      );
    }

    modifierIds[modifierId] = true;
    loyverseIds[loyverseId] = true;
    names[nameKey] = true;
  });
}


/**
 * Validate modifier options.
 */
function validateModifierOptionsRows_(rows) {

  const optionIds = {};
  const loyverseOptionIds = {};

  rows.forEach(function(row, index) {

    const rowNumber = index + 2;

    const optionId =
      String(row[0] || '').trim();

    const modifierId =
      String(row[1] || '').trim();

    const loyverseOptionId =
      String(row[3] || '').trim();

    const name =
      String(row[4] || '').trim();

    if (!optionId) {
      throw new Error(
        'MODIFIER_OPTIONS validation failed: missing Modifier_Option_ID at row ' +
        rowNumber
      );
    }

    if (!modifierId) {
      throw new Error(
        'MODIFIER_OPTIONS validation failed: missing Modifier_ID at row ' +
        rowNumber
      );
    }

    if (!loyverseOptionId) {
      throw new Error(
        'MODIFIER_OPTIONS validation failed: missing Loyverse_Option_ID at row ' +
        rowNumber
      );
    }

    if (!name) {
      throw new Error(
        'MODIFIER_OPTIONS validation failed: missing Option_Name at row ' +
        rowNumber
      );
    }

    if (optionIds[optionId]) {
      throw new Error(
        'Duplicate Modifier_Option_ID detected: ' +
        optionId
      );
    }

    if (loyverseOptionIds[loyverseOptionId]) {
      throw new Error(
        'Duplicate Loyverse_Option_ID detected: ' +
        loyverseOptionId
      );
    }

    optionIds[optionId] = true;
    loyverseOptionIds[loyverseOptionId] = true;
  });
}


/* =========================================================
 * SHEETS
 * ========================================================= */

function getOrCreateModifiersSheet_() {

  const spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  let sheet =
    spreadsheet.getSheetByName(
      MODIFIERS_SHEET_NAME
    );

  if (!sheet) {
    sheet =
      spreadsheet.insertSheet(
        MODIFIERS_SHEET_NAME
      );
  }

  sheet
    .getRange(
      1,
      1,
      1,
      MODIFIERS_HEADERS.length
    )
    .setValues([
      MODIFIERS_HEADERS
    ]);

  return sheet;
}


function getOrCreateModifierOptionsSheet_() {

  const spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  let sheet =
    spreadsheet.getSheetByName(
      MODIFIER_OPTIONS_SHEET_NAME
    );

  if (!sheet) {
    sheet =
      spreadsheet.insertSheet(
        MODIFIER_OPTIONS_SHEET_NAME
      );
  }

  sheet
    .getRange(
      1,
      1,
      1,
      MODIFIER_OPTIONS_HEADERS.length
    )
    .setValues([
      MODIFIER_OPTIONS_HEADERS
    ]);

  return sheet;
}


/* =========================================================
 * WRITE HELPERS
 * ========================================================= */

function writeModifiers_(rows) {

  const sheet =
    getOrCreateModifiersSheet_();

  validateModifiersRows_(rows);

  const columnCount =
    MODIFIERS_HEADERS.length;

  const maxRows =
    sheet.getMaxRows();

  if (maxRows > 1) {

    sheet
      .getRange(
        2,
        1,
        maxRows - 1,
        columnCount
      )
      .clearContent();
  }

  if (rows.length > 0) {

    sheet
      .getRange(
        2,
        1,
        rows.length,
        columnCount
      )
      .setValues(rows);
  }

  sheet.setFrozenRows(1);

  sheet
    .getRange(
      1,
      1,
      1,
      columnCount
    )
    .setFontWeight('bold');

  if (rows.length > 0) {

    sheet
      .getRange(
        2,
        8,
        rows.length,
        4
      )
      .setNumberFormat(
        'yyyy-mm-dd hh:mm:ss'
      );
  }

  sheet.autoResizeColumns(
    1,
    columnCount
  );
}


function writeModifierOptions_(rows) {

  const sheet =
    getOrCreateModifierOptionsSheet_();

  validateModifierOptionsRows_(rows);

  const columnCount =
    MODIFIER_OPTIONS_HEADERS.length;

  const maxRows =
    sheet.getMaxRows();

  if (maxRows > 1) {

    sheet
      .getRange(
        2,
        1,
        maxRows - 1,
        columnCount
      )
      .clearContent();
  }

  if (rows.length > 0) {

    sheet
      .getRange(
        2,
        1,
        rows.length,
        columnCount
      )
      .setValues(rows);
  }

  sheet.setFrozenRows(1);

  sheet
    .getRange(
      1,
      1,
      1,
      columnCount
    )
    .setFontWeight('bold');

  if (rows.length > 0) {

    sheet
      .getRange(
        2,
        9,
        rows.length,
        3
      )
      .setNumberFormat(
        'yyyy-mm-dd hh:mm:ss'
      );
  }

  sheet.autoResizeColumns(
    1,
    columnCount
  );
}


/* =========================================================
 * MAIN SYNCHRONIZATION
 * ========================================================= */

/**
 * Synchronize both MODIFIERS and MODIFIER_OPTIONS.
 *
 * Workflow:
 *
 *   1. Retrieve complete Loyverse modifier data.
 *   2. Count active/deleted records.
 *   3. Build active operational rows.
 *   4. Validate everything.
 *   5. Only then modify Sheets.
 *
 * Deleted Loyverse records are excluded from the
 * operational catalog sheets.
 */
function syncLoyverseModifiers() {

  const startTime =
    new Date();

  Logger.log(
    '=== UTOY\'S MODIFIERS SYNC START ==='
  );

  const modifiers =
    getAllLoyverseModifiersForSync_();

  /*
   * Calculate source-state counts.
   */
  const activeModifiers =
    modifiers.filter(function(modifier) {

      return !modifier.deleted_at;

    }).length;

  const deletedModifiers =
    modifiers.filter(function(modifier) {

      return !!modifier.deleted_at;

    }).length;

  Logger.log(
    'Loyverse modifiers retrieved: ' +
    modifiers.length
  );

  Logger.log(
    'Active modifiers: ' +
    activeModifiers
  );

  Logger.log(
    'Deleted modifiers excluded: ' +
    deletedModifiers
  );

  /*
   * Build operational rows.
   *
   * These functions exclude deleted modifiers and
   * deleted modifier options.
   */
  const modifierRows =
    buildModifiersRows_(modifiers);

  const optionRows =
    buildModifierOptionsRows_(modifiers);

  Logger.log(
    'Prepared MODIFIERS rows: ' +
    modifierRows.length
  );

  Logger.log(
    'Prepared MODIFIER_OPTIONS rows: ' +
    optionRows.length
  );

  /*
   * Validate everything before writing.
   */
  validateModifiersRows_(
    modifierRows
  );

  validateModifierOptionsRows_(
    optionRows
  );

  /*
   * Only after validation do we touch Sheets.
   */
  writeModifiers_(
    modifierRows
  );

  writeModifierOptions_(
    optionRows
  );

  const elapsed =
    new Date().getTime() -
    startTime.getTime();

  Logger.log(
    'Modifiers: ' +
    modifierRows.length
  );

  Logger.log(
    'Modifier options: ' +
    optionRows.length
  );

  Logger.log(
    'Elapsed ms: ' +
    elapsed
  );

  Logger.log(
    '=== UTOY\'S MODIFIERS SYNC COMPLETE ==='
  );

  return {
    success: true,
    modifiers: modifierRows.length,
    modifierOptions: optionRows.length,
    activeModifiers: activeModifiers,
    deletedModifiersExcluded: deletedModifiers,
    elapsedMs: elapsed
  };
}


/* =========================================================
 * VERIFICATION
 * ========================================================= */

function verifyModifiersSync() {

  const spreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  const modifierSheet =
    spreadsheet.getSheetByName(
      MODIFIERS_SHEET_NAME
    );

  const optionSheet =
    spreadsheet.getSheetByName(
      MODIFIER_OPTIONS_SHEET_NAME
    );

  if (!modifierSheet) {
    throw new Error(
      'MODIFIERS sheet does not exist.'
    );
  }

  if (!optionSheet) {
    throw new Error(
      'MODIFIER_OPTIONS sheet does not exist.'
    );
  }

  const modifierLastRow =
    modifierSheet.getLastRow();

  const optionLastRow =
    optionSheet.getLastRow();

  const modifierRows =
    modifierLastRow > 1
      ? modifierSheet
          .getRange(
            2,
            1,
            modifierLastRow - 1,
            MODIFIERS_HEADERS.length
          )
          .getValues()
      : [];

  const optionRows =
    optionLastRow > 1
      ? optionSheet
          .getRange(
            2,
            1,
            optionLastRow - 1,
            MODIFIER_OPTIONS_HEADERS.length
          )
          .getValues()
      : [];

  const modifierIds = {};
  const loyverseModifierIds = {};

  modifierRows.forEach(function(row) {

    const id =
      String(row[0] || '').trim();

    const loyverseId =
      String(row[1] || '').trim();

    if (id) {

      if (modifierIds[id]) {
        throw new Error(
          'Duplicate Modifier_ID during verification: ' +
          id
        );
      }

      modifierIds[id] = true;
    }

    if (loyverseId) {

      if (loyverseModifierIds[loyverseId]) {
        throw new Error(
          'Duplicate Loyverse_Modifier_ID during verification: ' +
          loyverseId
        );
      }

      loyverseModifierIds[loyverseId] = true;
    }
  });

  const optionIds = {};
  const loyverseOptionIds = {};

  optionRows.forEach(function(row) {

    const id =
      String(row[0] || '').trim();

    const loyverseId =
      String(row[3] || '').trim();

    if (id) {

      if (optionIds[id]) {
        throw new Error(
          'Duplicate Modifier_Option_ID during verification: ' +
          id
        );
      }

      optionIds[id] = true;
    }

    if (loyverseId) {

      if (loyverseOptionIds[loyverseId]) {
        throw new Error(
          'Duplicate Loyverse_Option_ID during verification: ' +
          loyverseId
        );
      }

      loyverseOptionIds[loyverseId] = true;
    }
  });

  let activeModifiers = 0;
  let inactiveModifiers = 0;

  modifierRows.forEach(function(row) {

    const active =
      row[6] === true ||
      String(row[6]).toLowerCase() === 'true';

    if (active) {
      activeModifiers++;
    } else {
      inactiveModifiers++;
    }
  });

  let activeOptions = 0;
  let inactiveOptions = 0;

  optionRows.forEach(function(row) {

    const active =
      row[7] === true ||
      String(row[7]).toLowerCase() === 'true';

    if (active) {
      activeOptions++;
    } else {
      inactiveOptions++;
    }
  });

  Logger.log(
    '=== MODIFIERS VERIFICATION ==='
  );

  Logger.log(
    'MODIFIERS rows including header: ' +
    modifierLastRow
  );

  Logger.log(
    'MODIFIERS columns: ' +
    MODIFIERS_HEADERS.length
  );

  Logger.log(
    'Modifiers: ' +
    modifierRows.length
  );

  Logger.log(
    'Unique Modifier IDs: ' +
    Object.keys(modifierIds).length
  );

  Logger.log(
    'Unique Loyverse Modifier IDs: ' +
    Object.keys(loyverseModifierIds).length
  );

  Logger.log(
    'Active modifiers: ' +
    activeModifiers
  );

  Logger.log(
    'Inactive/deleted modifiers: ' +
    inactiveModifiers
  );

  Logger.log(
    'MODIFIER_OPTIONS rows including header: ' +
    optionLastRow
  );

  Logger.log(
    'MODIFIER_OPTIONS columns: ' +
    MODIFIER_OPTIONS_HEADERS.length
  );

  Logger.log(
    'Modifier options: ' +
    optionRows.length
  );

  Logger.log(
    'Unique Modifier Option IDs: ' +
    Object.keys(optionIds).length
  );

  Logger.log(
    'Unique Loyverse Option IDs: ' +
    Object.keys(loyverseOptionIds).length
  );

  Logger.log(
    'Active options: ' +
    activeOptions
  );

  Logger.log(
    'Inactive/deleted options: ' +
    inactiveOptions
  );

  Logger.log(
    '=== MODIFIERS VERIFICATION COMPLETE ==='
  );

  return {
    success: true,
    modifiers: modifierRows.length,
    modifierOptions: optionRows.length,
    uniqueModifierIds:
      Object.keys(modifierIds).length,
    uniqueLoyverseModifierIds:
      Object.keys(loyverseModifierIds).length,
    uniqueOptionIds:
      Object.keys(optionIds).length,
    uniqueLoyverseOptionIds:
      Object.keys(loyverseOptionIds).length,
    activeModifiers: activeModifiers,
    inactiveModifiers: inactiveModifiers,
    activeOptions: activeOptions,
    inactiveOptions: inactiveOptions
  };
}
