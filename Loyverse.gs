/**
 * ============================================
 * UTOY'S TAPSI
 * MENU DATABASE FUNCTIONS
 * ============================================
 */


/**
 * Get all active restaurant categories.
 */
/**
 * function getCategories() {

  const categories = getSheetData(
    CONFIG.SHEETS.CATEGORIES
  );

  return categories

    .filter(function(category) {

      return String(
        category.Active || ''
      )
      .trim()
      .toUpperCase() === 'YES';

    })

    .map(function(category) {

      return {

        Category_ID:
          String(
            category.Category_ID || ''
          ).trim(),

        Category_Name:
          String(
            category.Category_Name || ''
          ).trim(),

        Sort_Order:
          Number(
            category.Sort_Order || 999
          ),

        Active:
          String(
            category.Active || ''
          ).trim()

      };

    })

    .sort(function(a, b) {

      return a.Sort_Order -
             b.Sort_Order;

    });

}
*/

/**
 * Get all available menu items.
 */
function getMenuItems() {

  const menu = getSheetData(
    CONFIG.SHEETS.MENU
  );

  return menu

    .filter(function(item) {

      return String(
        item.Available || ''
      )
      .trim()
      .toUpperCase() === 'YES';

    })

    .map(function(item) {

      return {

        Item_ID:
          String(
            item.Item_ID || ''
          ).trim(),

        SKU:
          String(
            item.SKU || ''
          ).trim(),

        Category_ID:
          String(
            item.Category_ID || ''
          ).trim(),

        Item_Name:
          String(
            item.Item_Name || ''
          ).trim(),

        Description:
          String(
            item.Description || ''
          ).trim(),

        Price:
          Number(
            item.Price || 0
          ),

        Cost:
          Number(
            item.Cost || 0
          ),

        Image_URL:
          String(
            item.Image_URL || ''
          ).trim(),

        Available:
          String(
            item.Available || ''
          ).trim(),

        Featured:
          String(
            item.Featured || ''
          ).trim(),

        Sort_Order:
          Number(
            item.Sort_Order || 999
          ),

        Loyverse_Item_ID:
          String(
            item.Loyverse_Item_ID || ''
          ).trim(),

        Loyverse_Variant_ID:
          String(
            item.Loyverse_Variant_ID || ''
          ).trim(),

        Track_Inventory:
          String(
            item.Track_Inventory || ''
          ).trim(),

        Stock_Status:
          String(
            item.Stock_Status || ''
          ).trim()

      };

    })

    .sort(function(a, b) {

      return a.Sort_Order -
             b.Sort_Order;

    });

}


/**
 * ============================================
 * MAIN MENU FUNCTION
 * ============================================
 *
 * This is the function that was missing.
 *
 * It combines:
 *
 * CATEGORIES
 * +
 * MENU ITEMS
 *
 * into one object for the web application.
 */
/**function getMenu() {

  const categories =
    getCategories();

  const items =
    getMenuItems();

  return {

    restaurant:
      CONFIG.APP_NAME,

    categories:
      categories,

    items:
      items,

    itemCount:
      items.length,

    categoryCount:
      categories.length

  };

}
*/

/**
 * ============================================
 * APPLICATION DATA TEST
 * ============================================
 *
 * Run this function from Apps Script
 * to verify that the entire menu database
 * is working.
 */
/**
 * function testApplicationData() {

  try {

    const data =
      getMenu();

    Logger.log(
      '================================'
    );

    Logger.log(
      'UTOY\'S MENU DATABASE TEST'
    );

    Logger.log(
      '================================'
    );

    Logger.log(
      'Restaurant: ' +
      data.restaurant
    );

    Logger.log(
      'Categories: ' +
      data.categoryCount
    );

    Logger.log(
      'Menu Items: ' +
      data.itemCount
    );

    Logger.log(
      '--------------------------------'
    );

    Logger.log(
      'CATEGORIES'
    );

    Logger.log(
      JSON.stringify(
        data.categories,
        null,
        2
      )
    );

    Logger.log(
      '--------------------------------'
    );

    Logger.log(
      'MENU ITEMS'
    );

    Logger.log(
      JSON.stringify(
        data.items,
        null,
        2
      )
    );

    Logger.log(
      '================================'
    );

    Logger.log(
      'TEST COMPLETED SUCCESSFULLY'
    );

    Logger.log(
      '================================'
    );

    return data;

  } catch (error) {

    Logger.log(
      '================================'
    );

    Logger.log(
      'MENU DATABASE ERROR'
    );

    Logger.log(
      '================================'
    );

    Logger.log(
      error.message
    );

    throw error;

  }

}

*/

/**
 * ============================================
 * SIMPLE MENU TEST
 * ============================================
 *
 * This is useful for checking only the
 * five menu products.
 */
function testMenuOnly() {

  const items =
    getMenuItems();

  Logger.log(
    '================================'
  );

  Logger.log(
    'MENU TEST'
  );

  Logger.log(
    '================================'
  );

  Logger.log(
    'Number of menu records: ' +
    items.length
  );

  items.forEach(
    function(item, index) {

      Logger.log(

        'Item ' +
        (index + 1) +
        ': ' +

        item.Item_ID +
        ' | ' +

        item.Item_Name +
        ' | Price=' +

        item.Price +
        ' | Available=' +

        item.Available

      );

    }
  );

  Logger.log(
    '================================'
  );

}
