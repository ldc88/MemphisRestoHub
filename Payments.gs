/**
 * Utoy's Tapsi
 * PRODUCTS Synchronization
 *
 * Source:
 *   LOYVERSE_ITEMS
 *
 * Destination:
 *   PRODUCTS
 *
 * IMPORTANT:
 * This file does NOT modify:
 * - LOYVERSE_ITEMS
 * - MENU
 * - ORDERS
 * - ORDER_ITEMS
 * - PAYMENTS
 *
 * It only creates/maintains the PRODUCTS operational layer.
 */


/* =========================================================
 * CONFIGURATION
 * ======================================================= */

const PRODUCTS_SHEET = 'PRODUCTS';


const PRODUCTS_HEADERS = [
  'Product_ID',
  'Loyverse_Item_ID',
  'Handle',
  'Product_Name',
  'Category_ID',
  'Description',
  'Image_URL',
  'Available',
  'Track_Stock',
  'Featured',
  'Sort_Order',
  'Active',
  'Last_Synced'
];


/* =========================================================
 * MAIN SYNC
 * ======================================================= */


/**
 * Synchronize PRODUCTS from LOYVERSE_ITEMS.
 *
 * Safe behavior:
 * 1. Reads the complete existing LOYVERSE_ITEMS dataset.
 * 2. Builds all PRODUCTS rows in memory.
 * 3. Validates the complete dataset.
 * 4. Only then replaces PRODUCTS data.
 *
 * This means a failed build does not partially overwrite
 * the PRODUCTS sheet.
 */
function syncProductsFromLoyverse() {

  const startedAt = new Date();

  Logger.log('======================================');
  Logger.log("Utoy's PRODUCTS Sync");
  Logger.log('======================================');
  Logger.log('Started: ' + startedAt);


  try {

    /* -----------------------------------------------------
     * STEP 1 — Locate LOYVERSE_ITEMS
     * --------------------------------------------------- */

    const ss =
      SpreadsheetApp.getActiveSpreadsheet();


    if (!ss) {
      throw new Error(
        'Unable to access the active spreadsheet.'
      );
    }


    const sourceSheet =
      ss.getSheetByName(
        LOYVERSE_ITEMS_SHEET
      );


    if (!sourceSheet) {

      throw new Error(
        'LOYVERSE_ITEMS sheet does not exist. ' +
        'Run syncLoyverseItems() first.'
      );

    }


    /* -----------------------------------------------------
     * STEP 2 — Read source catalog
     * --------------------------------------------------- */

    Logger.log(
      'Reading LOYVERSE_ITEMS...'
    );


    const sourceData =
      readLoyverseItemsForProducts_(
        sourceSheet
      );


    if (!sourceData.length) {

      throw new Error(
        'LOYVERSE_ITEMS contains no product rows.'
      );

    }


    Logger.log(
      'Source parent items: ' +
      sourceData.length
    );


    /* -----------------------------------------------------
     * STEP 3 — Build PRODUCTS rows
     * --------------------------------------------------- */

    const rows =
      sourceData.map(function(item) {

        return buildProductRow_(
          item
        );

      });


    /* -----------------------------------------------------
     * STEP 4 — Validate
     * --------------------------------------------------- */

    validateProductRows_(
      rows
    );


    Logger.log(
      'Prepared PRODUCTS rows: ' +
      rows.length
    );


    /* -----------------------------------------------------
     * STEP 5 — Create / prepare PRODUCTS
     * --------------------------------------------------- */

    const productsSheet =
      getOrCreateProductsSheet_(
        ss
      );


    Logger.log(
      'Using sheet: ' +
      productsSheet.getName()
    );


    /* -----------------------------------------------------
     * STEP 6 — Write PRODUCTS
     * --------------------------------------------------- */

    writeProducts_(
      productsSheet,
      rows
    );


    /* -----------------------------------------------------
     * STEP 7 — Statistics
     * --------------------------------------------------- */

    let availableCount = 0;
    let activeCount = 0;
    let imageCount = 0;
    let trackedStockCount = 0;


    rows.forEach(function(row) {

      /*
       * Column indexes:
       * 0 Product_ID
       * 1 Loyverse_Item_ID
       * 2 Handle
       * 3 Product_Name
       * 4 Category_ID
       * 5 Description
       * 6 Image_URL
       * 7 Available
       * 8 Track_Stock
       * 9 Featured
       * 10 Sort_Order
       * 11 Active
       * 12 Last_Synced
       */

      if (row[6]) {
        imageCount++;
      }

      if (row[7] === true) {
        availableCount++;
      }

      if (row[8] === true) {
        trackedStockCount++;
      }

      if (row[11] === true) {
        activeCount++;
      }

    });


    const completedAt = new Date();


    Logger.log('');
    Logger.log('======================================');
    Logger.log('PRODUCTS SYNC COMPLETE');
    Logger.log('======================================');
    Logger.log(
      'Products: ' +
      rows.length
    );
    Logger.log(
      'Available: ' +
      availableCount
    );
    Logger.log(
      'Active: ' +
      activeCount
    );
    Logger.log(
      'With images: ' +
      imageCount
    );
    Logger.log(
      'Track stock: ' +
      trackedStockCount
    );
    Logger.log(
      'Started: ' +
      startedAt
    );
    Logger.log(
      'Completed: ' +
      completedAt
    );
    Logger.log('======================================');


    return {

      success: true,

      products:
        rows.length,

      available:
        availableCount,

      active:
        activeCount,

      withImages:
        imageCount,

      trackStock:
        trackedStockCount,

      startedAt:
        startedAt,

      completedAt:
        completedAt

    };


  } catch (error) {

    Logger.log('');
    Logger.log('======================================');
    Logger.log('PRODUCTS SYNC FAILED');
    Logger.log('======================================');
    Logger.log(
      error.message
    );
    Logger.log('======================================');

    throw error;

  }
}


/* =========================================================
 * SOURCE READING
 * ======================================================= */


/**
 * Reads LOYVERSE_ITEMS into objects using the header row.
 */
function readLoyverseItemsForProducts_(sheet) {

  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  if (
    lastRow <= 1 ||
    lastColumn <= 0
  ) {

    return [];

  }


  const values =
    sheet
      .getRange(
        1,
        1,
        lastRow,
        lastColumn
      )
      .getValues();


  const headers =
    values[0].map(function(header) {

      return String(
        header || ''
      ).trim();

    });


  const requiredHeaders = [

    'Loyverse_Item_ID',
    'Handle',
    'Item_Name',
    'Category_ID',
    'Description',
    'Image_URL',
    'Track_Stock',
    'Variants_JSON'

  ];


  requiredHeaders.forEach(
    function(requiredHeader) {

      if (
        headers.indexOf(
          requiredHeader
        ) === -1
      ) {

        throw new Error(
          'LOYVERSE_ITEMS is missing required column: ' +
          requiredHeader
        );

      }

    }
  );


  const objects = [];


  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    const row =
      values[rowIndex];


    const obj = {};


    headers.forEach(
      function(header, columnIndex) {

        obj[header] =
          row[columnIndex];

      }
    );


    /*
     * Ignore completely blank rows.
     */
    if (
      !obj.Loyverse_Item_ID
    ) {

      continue;

    }


    objects.push(
      obj
    );

  }


  return objects;
}


/* =========================================================
 * PRODUCT ROW BUILDING
 * ======================================================= */


/**
 * Converts one LOYVERSE_ITEMS record into
 * one PRODUCTS row.
 */
function buildProductRow_(item) {

  const loyverseItemId =
    cleanProductValue_(
      item.Loyverse_Item_ID
    );


  if (!loyverseItemId) {

    throw new Error(
      'Loyverse Item ID is missing.'
    );

  }


  /*
   * Stable Utoy's Product ID.
   *
   * Based on the permanent Loyverse item ID.
   */
  const productId =
    'PROD-' +
    loyverseItemId;


  /*
   * Determine availability from the
   * synchronized variant/store data.
   */
  const available =
    getProductAvailability_(
      item.Variants_JSON
    );


  /*
   * Preserve the stock-tracking setting
   * from Loyverse.
   */
  const trackStock =
    normalizeProductBoolean_(
      item.Track_Stock
    );


  /*
   * First import:
   * - Featured = false
   * - Sort_Order = 0
   * - Active = true
   *
   * These are intentionally Utoy's
   * operational fields rather than
   * Loyverse source fields.
   */
  const featured =
    false;


  const sortOrder =
    0;


  const active =
    true;


  return [

    /* Product_ID */
    productId,

    /* Loyverse_Item_ID */
    loyverseItemId,

    /* Handle */
    cleanProductValue_(
      item.Handle
    ),

    /* Product_Name */
    cleanProductValue_(
      item.Item_Name
    ),

    /* Category_ID */
    cleanProductValue_(
      item.Category_ID
    ),

    /* Description */
    cleanProductValue_(
      item.Description
    ),

    /* Image_URL */
    cleanProductValue_(
      item.Image_URL
    ),

    /* Available */
    available,

    /* Track_Stock */
    trackStock,

    /* Featured */
    featured,

    /* Sort_Order */
    sortOrder,

    /* Active */
    active,

    /* Last_Synced */
    new Date()

  ];
}


/* =========================================================
 * AVAILABILITY
 * ======================================================= */


/**
 * Determines whether a product is available for sale.
 *
 * LOYVERSE_ITEMS stores variants as JSON.
 *
 * A product is considered available when at least
 * one variant has at least one store with:
 *
 *   available_for_sale = true
 *
 * This is intentionally conservative and reflects
 * the actual Loyverse variant/store availability.
 */
function getProductAvailability_(
  variantsJson
) {

  if (
    variantsJson === null ||
    variantsJson === undefined ||
    variantsJson === ''
  ) {

    return false;

  }


  let variants;


  try {

    variants =
      JSON.parse(
        String(variantsJson)
      );

  } catch (error) {

    throw new Error(
      'Unable to parse Variants_JSON while building PRODUCTS.'
    );

  }


  if (!Array.isArray(variants)) {

    return false;

  }


  for (
    let i = 0;
    i < variants.length;
    i++
  ) {

    const variant =
      variants[i];


    /*
     * Loyverse normally supplies store
     * availability inside variant.stores.
     */
    if (
      !Array.isArray(
        variant.stores
      )
    ) {

      continue;

    }


    for (
      let j = 0;
      j < variant.stores.length;
      j++
    ) {

      const store =
        variant.stores[j];


      if (
        store &&
        store.available_for_sale === true
      ) {

        return true;

      }

    }

  }


  return false;
}


/* =========================================================
 * SHEET CREATION
 * ======================================================= */


/**
 * Creates PRODUCTS automatically if missing.
 */
function getOrCreateProductsSheet_(
  ss
) {

  let sheet =
    ss.getSheetByName(
      PRODUCTS_SHEET
    );


  if (!sheet) {

    Logger.log(
      'PRODUCTS does not exist. Creating it...'
    );


    sheet =
      ss.insertSheet(
        PRODUCTS_SHEET
      );

  }


  ensureProductsHeaders_(
    sheet
  );


  return sheet;
}


/**
 * Ensures PRODUCTS has the expected headers.
 */
function ensureProductsHeaders_(
  sheet
) {

  const requiredColumns =
    PRODUCTS_HEADERS.length;


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


  const currentHeaders =
    sheet
      .getRange(
        1,
        1,
        1,
        requiredColumns
      )
      .getValues()[0];


  let matches =
    true;


  for (
    let i = 0;
    i < requiredColumns;
    i++
  ) {

    if (
      String(
        currentHeaders[i] || ''
      ) !==
      PRODUCTS_HEADERS[i]
    ) {

      matches = false;
      break;

    }

  }


  if (!matches) {

    sheet
      .getRange(
        1,
        1,
        1,
        requiredColumns
      )
      .setValues([
        PRODUCTS_HEADERS
      ]);

  }


  sheet
    .getRange(
      1,
      1,
      1,
      requiredColumns
    )
    .setFontWeight(
      'bold'
    );


  sheet.setFrozenRows(
    1
  );
}


/* =========================================================
 * SAFE WRITING
 * ======================================================= */


/**
 * Replaces PRODUCTS data only after the complete
 * source catalog has already been prepared and validated.
 */
function writeProducts_(
  sheet,
  rows
) {

  const columnCount =
    PRODUCTS_HEADERS.length;


  const lastRow =
    sheet.getLastRow();


  /*
   * Clear existing product data.
   *
   * Header remains intact.
   */
  if (
    lastRow > 1
  ) {

    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        columnCount
      )
      .clearContent();

  }


  /*
   * Write new catalog.
   */
  if (
    rows.length > 0
  ) {

    sheet
      .getRange(
        2,
        1,
        rows.length,
        columnCount
      )
      .setValues(
        rows
      );

  }


  /*
   * Formatting.
   */
  sheet
    .getRange(
      1,
      1,
      Math.max(
        1,
        sheet.getLastRow()
      ),
      columnCount
    )
    .setVerticalAlignment(
      'top'
    );


  /*
   * Column widths.
   */
  sheet.setColumnWidth(
    1,
    230
  );

  sheet.setColumnWidth(
    2,
    230
  );

  sheet.setColumnWidth(
    3,
    150
  );

  sheet.setColumnWidth(
    4,
    240
  );

  sheet.setColumnWidth(
    5,
    230
  );

  sheet.setColumnWidth(
    6,
    320
  );

  sheet.setColumnWidth(
    7,
    350
  );

  sheet.setColumnWidth(
    8,
    110
  );

  sheet.setColumnWidth(
    9,
    110
  );

  sheet.setColumnWidth(
    10,
    100
  );

  sheet.setColumnWidth(
    11,
    100
  );

  sheet.setColumnWidth(
    12,
    100
  );

  sheet.setColumnWidth(
    13,
    170
  );


  /*
   * Wrap descriptions and URLs.
   */
  if (
    sheet.getLastRow() > 1
  ) {

    sheet
      .getRange(
        2,
        6,
        sheet.getLastRow() - 1,
        2
      )
      .setWrap(
        true
      );

  }


  /*
   * Number formatting.
   */
  if (
    sheet.getLastRow() > 1
  ) {

    sheet
      .getRange(
        2,
        11,
        sheet.getLastRow() - 1,
        1
      )
      .setNumberFormat(
        '0'
      );

  }
}


/* =========================================================
 * VALIDATION
 * ======================================================= */


/**
 * Validates the complete PRODUCTS dataset.
 */
function validateProductRows_(
  rows
) {

  if (
    !Array.isArray(rows)
  ) {

    throw new Error(
      'PRODUCTS rows are not an array.'
    );

  }


  const expectedColumns =
    PRODUCTS_HEADERS.length;


  const productIds =
    {};


  rows.forEach(
    function(row, index) {

      if (
        !Array.isArray(row)
      ) {

        throw new Error(
          'Invalid PRODUCTS row at index ' +
          index
        );

      }


      if (
        row.length !==
        expectedColumns
      ) {

        throw new Error(
          'Invalid column count at PRODUCTS row ' +
          (index + 2) +
          '. Expected ' +
          expectedColumns +
          ', received ' +
          row.length
        );

      }


      if (!row[0]) {

        throw new Error(
          'Product_ID is missing at PRODUCTS row ' +
          (index + 2)
        );

      }


      if (
        productIds[
          String(row[0])
        ]
      ) {

        throw new Error(
          'Duplicate Product_ID found: ' +
          row[0]
        );

      }


      productIds[
        String(row[0])
      ] = true;


      if (!row[1]) {

        throw new Error(
          'Loyverse_Item_ID is missing at PRODUCTS row ' +
          (index + 2)
        );

      }


      if (!row[3]) {

        throw new Error(
          'Product_Name is missing at PRODUCTS row ' +
          (index + 2)
        );

      }

    }
  );
}


/* =========================================================
 * VERIFICATION
 * ======================================================= */


/**
 * Verifies PRODUCTS without contacting Loyverse.
 */
function verifyProductsSheet() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      PRODUCTS_SHEET
    );


  if (!sheet) {

    throw new Error(
      'PRODUCTS sheet does not exist.'
    );

  }


  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  Logger.log('======================================');
  Logger.log('PRODUCTS VERIFICATION');
  Logger.log('======================================');
  Logger.log(
    'Rows including header: ' +
    lastRow
  );
  Logger.log(
    'Columns: ' +
    lastColumn
  );


  if (
    lastRow <= 1
  ) {

    Logger.log(
      'No PRODUCTS rows found.'
    );


    return {

      success: true,

      productCount: 0

    };

  }


  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        lastColumn
      )
      .getValues();


  let availableCount = 0;
  let activeCount = 0;
  let imageCount = 0;
  let featuredCount = 0;


  const productIds =
    {};


  values.forEach(
    function(row) {

      if (row[0]) {

        productIds[
          String(row[0])
        ] = true;

      }


      if (
        row[6]
      ) {

        imageCount++;

      }


      if (
        row[7] === true
      ) {

        availableCount++;

      }


      if (
        row[9] === true
      ) {

        featuredCount++;

      }


      if (
        row[11] === true
      ) {

        activeCount++;

      }

    }
  );


  const uniqueProductIds =
    Object.keys(
      productIds
    ).length;


  Logger.log(
    'Products: ' +
    values.length
  );


  Logger.log(
    'Unique Product IDs: ' +
    uniqueProductIds
  );


  Logger.log(
    'Available: ' +
    availableCount
  );


  Logger.log(
    'Active: ' +
    activeCount
  );


  Logger.log(
    'With images: ' +
    imageCount
  );


  Logger.log(
    'Featured: ' +
    featuredCount
  );


  Logger.log(
    '======================================');


  return {

    success: true,

    productCount:
      values.length,

    uniqueProductIds:
      uniqueProductIds,

    available:
      availableCount,

    active:
      activeCount,

    withImages:
      imageCount,

    featured:
      featuredCount

  };
}


/* =========================================================
 * VALUE HELPERS
 * ======================================================= */


/**
 * Converts null/undefined to blank text.
 */
function cleanProductValue_(
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
  );
}


/**
 * Normalizes boolean values.
 */
function normalizeProductBoolean_(
  value
) {

  if (
    value === true
  ) {

    return true;

  }


  if (
    value === false
  ) {

    return false;

  }


  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {

    return false;

  }


  const normalized =
    String(value)
      .trim()
      .toLowerCase();


  if (
    normalized === 'true' ||
    normalized === 'yes' ||
    normalized === 'y' ||
    normalized === '1'
  ) {

    return true;

  }


  return false;
}
