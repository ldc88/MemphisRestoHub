/**
 * Utoy's Tapsi
 * PRODUCT_VARIANTS Synchronization
 *
 * Source:
 *   LOYVERSE_ITEMS
 *   PRODUCTS
 *
 * Destination:
 *   PRODUCT_VARIANTS
 *
 * IMPORTANT:
 * This file does NOT modify:
 * - LOYVERSE_ITEMS
 * - PRODUCTS
 * - MENU
 * - ORDERS
 * - ORDER_ITEMS
 * - PAYMENTS
 */


/* =========================================================
 * CONFIGURATION
 * ======================================================= */

const PRODUCT_VARIANTS_SHEET = 'PRODUCT_VARIANTS';

const PRODUCT_VARIANTS_HEADERS = [
  'Product_Variant_ID',
  'Product_ID',
  'Loyverse_Item_ID',
  'Loyverse_Variant_ID',
  'SKU',
  'Reference_Variant_ID',
  'Option_1_Value',
  'Option_2_Value',
  'Option_3_Value',
  'Barcode',
  'Cost',
  'Purchase_Cost',
  'Pricing_Type',
  'Default_Price',
  'Store_ID',
  'Store_Price',
  'Available',
  'Optimal_Stock',
  'Low_Stock',
  'Last_Synced'
];


/* =========================================================
 * MAIN SYNCHRONIZATION
 * ======================================================= */

function syncProductVariantsFromLoyverse() {

  const startedAt = new Date();

  Logger.log('======================================');
  Logger.log("Utoy's PRODUCT_VARIANTS Sync");
  Logger.log('======================================');
  Logger.log('Started: ' + startedAt);


  try {

    const ss =
      SpreadsheetApp.getActiveSpreadsheet();


    if (!ss) {
      throw new Error(
        'Unable to access the active spreadsheet.'
      );
    }


    /* -----------------------------------------------------
     * STEP 1 — Locate source sheets
     * --------------------------------------------------- */

    const loyverseSheet =
      ss.getSheetByName(
        LOYVERSE_ITEMS_SHEET
      );


    const productsSheet =
      ss.getSheetByName(
        PRODUCTS_SHEET
      );


    if (!loyverseSheet) {

      throw new Error(
        'LOYVERSE_ITEMS sheet does not exist. ' +
        'Run syncLoyverseItems() first.'
      );

    }


    if (!productsSheet) {

      throw new Error(
        'PRODUCTS sheet does not exist. ' +
        'Run syncProductsFromLoyverse() first.'
      );

    }


    /* -----------------------------------------------------
     * STEP 2 — Read source data
     * --------------------------------------------------- */

    Logger.log(
      'Reading LOYVERSE_ITEMS...'
    );


    const loyverseItems =
      readLoyverseItemsForVariants_(
        loyverseSheet
      );


    Logger.log(
      'Parent items: ' +
      loyverseItems.length
    );


    Logger.log(
      'Reading PRODUCTS...'
    );


    const productMap =
      readProductsMapForVariants_(
        productsSheet
      );


    Logger.log(
      'PRODUCTS mapped: ' +
      Object.keys(productMap).length
    );


    /* -----------------------------------------------------
     * STEP 3 — Build variant rows
     * --------------------------------------------------- */

    const rows = [];


    loyverseItems.forEach(
      function(item) {

        const loyverseItemId =
          String(
            item.Loyverse_Item_ID
          );


        const product =
          productMap[
            loyverseItemId
          ];


        if (!product) {

          throw new Error(
            'No PRODUCTS record found for Loyverse Item ID: ' +
            loyverseItemId
          );

        }


        const variants =
          parseVariantsJson_(
            item.Variants_JSON
          );


        variants.forEach(
          function(variant) {

            rows.push(
              buildProductVariantRow_(
                item,
                product,
                variant
              )
            );

          }
        );

      }
    );


    /* -----------------------------------------------------
     * STEP 4 — Validate
     * --------------------------------------------------- */

    validateProductVariantRows_(
      rows
    );


    Logger.log(
      'Prepared PRODUCT_VARIANTS rows: ' +
      rows.length
    );


    /* -----------------------------------------------------
     * STEP 5 — Create / prepare sheet
     * --------------------------------------------------- */

    const variantSheet =
      getOrCreateProductVariantsSheet_(
        ss
      );


    Logger.log(
      'Using sheet: ' +
      variantSheet.getName()
    );


    /* -----------------------------------------------------
     * STEP 6 — Write
     * --------------------------------------------------- */

    writeProductVariants_(
      variantSheet,
      rows
    );


    /* -----------------------------------------------------
     * STEP 7 — Statistics
     * --------------------------------------------------- */

    let availableCount = 0;
    let skuCount = 0;
    let barcodeCount = 0;
    let pricedCount = 0;


    rows.forEach(
      function(row) {

        /*
         * 4 SKU
         * 9 Barcode
         * 13 Default Price
         * 16 Available
         */

        if (row[4]) {
          skuCount++;
        }

        if (row[9]) {
          barcodeCount++;
        }

        if (
          row[13] !== '' &&
          row[13] !== null
        ) {

          pricedCount++;

        }

        if (
          row[16] === true
        ) {

          availableCount++;

        }

      }
    );


    const completedAt =
      new Date();


    Logger.log('');
    Logger.log('======================================');
    Logger.log('PRODUCT_VARIANTS SYNC COMPLETE');
    Logger.log('======================================');
    Logger.log(
      'Variants: ' +
      rows.length
    );
    Logger.log(
      'Available: ' +
      availableCount
    );
    Logger.log(
      'With SKU: ' +
      skuCount
    );
    Logger.log(
      'With barcode: ' +
      barcodeCount
    );
    Logger.log(
      'With price: ' +
      pricedCount
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

      variants:
        rows.length,

      available:
        availableCount,

      withSku:
        skuCount,

      withBarcode:
        barcodeCount,

      withPrice:
        pricedCount,

      startedAt:
        startedAt,

      completedAt:
        completedAt

    };


  } catch (error) {

    Logger.log('');
    Logger.log('======================================');
    Logger.log('PRODUCT_VARIANTS SYNC FAILED');
    Logger.log('======================================');
    Logger.log(
      error.message
    );
    Logger.log('======================================');

    throw error;

  }
}


/* =========================================================
 * LOYVERSE ITEMS READING
 * ======================================================= */

function readLoyverseItemsForVariants_(
  sheet
) {

  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  if (
    lastRow <= 1
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
    values[0].map(
      function(header) {

        return String(
          header || ''
        ).trim();

      }
    );


  const requiredHeaders = [
    'Loyverse_Item_ID',
    'Variants_JSON'
  ];


  requiredHeaders.forEach(
    function(header) {

      if (
        headers.indexOf(header) === -1
      ) {

        throw new Error(
          'LOYVERSE_ITEMS is missing required column: ' +
          header
        );

      }

    }
  );


  const result = [];


  for (
    let r = 1;
    r < values.length;
    r++
  ) {

    const row =
      values[r];


    const item = {};


    headers.forEach(
      function(header, c) {

        item[header] =
          row[c];

      }
    );


    if (
      !item.Loyverse_Item_ID
    ) {

      continue;

    }


    result.push(
      item
    );

  }


  return result;
}


/* =========================================================
 * PRODUCTS MAP
 * ======================================================= */


/**
 * Maps:
 *
 * Loyverse_Item_ID
 *      ↓
 * Product_ID
 */
function readProductsMapForVariants_(
  sheet
) {

  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  if (
    lastRow <= 1
  ) {

    return {};

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
    values[0].map(
      function(header) {

        return String(
          header || ''
        ).trim();

      }
    );


  const itemIdColumn =
    headers.indexOf(
      'Loyverse_Item_ID'
    );


  const productIdColumn =
    headers.indexOf(
      'Product_ID'
    );


  if (
    itemIdColumn === -1
  ) {

    throw new Error(
      'PRODUCTS is missing Loyverse_Item_ID.'
    );

  }


  if (
    productIdColumn === -1
  ) {

    throw new Error(
      'PRODUCTS is missing Product_ID.'
    );

  }


  const map = {};


  for (
    let r = 1;
    r < values.length;
    r++
  ) {

    const loyverseItemId =
      String(
        values[r][itemIdColumn] || ''
      ).trim();


    const productId =
      String(
        values[r][productIdColumn] || ''
      ).trim();


    if (
      !loyverseItemId
    ) {

      continue;

    }


    if (
      !productId
    ) {

      throw new Error(
        'PRODUCTS row ' +
        (r + 1) +
        ' has no Product_ID.'
      );

    }


    if (
      map[loyverseItemId]
    ) {

      throw new Error(
        'Duplicate Loyverse_Item_ID in PRODUCTS: ' +
        loyverseItemId
      );

    }


    map[
      loyverseItemId
    ] = {

      productId:
        productId

    };

  }


  return map;
}


/* =========================================================
 * VARIANT JSON
 * ======================================================= */

function parseVariantsJson_(
  json
) {

  if (
    json === null ||
    json === undefined ||
    json === ''
  ) {

    return [];

  }


  let variants;


  try {

    variants =
      JSON.parse(
        String(json)
      );

  } catch (error) {

    throw new Error(
      'Unable to parse Variants_JSON.'
    );

  }


  if (
    !Array.isArray(variants)
  ) {

    throw new Error(
      'Variants_JSON is not an array.'
    );

  }


  return variants;
}


/* =========================================================
 * ROW BUILDING
 * ======================================================= */

function buildProductVariantRow_(
  item,
  product,
  variant
) {

  const loyverseItemId =
    cleanVariantValue_(
      item.Loyverse_Item_ID
    );


  const loyverseVariantId =
    cleanVariantValue_(
      variant.variant_id
    );


  if (
    !loyverseVariantId
  ) {

    throw new Error(
      'Variant is missing variant_id for Loyverse Item ID: ' +
      loyverseItemId
    );

  }


  /*
   * Stable Utoy's variant ID.
   */
  const productVariantId =
    'VAR-' +
    loyverseVariantId;


  /*
   * Loyverse variants can contain multiple stores.
   *
   * We create one PRODUCT_VARIANTS row per
   * Loyverse variant.
   *
   * The primary/current store information is taken
   * from the first store in the synchronized data.
   *
   * This keeps the first normalized layer simple.
   */
  const stores =
    Array.isArray(
      variant.stores
    )
      ? variant.stores
      : [];


  const store =
    stores.length > 0
      ? stores[0]
      : null;


  const storeId =
    store
      ? cleanVariantValue_(
          store.store_id
        )
      : '';


  const storePrice =
    store
      ? normalizeNumber_(
          store.price
        )
      : '';


  const available =
    store
      ? normalizeVariantBoolean_(
          store.available_for_sale
        )
      : false;


  const optimalStock =
    store
      ? normalizeNumber_(
          store.optimal_stock
        )
      : '';


  const lowStock =
    store
      ? normalizeNumber_(
          store.low_stock
        )
      : '';


  return [

    /* Product_Variant_ID */
    productVariantId,

    /* Product_ID */
    product.productId,

    /* Loyverse_Item_ID */
    loyverseItemId,

    /* Loyverse_Variant_ID */
    loyverseVariantId,

    /* SKU */
    cleanVariantValue_(
      variant.sku
    ),

    /* Reference_Variant_ID */
    cleanVariantValue_(
      variant.reference_variant_id
    ),

    /* Option 1 */
    cleanVariantValue_(
      variant.option1_value
    ),

    /* Option 2 */
    cleanVariantValue_(
      variant.option2_value
    ),

    /* Option 3 */
    cleanVariantValue_(
      variant.option3_value
    ),

    /* Barcode */
    cleanVariantValue_(
      variant.barcode
    ),

    /* Cost */
    normalizeNumber_(
      variant.cost
    ),

    /* Purchase Cost */
    normalizeNumber_(
      variant.purchase_cost
    ),

    /* Pricing Type */
    cleanVariantValue_(
      variant.default_pricing_type
    ),

    /* Default Price */
    normalizeNumber_(
      variant.default_price
    ),

    /* Store ID */
    storeId,

    /* Store Price */
    storePrice,

    /* Available */
    available,

    /* Optimal Stock */
    optimalStock,

    /* Low Stock */
    lowStock,

    /* Last Synced */
    new Date()

  ];
}


/* =========================================================
 * SHEET CREATION
 * ======================================================= */

function getOrCreateProductVariantsSheet_(
  ss
) {

  let sheet =
    ss.getSheetByName(
      PRODUCT_VARIANTS_SHEET
    );


  if (!sheet) {

    Logger.log(
      'PRODUCT_VARIANTS does not exist. Creating it...'
    );


    sheet =
      ss.insertSheet(
        PRODUCT_VARIANTS_SHEET
      );

  }


  ensureProductVariantsHeaders_(
    sheet
  );


  return sheet;
}


function ensureProductVariantsHeaders_(
  sheet
) {

  const requiredColumns =
    PRODUCT_VARIANTS_HEADERS.length;


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
      PRODUCT_VARIANTS_HEADERS[i]
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
        PRODUCT_VARIANTS_HEADERS
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

function writeProductVariants_(
  sheet,
  rows
) {

  const columnCount =
    PRODUCT_VARIANTS_HEADERS.length;


  const lastRow =
    sheet.getLastRow();


  /*
   * Do not clear anything until the
   * complete dataset has been built
   * and validated.
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
   * Useful widths.
   */
  const widths = [
    230, // Product Variant ID
    230, // Product ID
    230, // Loyverse Item ID
    230, // Loyverse Variant ID
    110, // SKU
    230, // Reference
    150, // Option 1
    150, // Option 2
    150, // Option 3
    150, // Barcode
    100, // Cost
    110, // Purchase Cost
    130, // Pricing
    110, // Default Price
    230, // Store ID
    110, // Store Price
    100, // Available
    110, // Optimal
    100, // Low
    170  // Synced
  ];


  widths.forEach(
    function(width, index) {

      sheet.setColumnWidth(
        index + 1,
        width
      );

    }
  );


  /*
   * Money / numeric fields.
   */
  if (
    sheet.getLastRow() > 1
  ) {

    sheet
      .getRange(
        2,
        11,
        sheet.getLastRow() - 1,
        4
      )
      .setNumberFormat(
        '0.00'
      );


    sheet
      .getRange(
        2,
        16,
        sheet.getLastRow() - 1,
        1
      )
      .setNumberFormat(
        '0.00'
      );

  }
}


/* =========================================================
 * VALIDATION
 * ======================================================= */

function validateProductVariantRows_(
  rows
) {

  if (
    !Array.isArray(rows)
  ) {

    throw new Error(
      'PRODUCT_VARIANTS rows are not an array.'
    );

  }


  const expectedColumns =
    PRODUCT_VARIANTS_HEADERS.length;


  const ids = {};
  const loyverseIds = {};


  rows.forEach(
    function(row, index) {

      const sheetRow =
        index + 2;


      if (
        !Array.isArray(row)
      ) {

        throw new Error(
          'Invalid PRODUCT_VARIANTS row at ' +
          sheetRow
        );

      }


      if (
        row.length !== expectedColumns
      ) {

        throw new Error(
          'Invalid column count at PRODUCT_VARIANTS row ' +
          sheetRow +
          '. Expected ' +
          expectedColumns +
          ', received ' +
          row.length
        );

      }


      if (!row[0]) {

        throw new Error(
          'Product_Variant_ID is missing at row ' +
          sheetRow
        );

      }


      if (!row[1]) {

        throw new Error(
          'Product_ID is missing at row ' +
          sheetRow
        );

      }


      if (!row[2]) {

        throw new Error(
          'Loyverse_Item_ID is missing at row ' +
          sheetRow
        );

      }


      if (!row[3]) {

        throw new Error(
          'Loyverse_Variant_ID is missing at row ' +
          sheetRow
        );

      }


      const productVariantId =
        String(row[0]);


      const loyverseVariantId =
        String(row[3]);


      if (
        ids[
          productVariantId
        ]
      ) {

        throw new Error(
          'Duplicate Product_Variant_ID: ' +
          productVariantId
        );

      }


      if (
        loyverseIds[
          loyverseVariantId
        ]
      ) {

        throw new Error(
          'Duplicate Loyverse_Variant_ID: ' +
          loyverseVariantId
        );

      }


      ids[
        productVariantId
      ] = true;


      loyverseIds[
        loyverseVariantId
      ] = true;

    }
  );
}


/* =========================================================
 * VERIFICATION
 * ======================================================= */

function verifyProductVariantsSheet() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      PRODUCT_VARIANTS_SHEET
    );


  if (!sheet) {

    throw new Error(
      'PRODUCT_VARIANTS sheet does not exist.'
    );

  }


  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  Logger.log('======================================');
  Logger.log('PRODUCT_VARIANTS VERIFICATION');
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
      'No PRODUCT_VARIANTS rows found.'
    );


    return {

      success: true,

      variantCount: 0

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


  const variantIds = {};
  const loyverseVariantIds = {};


  let availableCount = 0;
  let skuCount = 0;
  let barcodeCount = 0;


  values.forEach(
    function(row) {

      if (row[0]) {

        variantIds[
          String(row[0])
        ] = true;

      }


      if (row[3]) {

        loyverseVariantIds[
          String(row[3])
        ] = true;

      }


      if (row[4]) {

        skuCount++;

      }


      if (row[9]) {

        barcodeCount++;

      }


      if (
        row[16] === true
      ) {

        availableCount++;

      }

    }
  );


  const variantCount =
    values.length;


  const uniqueVariantIds =
    Object.keys(
      variantIds
    ).length;


  const uniqueLoyverseVariantIds =
    Object.keys(
      loyverseVariantIds
    ).length;


  Logger.log(
    'Variants: ' +
    variantCount
  );


  Logger.log(
    'Unique Product_Variant_IDs: ' +
    uniqueVariantIds
  );


  Logger.log(
    'Unique Loyverse Variant IDs: ' +
    uniqueLoyverseVariantIds
  );


  Logger.log(
    'Available: ' +
    availableCount
  );


  Logger.log(
    'With SKU: ' +
    skuCount
  );


  Logger.log(
    'With barcode: ' +
    barcodeCount
  );


  Logger.log('======================================');


  return {

    success: true,

    variantCount:
      variantCount,

    uniqueVariantIds:
      uniqueVariantIds,

    uniqueLoyverseVariantIds:
      uniqueLoyverseVariantIds,

    available:
      availableCount,

    withSku:
      skuCount,

    withBarcode:
      barcodeCount

  };
}


/* =========================================================
 * VALUE HELPERS
 * ======================================================= */

function cleanVariantValue_(
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


function normalizeVariantBoolean_(
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


  return (
    normalized === 'true' ||
    normalized === 'yes' ||
    normalized === 'y' ||
    normalized === '1'
  );
}


function normalizeNumber_(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {

    return '';

  }


  const number =
    Number(value);


  if (
    isNaN(number)
  ) {

    return String(
      value
    );

  }


  return number;
}
