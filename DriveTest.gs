<script>

let applicationData = null;

let cart = [];

let selectedCategory = 'ALL';

let selectedProduct = null;

let selectedQuantity = 1;


/* =========================================
   START APPLICATION
   ========================================= */

document.addEventListener(
  'DOMContentLoaded',
  function() {

    console.log(
      '================================='
    );

    console.log(
      'UTOY ORDERING SYSTEM START'
    );

    console.log(
      '================================='
    );

    displayTable();

    loadMenu();

  }
);


/* =========================================
   DISPLAY TABLE
   ========================================= */

function displayTable() {

  const element =
    document.getElementById(
      'tableDisplay'
    );

  if (!element) {
    return;
  }


  if (
    typeof APP_CONFIG !== 'undefined' &&
    APP_CONFIG.tableId
  ) {

    element.innerText =
      'Table: ' +
      APP_CONFIG.tableId;

  } else {

    element.innerText =
      'Online Menu';

  }

}


/* =========================================
   LOAD MENU
   ========================================= */

function loadMenu() {

  showLoading(
    'Connecting to menu database...'
  );


  google.script.run

    .withSuccessHandler(
      function(response) {

        console.log(
          'Menu response:',
          response
        );


        if (!response) {

          showError(
            'The server returned no data.'
          );

          return;

        }


        if (
          response.success !== true
        ) {

          showError(
            response.error ||
            'Unable to load menu.'
          );

          return;

        }


        applicationData =
          response.data;


        if (!applicationData) {

          showError(
            'Restaurant data is empty.'
          );

          return;

        }


        console.log(
          'Categories:',
          applicationData.categories
        );

        console.log(
          'Items:',
          applicationData.items
        );


        displayCategories();

        displayMenu();

        updateCartDisplay();

      }
    )

    .withFailureHandler(
      function(error) {

        console.error(
          'Menu loading error:',
          error
        );


        showError(

          'Unable to connect to menu server.' +

          '<br><br>' +

          escapeHtml(
            error &&
            error.message
              ? error.message
              : ''
          )

        );

      }
    )

    .getMenuForBrowser();

}


/* =========================================
   LOADING MESSAGE
   ========================================= */

function showLoading(message) {

  const container =
    document.getElementById(
      'menuContainer'
    );


  if (!container) {
    return;
  }


  container.innerHTML =

    '<div class="loading">' +

    escapeHtml(message) +

    '</div>';

}


/* =========================================
   ERROR MESSAGE
   ========================================= */

function showError(message) {

  const container =
    document.getElementById(
      'menuContainer'
    );


  if (!container) {
    return;
  }


  container.innerHTML =

    '<div class="error-box">' +

      '<h3>Unable to Load Menu</h3>' +

      '<p>' +

      message +

      '</p>' +

      '<button onclick="location.reload()">' +

      'RETRY' +

      '</button>' +

    '</div>';

}


/* =========================================
   DISPLAY CATEGORIES
   ========================================= */

function displayCategories() {

  const container =
    document.getElementById(
      'categoryContainer'
    );


  if (!container) {
    return;
  }


  let html =

    '<button ' +

      'class="category-button active" ' +

      'onclick="selectCategory(\'ALL\', this)">' +

      'All' +

    '</button>';


  const categories =
    applicationData.categories || [];


  categories.forEach(
    function(category) {

      if (
        !category.Category_ID
      ) {

        return;

      }


      html +=

        '<button ' +

          'class="category-button" ' +

          'onclick="selectCategory(\'' +

          escapeAttribute(
            category.Category_ID
          ) +

          '\', this)">' +

          escapeHtml(
            category.Category_Name || ''
          ) +

        '</button>';

    }
  );


  container.innerHTML =
    html;

}


/* =========================================
   SELECT CATEGORY
   ========================================= */

function selectCategory(
  categoryId,
  button
) {

  selectedCategory =
    categoryId;


  document
    .querySelectorAll(
      '.category-button'
    )
    .forEach(
      function(btn) {

        btn.classList.remove(
          'active'
        );

      }
    );


  if (button) {

    button.classList.add(
      'active'
    );

  }


  displayMenu();

}


/* =========================================
   DISPLAY MENU
   ========================================= */

function displayMenu() {

  const container =
    document.getElementById(
      'menuContainer'
    );


  if (!container) {
    return;
  }


  if (!applicationData) {

    showLoading(
      'Loading menu...'
    );

    return;

  }


  let items =
    applicationData.items || [];


  /*
   * IMPORTANT:
   * Category filtering is made
   * tolerant of spaces and case.
   */

  if (
    selectedCategory !== 'ALL'
  ) {

    items =
      items.filter(
        function(item) {

          const itemCategory =
            String(
              item.Category_ID || ''
            )
            .trim()
            .toUpperCase();


          const chosenCategory =
            String(
              selectedCategory || ''
            )
            .trim()
            .toUpperCase();


          return (
            itemCategory ===
            chosenCategory
          );

        }
      );

  }


  /*
   * No products found
   */

  if (!items.length) {

    container.innerHTML =

      '<div class="loading">' +

      'No items available in this category.' +

      '</div>';

    return;

  }


  let html = '';


  items.forEach(
    function(item) {

      const itemId =
        escapeAttribute(
          item.Item_ID
        );


      const image =
        item.Image_URL || '';


      html +=

        '<article class="menu-item">';


      /*
       * PRODUCT IMAGE
       */

      if (image) {

        html +=

          '<img ' +

            'class="menu-image" ' +

            'src="' +

            escapeAttribute(
              image
            ) +

            '" ' +

            'alt="' +

            escapeAttribute(
              item.Item_Name
            ) +

            '" ' +

            'onerror="this.style.display=\'none\'">' ;

      }


      /*
       * PRODUCT CONTENT
       */

      html +=

        '<div class="menu-content">' +


          '<div class="menu-name">' +

            escapeHtml(
              item.Item_Name || ''
            ) +

          '</div>' +


          '<div class="menu-description">' +

            escapeHtml(
              item.Description || ''
            ) +

          '</div>' +


          '<div class="menu-price">' +

            '₱' +

            Number(
              item.Price || 0
            ).toFixed(2) +

          '</div>' +


          '<button ' +

            'class="add-button" ' +

            'onclick="openProduct(\'' +

            itemId +

            '\')">' +

            'ADD TO ORDER' +

          '</button>' +


        '</div>' +


      '</article>';

    }
  );


  container.innerHTML =
    html;

}


/* =========================================
   OPEN PRODUCT
   ========================================= */

function openProduct(itemId) {

  if (!applicationData) {

    alert(
      'Menu data is not ready.'
    );

    return;

  }


  selectedProduct =
    applicationData.items.find(
      function(item) {

        return String(
          item.Item_ID
        ).trim()

        ===

        String(
          itemId
        ).trim();

      }
    );


  if (!selectedProduct) {

    alert(
      'Product could not be found.'
    );

    return;

  }


  selectedQuantity = 1;


  renderProductModal();

}


/* =========================================
   PRODUCT MODAL
   ========================================= */

function renderProductModal() {

  closeProductModal();


  const overlay =
    document.createElement(
      'div'
    );


  overlay.id =
    'productModal';


  overlay.className =
    'product-modal-overlay';


  const product =
    selectedProduct;


  const price =
    Number(
      product.Price || 0
    );


  overlay.innerHTML =

    '<div class="product-modal">' +


      /*
       * CLOSE BUTTON
       */

      '<button ' +

        'class="modal-close" ' +

        'onclick="closeProductModal()">' +

        '×' +

      '</button>' +


      /*
       * PRODUCT NAME
       */

      '<div class="modal-title">' +

        escapeHtml(
          product.Item_Name || ''
        ) +

      '</div>' +


      /*
       * DESCRIPTION
       */

      '<div class="modal-description">' +

        escapeHtml(
          product.Description || ''
        ) +

      '</div>' +


      /*
       * PRICE
       */

      '<div class="modal-price">' +

        '₱' +

        price.toFixed(2) +

      '</div>' +


      /*
       * SPECIAL INSTRUCTIONS
       */

      '<div class="modal-section">' +

        '<label>' +

          'SPECIAL INSTRUCTIONS' +

        '</label>' +

        '<textarea ' +

          'id="specialInstructions" ' +

          'placeholder="Example: Less rice, no onions...">' +

        '</textarea>' +

      '</div>' +


      /*
       * QUANTITY
       */

      '<div class="modal-section">' +

        '<label>' +

          'QUANTITY' +

        '</label>' +


        '<div class="quantity-control">' +


          '<button ' +

            'onclick="changeQuantity(-1)">' +

            '−' +

          '</button>' +


          '<span ' +

            'id="productQuantity">' +

            '1' +

          '</span>' +


          '<button ' +

            'onclick="changeQuantity(1)">' +

            '+' +

          '</button>' +


        '</div>' +


      '</div>' +


      /*
       * TOTAL
       */

      '<div class="modal-total">' +

        'Total: ₱' +

        '<span id="productTotal">' +

          price.toFixed(2) +

        '</span>' +

      '</div>' +


      /*
       * ADD TO CART
       */

      '<button ' +

        'class="modal-add-button" ' +

        'onclick="confirmAddToCart()">' +

        'ADD TO CART' +

      '</button>' +


    '</div>';


  document.body.appendChild(
    overlay
  );


  /*
   * Clicking outside modal
   * closes it.
   */

  overlay.addEventListener(
    'click',
    function(event) {

      if (
        event.target === overlay
      ) {

        closeProductModal();

      }

    }
  );

}


/* =========================================
   CLOSE PRODUCT MODAL
   ========================================= */

function closeProductModal() {

  const modal =
    document.getElementById(
      'productModal'
    );


  if (modal) {

    modal.remove();

  }

}


/* =========================================
   CHANGE QUANTITY
   ========================================= */

function changeQuantity(amount) {

  selectedQuantity +=
    Number(amount);


  if (
    selectedQuantity < 1
  ) {

    selectedQuantity = 1;

  }


  if (
    selectedQuantity > 99
  ) {

    selectedQuantity = 99;

  }


  const quantityElement =
    document.getElementById(
      'productQuantity'
    );


  const totalElement =
    document.getElementById(
      'productTotal'
    );


  if (quantityElement) {

    quantityElement.innerText =
      selectedQuantity;

  }


  if (
    totalElement &&
    selectedProduct
  ) {

    const price =
      Number(
        selectedProduct.Price || 0
      );


    totalElement.innerText =

      (
        price *
        selectedQuantity
      ).toFixed(2);

  }

}


/* =========================================
   ADD PRODUCT TO CART
   ========================================= */

function confirmAddToCart() {

  if (!selectedProduct) {

    return;

  }


  const instructionsElement =
    document.getElementById(
      'specialInstructions'
    );


  const instructions =
    instructionsElement

      ? instructionsElement.value.trim()

      : '';


  /*
   * Each selection is kept
   * as its own cart line.
   *
   * This is important because
   * two identical products may
   * eventually have different
   * modifiers or instructions.
   */

  cart.push({

    Line_ID:
      createLineId(),

    Item_ID:
      selectedProduct.Item_ID,

    Item_Name:
      selectedProduct.Item_Name,

    Price:
      Number(
        selectedProduct.Price || 0
      ),

    Qty:
      selectedQuantity,

    Special_Instructions:
      instructions

  });


  closeProductModal();


  updateCartDisplay();


  showCartNotification();

}


/* =========================================
   CREATE CART LINE ID
   ========================================= */

function createLineId() {

  return (

    Date.now().toString() +

    Math.random()
      .toString(36)
      .substring(2, 8)

  );

}


/* =========================================
   CART NOTIFICATION
   ========================================= */

function showCartNotification() {

  const existing =
    document.getElementById(
      'cartNotification'
    );


  if (existing) {

    existing.remove();

  }


  const notification =
    document.createElement(
      'div'
    );


  notification.id =
    'cartNotification';


  notification.className =
    'cart-notification';


  notification.innerText =
    'Added to cart ✓';


  document.body.appendChild(
    notification
  );


  setTimeout(
    function() {

      if (
        notification.parentNode
      ) {

        notification.remove();

      }

    },
    1800
  );

}


/* =========================================
   UPDATE CART BAR
   ========================================= */

function updateCartDisplay() {

  const countElement =
    document.getElementById(
      'cartCount'
    );


  const totalElement =
    document.getElementById(
      'cartTotal'
    );


  if (
    !countElement ||
    !totalElement
  ) {

    return;

  }


  let count = 0;

  let total = 0;


  cart.forEach(
    function(item) {

      count +=
        Number(
          item.Qty || 0
        );


      total +=

        Number(
          item.Qty || 0
        ) *

        Number(
          item.Price || 0
        );

    }
  );


  countElement.innerText =
    count;


  totalElement.innerText =
    '₱' +
    total.toFixed(2);

}


/* =========================================
   VIEW CART
   ========================================= */

function viewCart() {

  renderCartModal();

}


/* =========================================
   RENDER CART
   ========================================= */

function renderCartModal() {

  closeCartModal();


  const overlay =
    document.createElement(
      'div'
    );


  overlay.id =
    'cartModal';


  overlay.className =
    'product-modal-overlay';


  /*
   * EMPTY CART
   */

  if (!cart.length) {

    overlay.innerHTML =

      '<div class="product-modal">' +


        '<button ' +

          'class="modal-close" ' +

          'onclick="closeCartModal()">' +

          '×' +

        '</button>' +


        '<div class="modal-title">' +

          'Your Cart' +

        '</div>' +


        '<div class="empty-cart">' +

          'Your cart is empty.' +

        '</div>' +


      '</div>';


    document.body.appendChild(
      overlay
    );


    return;

  }


  let html =

    '<div class="product-modal">' +


      '<button ' +

        'class="modal-close" ' +

        'onclick="closeCartModal()">' +

        '×' +

      '</button>' +


      '<div class="modal-title">' +

        'Your Order' +

      '</div>';


  /*
   * CART ITEMS
   */

  cart.forEach(
    function(item, index) {

      const lineTotal =

        Number(
          item.Price || 0
        ) *

        Number(
          item.Qty || 0
        );


      html +=

        '<div class="cart-item">' +


          '<div>' +


            '<strong>' +

              escapeHtml(
                item.Item_Name || ''
              ) +

            '</strong>' +


            '<div>' +

              '₱' +

              Number(
                item.Price || 0
              ).toFixed(2) +

              ' × ' +

              Number(
                item.Qty || 0
              ) +

            '</div>';


      /*
       * SPECIAL INSTRUCTIONS
       */

      if (
        item.Special_Instructions
      ) {

        html +=

          '<div class="cart-instruction">' +

            escapeHtml(
              item.Special_Instructions
            ) +

          '</div>';

      }


      /*
       * LINE TOTAL
       */

      html +=

            '<div>' +

              'Line total: ₱' +

              lineTotal.toFixed(2) +

            '</div>' +


          '</div>' +


          '<button ' +

            'class="remove-button" ' +

            'onclick="removeCartItem(' +

              index +

            ')">' +

            'REMOVE' +

          '</button>' +


        '</div>';

    }
  );


  /*
   * GRAND TOTAL
   */

  html +=

      '<div class="cart-grand-total">' +

        'TOTAL: ₱' +

        calculateCartTotal()
          .toFixed(2) +

      '</div>' +


      '<button ' +

        'class="modal-add-button" ' +

        'onclick="beginCheckout()">' +

        'PROCEED TO CHECKOUT' +

      '</button>' +


    '</div>';


  overlay.innerHTML =
    html;


  document.body.appendChild(
    overlay
  );


  /*
   * Clicking outside closes cart.
   */

  overlay.addEventListener(
    'click',
    function(event) {

      if (
        event.target === overlay
      ) {

        closeCartModal();

      }

    }
  );

}


/* =========================================
   CLOSE CART
   ========================================= */

function closeCartModal() {

  const modal =
    document.getElementById(
      'cartModal'
    );


  if (modal) {

    modal.remove();

  }

}


/* =========================================
   REMOVE CART ITEM
   ========================================= */

function removeCartItem(index) {

  if (
    index < 0 ||
    index >= cart.length
  ) {

    return;

  }


  cart.splice(
    index,
    1
  );


  updateCartDisplay();


  renderCartModal();

}


/* =========================================
   CALCULATE CART TOTAL
   ========================================= */

function calculateCartTotal() {

  return cart.reduce(

    function(total, item) {

      return total +

        (

          Number(
            item.Qty || 0
          ) *

          Number(
            item.Price || 0
          )

        );

    },

    0

  );

}


/* =========================================
   CHECKOUT
   ========================================= */

function beginCheckout() {

  if (!cart.length) {

    alert(
      'Your cart is empty.'
    );

    return;

  }


  closeCartModal();


  const overlay =
    document.createElement(
      'div'
    );


  overlay.id =
    'checkoutModal';


  overlay.className =
    'product-modal-overlay';


  let tableValue = '';


  if (
    typeof APP_CONFIG !== 'undefined' &&
    APP_CONFIG.tableId
  ) {

    tableValue =
      APP_CONFIG.tableId;

  }


  overlay.innerHTML =

    '<div class="product-modal">' +


      '<button ' +

        'class="modal-close" ' +

        'onclick="closeCheckoutModal()">' +

        '×' +

      '</button>' +


      '<div class="modal-title">' +

        'Checkout' +

      '</div>' +


      '<div class="checkout-summary">' +

        '<strong>Order Summary</strong>' +

        '<br>' +

        cart.length +

        ' item line(s)' +

        '<br>' +

        'Total: ₱' +

        calculateCartTotal()
          .toFixed(2) +

      '</div>' +


      '<div class="checkout-section">' +

        '<label>' +

          'CUSTOMER NAME *' +

        '</label>' +

        '<input ' +

          'type="text" ' +

          'id="checkoutCustomerName" ' +

          'placeholder="Your name">' +

      '</div>' +


      '<div class="checkout-section">' +

        '<label>' +

          'CONTACT NUMBER' +

        '</label>' +

        '<input ' +

          'type="tel" ' +

          'id="checkoutCustomerPhone" ' +

          'placeholder="09XXXXXXXXX">' +

      '</div>' +


      '<div class="checkout-section">' +

        '<label>' +

          'ORDER TYPE *' +

        '</label>' +


        '<select ' +

          'id="checkoutOrderType">' +


          '<option value="DINE_IN">' +

            'Dine-in' +

          '</option>' +


          '<option value="TAKEOUT">' +

            'Takeout' +

          '</option>' +


        '</select>' +

      '</div>' +


      '<div class="checkout-section">' +

        '<label>' +

          'PAYMENT METHOD *' +

        '</label>' +


        '<select ' +

          'id="checkoutPaymentMethod">' +


          '<option value="CASH">' +

            'Cash' +

          '</option>' +


          '<option value="GCASH">' +

            'GCash' +

          '</option>' +


          '<option value="MAYA">' +

            'Maya' +

          '</option>' +


          '<option value="CARD">' +

            'Card' +

          '</option>' +


        '</select>' +

      '</div>' +


      '<div class="checkout-section">' +

        '<label>' +

          'ORDER NOTES' +

        '</label>' +


        '<textarea ' +

          'id="checkoutCustomerNotes" ' +

          'placeholder="Any additional instructions...">' +

        '</textarea>' +

      '</div>' +


      '<div class="checkout-table">' +

        (
          tableValue
            ? 'Table: ' +
              escapeHtml(
                tableValue
              )
            : 'Online Order'
        ) +

      '</div>' +


      '<div class="checkout-final-total">' +

        'TOTAL: ₱' +

        calculateCartTotal()
          .toFixed(2) +

      '</div>' +


      '<button ' +

        'id="submitOrderButton" ' +

        'class="modal-add-button" ' +

        'onclick="submitCheckoutOrder()">' +

        'SUBMIT ORDER' +

      '</button>' +


    '</div>';


  document.body.appendChild(
    overlay
  );


  overlay.addEventListener(
    'click',
    function(event) {

      if (
        event.target === overlay
      ) {

        closeCheckoutModal();

      }

    }
  );

}


/**
 * =========================================
 * CLOSE CHECKOUT
 * =========================================
 */

function closeCheckoutModal() {

  const modal =
    document.getElementById(
      'checkoutModal'
    );


  if (modal) {

    modal.remove();

  }

}


/**
 * =========================================
 * SUBMIT CHECKOUT
 * =========================================
 */

function submitCheckoutOrder() {

  if (!cart.length) {

    alert(
      'Your cart is empty.'
    );

    return;

  }


  const nameElement =
    document.getElementById(
      'checkoutCustomerName'
    );


  const phoneElement =
    document.getElementById(
      'checkoutCustomerPhone'
    );


  const typeElement =
    document.getElementById(
      'checkoutOrderType'
    );


  const paymentElement =
    document.getElementById(
      'checkoutPaymentMethod'
    );


  const notesElement =
    document.getElementById(
      'checkoutCustomerNotes'
    );


  const customerName =
    nameElement
      ? nameElement.value.trim()
      : '';


  const customerPhone =
    phoneElement
      ? phoneElement.value.trim()
      : '';


  const orderType =
    typeElement
      ? typeElement.value
      : '';


  const paymentMethod =
    paymentElement
      ? paymentElement.value
      : '';


  const customerNotes =
    notesElement
      ? notesElement.value.trim()
      : '';


  if (!customerName) {

    alert(
      'Please enter your name.'
    );

    if (nameElement) {
      nameElement.focus();
    }

    return;

  }


  if (!orderType) {

    alert(
      'Please select an order type.'
    );

    return;

  }


  if (!paymentMethod) {

    alert(
      'Please select a payment method.'
    );

    return;

  }


  /*
   * Get table ID
   */

  let tableId = '';


  if (
    typeof APP_CONFIG !== 'undefined' &&
    APP_CONFIG.tableId
  ) {

    tableId =
      APP_CONFIG.tableId;

  }


  /*
   * Prevent double submission
   */

  const button =
    document.getElementById(
      'submitOrderButton'
    );


  if (button) {

    button.disabled =
      true;

    button.innerText =
      'SUBMITTING ORDER...';

  }


  /*
   * Build clean order payload
   */

  const orderPayload = {

    tableId:
      tableId,

    customerName:
      customerName,

    customerPhone:
      customerPhone,

    orderType:
      orderType,

    paymentMethod:
      paymentMethod,

    customerNotes:
      customerNotes,

    items:
      cart.map(
        function(item) {

          return {

            Item_ID:
              item.Item_ID,

            Qty:
              Number(
                item.Qty
              ),

            Special_Instructions:
              item.Special_Instructions || ''

          };

        }
      )

  };


  google.script.run

    .withSuccessHandler(
      function(response) {

        console.log(
          'Order response:',
          response
        );


        if (
          !response ||
          response.success !== true
        ) {

          if (button) {

            button.disabled =
              false;

            button.innerText =
              'SUBMIT ORDER';

          }


          alert(

            response &&
            response.error

              ? response.error

              : 'Unable to submit order.'

          );

          return;

        }


        /*
         * Successful order
         */

        cart = [];


        updateCartDisplay();


        closeCheckoutModal();


        showOrderConfirmation(
          response
        );

      }
    )

    .withFailureHandler(
      function(error) {

        console.error(
          'Submit order error:',
          error
        );


        if (button) {

          button.disabled =
            false;

          button.innerText =
            'SUBMIT ORDER';

        }


        alert(

          'Unable to submit order.' +

          '\n\n' +

          (
            error &&
            error.message
              ? error.message
              : ''
          )

        );

      }
    )

    .submitOrder(
      orderPayload
    );

}


/**
 * =========================================
 * ORDER CONFIRMATION
 * =========================================
 */

function showOrderConfirmation(
  response
) {

  const overlay =
    document.createElement(
      'div'
    );


  overlay.id =
    'orderConfirmation';


  overlay.className =
    'product-modal-overlay';


  overlay.innerHTML =

    '<div class="product-modal">' +


      '<div class="modal-title">' +

        'Order Received ✓' +

      '</div>' +


      '<div class="order-success">' +

        'Thank you, ' +

        escapeHtml(
          response.customerName || ''
        ) +

        '!' +

      '</div>' +


      '<div class="order-number">' +

        'ORDER NUMBER' +

        '<br>' +

        '<strong>' +

          escapeHtml(
            response.orderId
          ) +

        '</strong>' +

      '</div>' +


      '<div class="checkout-table">' +

        (
          response.tableId
            ? 'Table: ' +
              escapeHtml(
                response.tableId
              )
            : ''
        ) +

      '</div>' +


      '<div class="checkout-final-total">' +

        'TOTAL: ₱' +

        Number(
          response.total || 0
        ).toFixed(2) +

      '</div>' +


      '<p style="text-align:center;">' +

        'Your order has been sent to the restaurant.' +

      '</p>' +


      '<button ' +

        'class="modal-add-button" ' +

        'onclick="closeOrderConfirmation()">' +

        'DONE' +

      '</button>' +


    '</div>';


  document.body.appendChild(
    overlay
  );

}


/**
 * =========================================
 * CLOSE CONFIRMATION
 * =========================================
 */

function closeOrderConfirmation() {

  const modal =
    document.getElementById(
      'orderConfirmation'
    );


  if (modal) {

    modal.remove();

  }

}


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return '';

  }


  return String(value)

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


/* =========================================
   ESCAPE ATTRIBUTE
   ========================================= */

function escapeAttribute(value) {

  return escapeHtml(value);

}

</script>