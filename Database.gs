<!DOCTYPE html>
<html>

<head>

  <base target="_top">

  <meta name="viewport"
        content="width=device-width, initial-scale=1.0">

  <title>Utoy's Tapsi - Online Menu</title>

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #f5f5f5;
      color: #222;
    }

    .header {
      background: #111;
      color: #fff;
      padding: 18px 20px;
      text-align: center;
    }

    .restaurant-name {
      font-size: 25px;
      font-weight: bold;
    }

    .restaurant-subtitle {
      margin-top: 5px;
      font-size: 14px;
      color: #ccc;
    }

    .table-display {
      margin-top: 8px;
      font-size: 13px;
      color: #ddd;
    }

    .container {
      max-width: 1100px;
      margin: auto;
      padding: 20px;
    }

    .welcome {
      background: #fff;
      padding: 25px 20px;
      text-align: center;
      border-radius: 14px;
      margin-bottom: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,.08);
    }

    .welcome h1 {
      margin: 0 0 8px;
      font-size: 30px;
    }

    .welcome p {
      margin: 0;
      color: #666;
    }

    .categories {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 5px 2px 15px;
      margin-bottom: 10px;
    }

    .category-button {
      border: none;
      background: #fff;
      color: #222;
      padding: 11px 16px;
      border-radius: 22px;
      cursor: pointer;
      white-space: nowrap;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0,0,0,.08);
    }

    .category-button.active {
      background: #111;
      color: #fff;
    }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 18px;
    }

    .menu-card {
      background: #fff;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,.10);
      display: flex;
      flex-direction: column;
    }

    .menu-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: #eee;
    }

    .menu-image-placeholder {
      width: 100%;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eee;
      color: #999;
      font-size: 40px;
    }

    .menu-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .menu-name {
      font-size: 19px;
      font-weight: bold;
      margin-bottom: 7px;
    }

    .menu-description {
      color: #666;
      font-size: 14px;
      line-height: 1.4;
      flex: 1;
    }

    .menu-price {
      font-size: 19px;
      font-weight: bold;
      margin-top: 12px;
    }

    .add-button {
      width: 100%;
      border: none;
      background: #222;
      color: #fff;
      padding: 12px;
      border-radius: 9px;
      cursor: pointer;
      margin-top: 12px;
      font-size: 15px;
      font-weight: bold;
    }

    .add-button:hover {
      background: #000;
    }

    .message {
      text-align: center;
      padding: 45px 20px;
      color: #666;
      font-size: 17px;
    }

    .error {
      background: #fff1f1;
      color: #a00000;
      padding: 18px;
      border-radius: 10px;
      margin-top: 20px;
    }

    .cart-bar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      background: #111;
      color: #fff;
      padding: 12px 15px;
      display: none;
      z-index: 1000;
    }

    .cart-bar-inner {
      max-width: 1100px;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }

    .cart-summary {
      font-size: 15px;
    }

    .cart-button {
      border: none;
      background: #fff;
      color: #111;
      padding: 12px 18px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.60);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 15px;
    }

    .modal {
      background: #fff;
      width: 100%;
      max-width: 550px;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: 16px;
      padding: 22px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .modal-header h2 {
      margin: 0;
    }

    .close-button {
      border: none;
      background: #eee;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
    }

    .cart-item {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .cart-item-name {
      font-weight: bold;
    }

    .cart-item-price {
      color: #555;
      font-size: 14px;
      margin-top: 4px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quantity-button {
      width: 30px;
      height: 30px;
      border: none;
      background: #eee;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    }

    .remove-button {
      margin-top: 5px;
      border: none;
      background: transparent;
      color: #a00000;
      cursor: pointer;
      font-size: 12px;
    }

    .cart-total {
      display: flex;
      justify-content: space-between;
      font-size: 20px;
      font-weight: bold;
      padding: 18px 0;
    }

    .form-group {
      margin-bottom: 14px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 6px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 11px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 15px;
    }

    .form-group textarea {
      min-height: 80px;
      resize: vertical;
    }

    .checkout-button {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 9px;
      background: #111;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }

    .checkout-button:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    /* ======================================================
       PAYMENT
       ====================================================== */

    .payment-info {
      background: #f7f7f7;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 14px;
      font-size: 14px;
      line-height: 1.5;
    }

    .payment-info strong {
      display: block;
      margin-bottom: 5px;
    }

    .payment-online-fields {
      display: none;
    }

    .file-note {
      font-size: 12px;
      color: #777;
      margin-top: 5px;
    }

    .payment-status-message {
      background: #fff8ed;
      border-left: 4px solid #d77b00;
      padding: 12px;
      border-radius: 7px;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .success {
      text-align: center;
      padding: 30px 10px;
    }

    .success-icon {
      font-size: 55px;
      margin-bottom: 10px;
    }

    .success h2 {
      margin-bottom: 8px;
    }

    .order-number {
      font-size: 18px;
      font-weight: bold;
      margin: 15px 0;
    }

    @media (max-width: 600px) {

      .container {
        padding: 12px;
      }

      .welcome h1 {
        font-size: 25px;
      }

      .menu-grid {
        grid-template-columns: 1fr;
      }

      .menu-image,
      .menu-image-placeholder {
        height: 190px;
      }

      .cart-bar-inner {
        flex-direction: row;
      }

    }

  </style>

</head>


<body>


<header class="header">

  <div
    id="restaurantName"
    class="restaurant-name">
    Utoy's Tapsilog
  </div>

  <div class="restaurant-subtitle">
    Online Menu
  </div>

  <div
    id="tableDisplay"
    class="table-display">
  </div>

</header>


<main class="container">

  <section class="welcome">

    <h1>Welcome!</h1>

    <p>
      Browse our menu and select your favorite meals.
    </p>

  </section>


  <div
    id="categories"
    class="categories">

    <button
      class="category-button active"
      id="category-ALL"
      onclick="selectCategory('ALL')">
      All
    </button>

  </div>


  <div
    id="menuContainer"
    class="menu-grid">

    <div
      class="message"
      style="grid-column:1/-1;">
      Loading menu...
    </div>

  </div>

</main>


<div
  id="cartBar"
  class="cart-bar">

  <div class="cart-bar-inner">

    <div
      id="cartSummary"
      class="cart-summary">
      Cart: ₱0.00
    </div>

    <button
      class="cart-button"
      onclick="openCart()">
      VIEW CART
    </button>

  </div>

</div>


<!-- ========================================================
     CART MODAL
     ======================================================== -->

<div
  id="cartModal"
  class="modal-overlay">

  <div class="modal">

    <div class="modal-header">

      <h2>Your Order</h2>

      <button
        class="close-button"
        onclick="closeCart()">
        ×
      </button>

    </div>

    <div id="cartItems"></div>

    <div class="cart-total">

      <span>TOTAL</span>

      <span id="cartTotal">
        ₱0.00
      </span>

    </div>

    <button
      class="checkout-button"
      onclick="openCheckout()">
      PROCEED TO CHECKOUT
    </button>

  </div>

</div>


<!-- ========================================================
     CHECKOUT MODAL
     ======================================================== -->

<div
  id="checkoutModal"
  class="modal-overlay">

  <div class="modal">

    <div class="modal-header">

      <h2>Checkout</h2>

      <button
        class="close-button"
        onclick="closeCheckout()">
        ×
      </button>

    </div>


    <div class="form-group">

      <label for="customerName">
        Customer Name
      </label>

      <input
        id="customerName"
        type="text"
        placeholder="Enter your name">

    </div>


    <div class="form-group">

      <label for="customerPhone">
        Customer Phone
      </label>

      <input
        id="customerPhone"
        type="tel"
        inputmode="tel"
        placeholder="Enter your Mobile Number">

    </div>


    <div class="form-group">

      <label for="orderType">
        Order Type
      </label>

      <select id="orderType">

        <option value="DINE_IN">
          Dine In
        </option>

        <option value="TAKEOUT">
          Takeout
        </option>

        <option value="DELIVERY">
          Delivery
        </option>

      </select>

    </div>


    <!-- ====================================================
         PAYMENT OPTION
         ==================================================== -->

    <div class="form-group">

      <label for="paymentOption">
        Payment Option
      </label>

      <select
        id="paymentOption"
        onchange="paymentOptionChanged()">

        <option value="CASH_ON_DELIVERY">
          Cash on Delivery
        </option>

        <option value="PAY_ON_PICKUP">
          Pay on Pick-up
        </option>

        <option value="ONLINE">
          Pay Online
        </option>

      </select>

    </div>


    <!-- ====================================================
         ONLINE PAYMENT
         ==================================================== -->

    <div
      id="onlinePaymentFields"
      class="payment-online-fields">

      <div class="payment-info">

        <strong>
          Online Payment
        </strong>

        After placing your order, your payment proof
        will be submitted for staff verification.

      </div>


      <div class="form-group">

        <label for="actualPaymentMethod">
          Payment Method
        </label>

        <select
          id="actualPaymentMethod">

          <option value="GCASH">
            GCash
          </option>

          <option value="MAYA">
            Maya
          </option>

          <option value="BANK_TRANSFER">
            Bank Transfer
          </option>

        </select>

      </div>


      <div class="form-group">

        <label for="paymentAmount">
          Amount Paid
        </label>

        <input
          id="paymentAmount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Enter amount paid">

      </div>


      <div class="form-group">

        <label for="paymentReference">
          Payment Reference
        </label>

        <input
          id="paymentReference"
          type="text"
          placeholder="Enter transaction/reference number">

      </div>


      <div class="form-group">

        <label for="paymentProofFile">
          Payment Proof
        </label>

        <input
          id="paymentProofFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf">

        <div class="file-note">
          JPG, PNG, WEBP or PDF. Maximum 5 MB.
        </div>

      </div>

    </div>


    <div class="form-group">

      <label for="customerNote">
        Order Note
      </label>

      <textarea
        id="customerNote"
        placeholder="Special instructions..."></textarea>

    </div>


    <div
      id="checkoutError"
      class="error"
      style="display:none;">
    </div>


    <button
      id="placeOrderButton"
      class="checkout-button"
      onclick="placeOrder()">
      PLACE ORDER
    </button>

  </div>

</div>


<!-- ========================================================
     SUCCESS MODAL
     ======================================================== -->

<div
  id="successModal"
  class="modal-overlay">

  <div class="modal">

    <div class="success">

      <div class="success-icon">
        ✓
      </div>

      <h2>
        Order Received!
      </h2>

      <p id="successMessage">
        Thank you for your order.
      </p>

      <div
        id="successOrderNumber"
        class="order-number">
      </div>

      <button
        class="checkout-button"
        onclick="closeSuccess()">
        DONE
      </button>

    </div>

  </div>

</div>


<script>


/* ============================================================
   GLOBAL VARIABLES
   ============================================================ */

let applicationData = null;

let menuItems = [];

let categories = [];

let cart = [];

let selectedCategory = 'ALL';

let tableId = '';


/* ============================================================
   START
   ============================================================ */

document.addEventListener(
  'DOMContentLoaded',
  function() {

    loadTableInformation();

  }
);


/* ============================================================
   TABLE
   ============================================================ */

function loadTableInformation() {

  if (
    typeof google !== 'undefined' &&
    google.script &&
    google.script.url
  ) {

    google.script.url.getLocation(
      function(location) {

        if (
          location &&
          location.parameter &&
          location.parameter.tableId
        ) {

          tableId =
            String(
              location.parameter.tableId
            ).trim();

        }

        updateTableDisplay();

        loadApplicationData();

      }
    );

  } else {

    loadApplicationData();

  }

}


function updateTableDisplay() {

  const element =
    document.getElementById(
      'tableDisplay'
    );

  if (!element) {
    return;
  }

  if (tableId) {

    element.textContent =
      'Table: ' + tableId;

  } else {

    element.textContent = '';

  }

}


/* ============================================================
   APPLICATION DATA
   ============================================================ */

function loadApplicationData() {

  google.script.run

    .withSuccessHandler(
      function(data) {

        try {

          applicationData = data;

          normalizeApplicationData();

          updateRestaurantName();

          renderCategories();

          renderMenu();

          updateCartDisplay();

        } catch (error) {

          showError(
            'Unable to display menu: ' +
            error.message
          );

        }

      }
    )

    .withFailureHandler(
      function(error) {

        showError(
          'Unable to load restaurant data: ' +
          (
            error && error.message
              ? error.message
              : error
          )
        );

      }
    )

    .getApplicationData();

}


/* ============================================================
   NORMALIZE DATA
   ============================================================ */

function normalizeApplicationData() {

  if (!applicationData) {

    applicationData = {};

  }


  if (
    Array.isArray(
      applicationData.categories
    )
  ) {

    categories =
      applicationData.categories;

  } else {

    categories = [];

  }


  if (
    Array.isArray(
      applicationData.menu
    )
  ) {

    menuItems =
      applicationData.menu;

  } else if (
    Array.isArray(
      applicationData.menuItems
    )
  ) {

    menuItems =
      applicationData.menuItems;

  } else if (
    Array.isArray(
      applicationData.items
    )
  ) {

    menuItems =
      applicationData.items;

  } else {

    menuItems = [];

  }


  menuItems =
    menuItems.map(
      function(item) {

        return {

          itemId:
            item.Item_ID ||
            item.itemId ||
            item.id ||
            '',

          sku:
            item.SKU ||
            item.sku ||
            '',

          categoryId:
            item.Category_ID ||
            item.categoryId ||
            '',

          name:
            item.Item_Name ||
            item.itemName ||
            item.name ||
            'Unnamed Item',

          description:
            item.Description ||
            item.description ||
            '',

          price:
            Number(
              item.Price ||
              item.price ||
              0
            ),

          imageUrl:
            item.Image_URL ||
            item.imageUrl ||
            '',

          available:
            String(
              item.Available ??
              item.available ??
              'YES'
            ).toUpperCase(),

          featured:
            String(
              item.Featured ??
              item.featured ??
              ''
            ).toUpperCase(),

          sortOrder:
            Number(
              item.Sort_Order ||
              item.sortOrder ||
              9999
            )

        };

      }
    );


  menuItems.sort(
    function(a, b) {

      return a.sortOrder -
             b.sortOrder;

    }
  );

}


/* ============================================================
   RESTAURANT
   ============================================================ */

function updateRestaurantName() {

  const element =
    document.getElementById(
      'restaurantName'
    );

  if (!element) {
    return;
  }

  let name =
    "Utoy's Tapsilog";

  if (
    applicationData &&
    applicationData.restaurant
  ) {

    if (
      typeof applicationData.restaurant ===
      'string'
    ) {

      name =
        applicationData.restaurant;

    } else {

      name =
        applicationData.restaurant.Restaurant_Name ||
        applicationData.restaurant.Name ||
        applicationData.restaurant.name ||
        name;

    }

  }

  element.textContent =
    name;

}


/* ============================================================
   CATEGORIES
   ============================================================ */

function renderCategories() {

  const container =
    document.getElementById(
      'categories'
    );

  if (!container) {
    return;
  }

  let html = '';

  html +=
    '<button ' +
    'class="category-button active" ' +
    'id="category-ALL" ' +
    'onclick="selectCategory(\'ALL\')">' +
    'All' +
    '</button>';

  categories.forEach(
    function(category) {

      const categoryId =
        category.Category_ID ||
        category.categoryId ||
        category.id ||
        '';

      const categoryName =
        category.Category_Name ||
        category.categoryName ||
        category.name ||
        categoryId;

      const active =
        String(
          category.Active ||
          category.active ||
          'YES'
        ).toUpperCase();

      if (
        active !== 'YES'
      ) {

        return;

      }

      html +=
        '<button ' +
        'class="category-button" ' +
        'id="category-' +
        escapeHtml(categoryId) +
        '" ' +
        'onclick="selectCategory(\'' +
        escapeJs(categoryId) +
        '\')">' +
        escapeHtml(categoryName) +
        '</button>';

    }
  );

  container.innerHTML =
    html;

}


function selectCategory(categoryId) {

  selectedCategory =
    categoryId;

  document
    .querySelectorAll(
      '.category-button'
    )
    .forEach(
      function(button) {

        button.classList.remove(
          'active'
        );

      }
    );

  const selectedButton =
    document.getElementById(
      'category-' +
      categoryId
    );

  if (selectedButton) {

    selectedButton.classList.add(
      'active'
    );

  }

  renderMenu();

}


/* ============================================================
   MENU
   ============================================================ */

function renderMenu() {

  const container =
    document.getElementById(
      'menuContainer'
    );

  if (!container) {
    return;
  }

  let visibleItems =
    menuItems.filter(
      function(item) {

        return item.available ===
          'YES';

      }
    );

  if (
    selectedCategory !== 'ALL'
  ) {

    visibleItems =
      visibleItems.filter(
        function(item) {

          return String(
            item.categoryId
          ) ===
          String(
            selectedCategory
          );

        }
      );

  }

  if (
    visibleItems.length === 0
  ) {

    container.innerHTML =
      '<div class="message" ' +
      'style="grid-column:1/-1;">' +
      'No items available in this category.' +
      '</div>';

    return;

  }

  let html = '';

  visibleItems.forEach(
    function(item) {

      html +=
        '<div class="menu-card">';

      if (
        item.imageUrl
      ) {

        html +=
          '<img ' +
          'class="menu-image" ' +
          'src="' +
          escapeHtml(item.imageUrl) +
          '" ' +
          'alt="' +
          escapeHtml(item.name) +
          '" ' +
          'onerror="this.style.display=\'none\'">';

      } else {

        html +=
          '<div class="menu-image-placeholder">' +
          '🍽️' +
          '</div>';

      }

      html +=
        '<div class="menu-content">' +

          '<div class="menu-name">' +
            escapeHtml(item.name) +
          '</div>' +

          '<div class="menu-description">' +
            escapeHtml(
              item.description
            ) +
          '</div>' +

          '<div class="menu-price">' +
            formatCurrency(
              item.price
            ) +
          '</div>' +

          '<button ' +
          'class="add-button" ' +
          'onclick="addToCart(\'' +
          escapeJs(item.itemId) +
          '\')">' +
          'ADD TO CART' +
          '</button>' +

        '</div>' +

      '</div>';

    }
  );

  container.innerHTML =
    html;

}


/* ============================================================
   CART
   ============================================================ */

function addToCart(itemId) {

  const item =
    menuItems.find(
      function(menuItem) {

        return String(
          menuItem.itemId
        ) ===
        String(
          itemId
        );

      }
    );

  if (!item) {
    return;
  }

  const existing =
    cart.find(
      function(cartItem) {

        return String(
          cartItem.itemId
        ) ===
        String(
          itemId
        );

      }
    );

  if (existing) {

    existing.quantity++;

  } else {

    cart.push({

      itemId:
        item.itemId,

      sku:
        item.sku,

      name:
        item.name,

      price:
        item.price,

      quantity:
        1

    });

  }

  updateCartDisplay();

}


function getCartTotal() {

  return cart.reduce(
    function(total, item) {

      return total +
        (
          Number(item.price) *
          Number(item.quantity)
        );

    },
    0
  );

}


function getCartCount() {

  return cart.reduce(
    function(total, item) {

      return total +
        Number(
          item.quantity
        );

    },
    0
  );

}


function updateCartDisplay() {

  const bar =
    document.getElementById(
      'cartBar'
    );

  const summary =
    document.getElementById(
      'cartSummary'
    );

  const count =
    getCartCount();

  const total =
    getCartTotal();

  if (
    count > 0
  ) {

    bar.style.display =
      'block';

    summary.textContent =
      'Cart: ' +
      count +
      ' item' +
      (
        count === 1
          ? ''
          : 's'
      ) +
      ' • ' +
      formatCurrency(
        total
      );

  } else {

    bar.style.display =
      'none';

  }

}


function openCart() {

  renderCart();

  document.getElementById(
    'cartModal'
  ).style.display =
    'flex';

}


function closeCart() {

  document.getElementById(
    'cartModal'
  ).style.display =
    'none';

}


function renderCart() {

  const container =
    document.getElementById(
      'cartItems'
    );

  const totalElement =
    document.getElementById(
      'cartTotal'
    );

  if (
    cart.length === 0
  ) {

    container.innerHTML =
      '<div class="message">' +
      'Your cart is empty.' +
      '</div>';

    totalElement.textContent =
      formatCurrency(0);

    return;

  }

  let html = '';

  cart.forEach(
    function(item, index) {

      html +=
        '<div class="cart-item">' +

          '<div>' +

            '<div class="cart-item-name">' +
              escapeHtml(item.name) +
            '</div>' +

            '<div class="cart-item-price">' +
              formatCurrency(item.price) +
              ' × ' +
              item.quantity +
            '</div>' +

            '<button ' +
            'class="remove-button" ' +
            'onclick="removeFromCart(' +
            index +
            ')">' +
            'REMOVE' +
            '</button>' +

          '</div>' +

          '<div class="quantity-controls">' +

            '<button ' +
            'class="quantity-button" ' +
            'onclick="changeQuantity(' +
            index +
            ', -1)">' +
            '−' +
            '</button>' +

            '<span>' +
              item.quantity +
            '</span>' +

            '<button ' +
            'class="quantity-button" ' +
            'onclick="changeQuantity(' +
            index +
            ', 1)">' +
            '+' +
            '</button>' +

          '</div>' +

        '</div>';

    }
  );

  container.innerHTML =
    html;

  totalElement.textContent =
    formatCurrency(
      getCartTotal()
    );

}


function changeQuantity(
  index,
  amount
) {

  if (
    !cart[index]
  ) {

    return;

  }

  cart[index].quantity +=
    amount;

  if (
    cart[index].quantity <= 0
  ) {

    cart.splice(
      index,
      1
    );

  }

  renderCart();

  updateCartDisplay();

}


function removeFromCart(index) {

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

  renderCart();

  updateCartDisplay();

}


/* ============================================================
   CHECKOUT
   ============================================================ */

function openCheckout() {

  if (
    cart.length === 0
  ) {

    return;

  }

  closeCart();

  document.getElementById(
    'checkoutModal'
  ).style.display =
    'flex';

  paymentOptionChanged();

}


function closeCheckout() {

  document.getElementById(
    'checkoutModal'
  ).style.display =
    'none';

}


function paymentOptionChanged() {

  const option =
    document.getElementById(
      'paymentOption'
    ).value;

  const fields =
    document.getElementById(
      'onlinePaymentFields'
    );

  if (
    option === 'ONLINE'
  ) {

    fields.style.display =
      'block';

  } else {

    fields.style.display =
      'none';

  }

}


/* ============================================================
   PLACE ORDER
   ============================================================ */

function placeOrder() {

  const name =
    document.getElementById(
      'customerName'
    ).value.trim();

  const phone =
    document.getElementById(
      'customerPhone'
    ).value.trim();

  const orderType =
    document.getElementById(
      'orderType'
    ).value;

  const note =
    document.getElementById(
      'customerNote'
    ).value.trim();

  const paymentOption =
    document.getElementById(
      'paymentOption'
    ).value;

  const errorElement =
    document.getElementById(
      'checkoutError'
    );

  const button =
    document.getElementById(
      'placeOrderButton'
    );

  errorElement.style.display =
    'none';


  if (
    cart.length === 0
  ) {

    showCheckoutError(
      'Your cart is empty.'
    );

    return;

  }


  if (
    !name
  ) {

    showCheckoutError(
      'Please enter your name.'
    );

    return;

  }


  /*
   * Online payment validation.
   */

  let actualPaymentMethod =
    'CASH';

  let paymentAmount =
    0;

  let paymentReference =
    '';

  let paymentProofFile =
    null;


  if (
    paymentOption === 'ONLINE'
  ) {

    actualPaymentMethod =
      document.getElementById(
        'actualPaymentMethod'
      ).value;

    paymentAmount =
      Number(
        document.getElementById(
          'paymentAmount'
        ).value
      );

    paymentReference =
      document.getElementById(
        'paymentReference'
      ).value.trim();

    const fileInput =
      document.getElementById(
        'paymentProofFile'
      );

    if (
      !paymentAmount ||
      paymentAmount <= 0
    ) {

      showCheckoutError(
        'Please enter the amount paid.'
      );

      return;

    }

    if (
      !paymentReference
    ) {

      showCheckoutError(
        'Please enter your payment reference.'
      );

      return;

    }

    if (
      !fileInput.files ||
      !fileInput.files.length
    ) {

      showCheckoutError(
        'Please upload your payment proof.'
      );

      return;

    }

    const file =
      fileInput.files[0];

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      showCheckoutError(
        'Payment proof file must not exceed 5 MB.'
      );

      return;

    }

    paymentProofFile =
      file;

  }


  const order = {

    customerName:
      name,

    customerPhone:
      phone,

    orderType:
      orderType,

    /*
     * Preserve the existing
     * order/payment architecture.
     *
     * For online payment, the
     * actual method is recorded.
     *
     * For cash-based options,
     * CASH remains the order
     * payment method.
     */

    paymentMethod:
      actualPaymentMethod,

    customerNotes:
      note,

    tableId:
      tableId,

    items:
      cart.map(
        function(item) {

          return {

            Item_ID:
              item.itemId,

            Qty:
              Number(
                item.quantity
              ),

            Special_Instructions:
              ''

          };

        }
      )

  };


  button.disabled =
    true;

  button.textContent =
    'SUBMITTING...';


  /*
   * First create the order.
   */

  google.script.run

    .withSuccessHandler(
      function(result) {

        if (
          !result ||
          result.success !== true
        ) {

          button.disabled =
            false;

          button.textContent =
            'PLACE ORDER';

          showCheckoutError(
            (
              result &&
              result.error
            )
              ? result.error
              : 'Unable to submit your order.'
          );

          return;

        }


        const orderNumber =
          result.orderId ||
          result.Order_ID ||
          result.orderNumber ||
          'Order received';


        /*
         * Non-online order:
         * finish immediately.
         */

        if (
          paymentOption !== 'ONLINE'
        ) {

          finishSuccessfulOrder(
            orderNumber,
            'Thank you for your order.'
          );

          return;

        }


        /*
         * Online order:
         * read the proof file and
         * submit it using the real
         * Order_ID returned by
         * submitOrder().
         */

        button.textContent =
          'UPLOADING PAYMENT PROOF...';


        readPaymentProofFile(
          paymentProofFile,
          function(fileData) {

            google.script.run

              .withSuccessHandler(
                function(proofResult) {

                  button.disabled =
                    false;

                  button.textContent =
                    'PLACE ORDER';


                  if (
                    !proofResult ||
                    proofResult.success !== true
                  ) {

                    showCheckoutError(
                      (
                        proofResult &&
                        proofResult.error
                      )
                        ? proofResult.error
                        : 'Order was created, but payment proof could not be submitted.'
                    );

                    return;

                  }


                  finishSuccessfulOrder(
                    orderNumber,
                    'Your order was received. Your payment proof is pending staff verification.'
                  );

                }
              )

              .withFailureHandler(
                function(error) {

                  button.disabled =
                    false;

                  button.textContent =
                    'PLACE ORDER';

                  showCheckoutError(
                    (
                      error &&
                      error.message
                    )
                      ? error.message
                      : String(error)
                  );

                }
              )

              .submitPaymentProof({

                orderId:
                  orderNumber,

                paymentMethod:
                  actualPaymentMethod,

                paymentAmount:
                  paymentAmount,

                reference:
                  paymentReference,

                proofFile:
                  fileData

              });

          }
        );

      }
    )

    .withFailureHandler(
      function(error) {

        button.disabled =
          false;

        button.textContent =
          'PLACE ORDER';

        showCheckoutError(
          (
            error &&
            error.message
          )
            ? error.message
            : String(error)
        );

      }
    )

    .submitOrder(
      order
    );

}


/* ============================================================
   READ FILE
   ============================================================ */

function readPaymentProofFile(
  file,
  callback
) {

  if (!file) {

    callback(null);

    return;

  }

  const reader =
    new FileReader();

  reader.onload =
    function(event) {

      callback({

        fileName:
          file.name,

        mimeType:
          file.type,

        dataUrl:
          event.target.result

      });

    };

  reader.onerror =
    function() {

      showCheckoutError(
        'Unable to read the payment proof file.'
      );

    };

  reader.readAsDataURL(
    file
  );

}


/* ============================================================
   SUCCESSFUL ORDER
   ============================================================ */

function finishSuccessfulOrder(
  orderNumber,
  message
) {

  cart = [];

  updateCartDisplay();

  closeCheckout();

  document.getElementById(
    'successMessage'
  ).textContent =
    message ||
    'Thank you for your order.';

  showSuccess(
    orderNumber
  );

}


/* ============================================================
   ERROR
   ============================================================ */

function showCheckoutError(
  message
) {

  const element =
    document.getElementById(
      'checkoutError'
    );

  element.textContent =
    message ||
    'Unable to submit order.';

  element.style.display =
    'block';

}


function showSuccess(
  orderNumber
) {

  document.getElementById(
    'successOrderNumber'
  ).textContent =
    orderNumber;

  document.getElementById(
    'successModal'
  ).style.display =
    'flex';

}


function closeSuccess() {

  document.getElementById(
    'successModal'
  ).style.display =
    'none';

}


function showError(
  message
) {

  const container =
    document.getElementById(
      'menuContainer'
    );

  container.innerHTML =
    '<div class="error" ' +
    'style="grid-column:1/-1;">' +
    escapeHtml(message) +
    '</div>';

}


/* ============================================================
   CURRENCY
   ============================================================ */

function formatCurrency(
  value
) {

  const number =
    Number(value) || 0;

  return '₱' +
    number.toLocaleString(
      'en-PH',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

}


/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeHtml(
  value
) {

  return String(
    value === undefined ||
    value === null
      ? ''
      : value
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


/* ============================================================
   JAVASCRIPT ESCAPE
   ============================================================ */

function escapeJs(
  value
) {

  return String(
    value === undefined ||
    value === null
      ? ''
      : value
  )

  .replace(
    /\\/g,
    '\\\\'
  )

  .replace(
    /'/g,
    "\\'"
  )

  .replace(
    /\r/g,
    '\\r'
  )

  .replace(
    /\n/g,
    '\\n'
  );

}

</script>

</body>

</html>
