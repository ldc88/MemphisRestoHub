
<style>

/* =========================================
   GLOBAL
   ========================================= */

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0 0 90px 0;
  font-family: Arial, Helvetica, sans-serif;
  background: #f7f7f7;
  color: #222222;
}


/* =========================================
   HEADER
   ========================================= */

.restaurant-header {
  position: sticky;
  top: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 20px;

  background: #ffffff;

  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.08);
}

.restaurant-name {
  font-size: 22px;
  font-weight: bold;
}

.table-display {
  font-size: 14px;
  font-weight: bold;
}


/* =========================================
   WELCOME
   ========================================= */

.welcome {
  text-align: center;
  padding: 30px 20px 15px;
}

.welcome h1 {
  margin: 0 0 10px;
  font-size: 32px;
}

.welcome p {
  margin: 0;
  color: #666666;
}


/* =========================================
   CATEGORY BAR
   ========================================= */

.category-container {
  display: flex;

  gap: 10px;

  overflow-x: auto;

  padding: 15px 20px;

  background: #ffffff;

  border-bottom:
    1px solid #eeeeee;

  scrollbar-width: none;
}

.category-container::-webkit-scrollbar {
  display: none;
}

.category-button {
  flex: 0 0 auto;

  padding: 10px 18px;

  border: none;

  border-radius: 22px;

  background: #eeeeee;

  color: #222222;

  cursor: pointer;

  font-size: 14px;

  white-space: nowrap;
}

.category-button:hover {
  opacity: 0.85;
}

.category-button.active {
  background: #111111;
  color: #ffffff;
}


/* =========================================
   MENU
   ========================================= */

.menu-container {
  display: grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(280px, 1fr)
    );

  gap: 20px;

  padding: 20px;

  max-width: 1200px;

  margin: 0 auto;
}

.menu-item {
  overflow: hidden;

  background: #ffffff;

  border-radius: 14px;

  box-shadow:
    0 3px 15px
    rgba(0, 0, 0, 0.08);

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.menu-item:hover {
  transform: translateY(-2px);

  box-shadow:
    0 6px 20px
    rgba(0, 0, 0, 0.12);
}

.menu-image {
  display: block;

  width: 100%;

  height: 210px;

  object-fit: cover;
}

.menu-content {
  padding: 18px;
}

.menu-name {
  margin-bottom: 8px;

  font-size: 21px;

  font-weight: bold;
}

.menu-description {
  min-height: 40px;

  margin-bottom: 12px;

  color: #666666;

  font-size: 14px;

  line-height: 1.5;
}

.menu-price {
  margin-bottom: 15px;

  font-size: 20px;

  font-weight: bold;
}

.add-button {
  width: 100%;

  padding: 13px;

  border: none;

  border-radius: 9px;

  background: #111111;

  color: #ffffff;

  font-size: 14px;

  font-weight: bold;

  cursor: pointer;
}

.add-button:hover {
  opacity: 0.85;
}


/* =========================================
   LOADING
   ========================================= */

.loading {
  grid-column: 1 / -1;

  padding: 60px 20px;

  text-align: center;

  color: #666666;

  font-size: 18px;
}


/* =========================================
   ERROR
   ========================================= */

.error-box {
  grid-column: 1 / -1;

  max-width: 600px;

  margin: 40px auto;

  padding: 30px;

  text-align: center;

  background: #ffffff;

  border: 1px solid #dddddd;

  border-radius: 12px;
}

.error-box h3 {
  margin-top: 0;
}

.error-box button {
  padding: 12px 25px;

  border: none;

  border-radius: 8px;

  background: #111111;

  color: #ffffff;

  cursor: pointer;

  font-weight: bold;
}


/* =========================================
   PRODUCT MODAL
   ========================================= */

.product-modal-overlay {
  position: fixed;

  inset: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

  background:
    rgba(0, 0, 0, 0.55);

  z-index: 5000;
}

.product-modal {
  position: relative;

  width: 100%;

  max-width: 520px;

  max-height: 90vh;

  overflow-y: auto;

  padding: 25px;

  background: #ffffff;

  border-radius: 18px;

  box-shadow:
    0 10px 40px
    rgba(0, 0, 0, 0.25);
}

.modal-close {
  position: absolute;

  top: 12px;

  right: 15px;

  width: 40px;

  height: 40px;

  border: none;

  border-radius: 50%;

  background: #eeeeee;

  font-size: 28px;

  cursor: pointer;
}

.modal-title {
  padding-right: 45px;

  margin-bottom: 10px;

  font-size: 28px;

  font-weight: bold;
}

.modal-description {
  margin-bottom: 15px;

  color: #666666;

  line-height: 1.5;
}

.modal-price {
  margin-bottom: 25px;

  font-size: 24px;

  font-weight: bold;
}


/* =========================================
   MODAL SECTIONS
   ========================================= */

.modal-section {
  margin-top: 20px;
}

.modal-section label {
  display: block;

  margin-bottom: 8px;

  font-weight: bold;

  font-size: 13px;
}

.modal-section textarea {
  width: 100%;

  min-height: 90px;

  padding: 12px;

  border:
    1px solid #dddddd;

  border-radius: 10px;

  resize: vertical;

  font-family: inherit;

  font-size: 14px;
}


/* =========================================
   QUANTITY
   ========================================= */

.quantity-control {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 20px;

  margin: 15px 0;
}

.quantity-control button {
  width: 45px;

  height: 45px;

  border: none;

  border-radius: 50%;

  background: #eeeeee;

  font-size: 25px;

  cursor: pointer;
}

.quantity-control span {
  min-width: 35px;

  text-align: center;

  font-size: 22px;

  font-weight: bold;
}


/* =========================================
   MODAL TOTAL
   ========================================= */

.modal-total {
  margin: 25px 0;

  text-align: center;

  font-size: 22px;

  font-weight: bold;
}


/* =========================================
   ADD TO CART BUTTON
   ========================================= */

.modal-add-button {
  width: 100%;

  padding: 15px;

  border: none;

  border-radius: 10px;

  background: #111111;

  color: #ffffff;

  font-size: 16px;

  font-weight: bold;

  cursor: pointer;
}

.modal-add-button:hover {
  opacity: 0.85;
}


/* =========================================
   CART ITEMS
   ========================================= */

.cart-item {
  display: flex;

  justify-content: space-between;

  gap: 15px;

  padding: 15px 0;

  border-bottom:
    1px solid #eeeeee;
}

.cart-item strong {
  display: block;

  margin-bottom: 5px;
}

.cart-instruction {
  margin-top: 6px;

  color: #666666;

  font-size: 13px;

  font-style: italic;
}

.remove-button {
  align-self: center;

  padding: 8px 10px;

  border: none;

  border-radius: 6px;

  background: #eeeeee;

  cursor: pointer;
}


/* =========================================
   CART TOTAL
   ========================================= */

.cart-grand-total {
  padding: 20px 0;

  text-align: right;

  font-size: 22px;

  font-weight: bold;
}

.empty-cart {
  padding: 40px 10px;

  text-align: center;

  color: #666666;
}


/* =========================================
   CART BAR
   ========================================= */

.cart-bar {
  position: fixed;

  bottom: 0;

  left: 0;

  right: 0;

  z-index: 4000;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  padding: 14px 20px;

  background: #111111;

  color: #ffffff;

  box-shadow:
    0 -3px 15px
    rgba(0, 0, 0, 0.15);
}

.cart-bar button {
  padding: 10px 18px;

  border: none;

  border-radius: 8px;

  background: #ffffff;

  color: #111111;

  cursor: pointer;

  font-weight: bold;
}


/* =========================================
   CART NOTIFICATION
   ========================================= */

.cart-notification {
  position: fixed;

  left: 50%;

  bottom: 90px;

  transform:
    translateX(-50%);

  z-index: 6000;

  padding: 12px 22px;

  background: #111111;

  color: #ffffff;

  border-radius: 25px;

  box-shadow:
    0 4px 15px
    rgba(0, 0, 0, 0.2);

  white-space: nowrap;
}


/* =========================================
   MOBILE
   ========================================= */

@media (max-width: 600px) {

  .restaurant-header {
    padding: 14px 16px;
  }

  .restaurant-name {
    font-size: 19px;
  }

  .welcome {
    padding:
      25px 15px 10px;
  }

  .welcome h1 {
    font-size: 27px;
  }

  .category-container {
    padding:
      12px 15px;
  }

  .menu-container {
    grid-template-columns: 1fr;

    padding: 15px;

    gap: 15px;
  }

  .menu-image {
    height: 190px;
  }

  .product-modal-overlay {
    align-items: flex-end;

    padding: 0;
  }

  .product-modal {
    max-height: 92vh;

    border-radius:
      18px 18px 0 0;

    padding: 22px;
  }

  .modal-title {
    font-size: 24px;
  }

  .cart-bar {
    padding:
      12px 14px;
  }

  .cart-bar button {
    padding:
      10px 12px;

    font-size: 12px;
  }

}

/* =========================================
   CHECKOUT
   ========================================= */

.checkout-summary {
  margin: 15px 0;
  padding: 15px;

  background: #f5f5f5;

  border-radius: 10px;

  line-height: 1.6;
}

.checkout-section {
  margin-top: 18px;
}

.checkout-section label {
  display: block;

  margin-bottom: 7px;

  font-size: 13px;

  font-weight: bold;
}

.checkout-section input,
.checkout-section select,
.checkout-section textarea {
  width: 100%;

  padding: 12px;

  border:
    1px solid #dddddd;

  border-radius: 9px;

  background: #ffffff;

  font-family: inherit;

  font-size: 15px;
}

.checkout-section textarea {
  min-height: 80px;

  resize: vertical;
}

.checkout-table {
  margin-top: 20px;

  padding: 12px;

  text-align: center;

  background: #f5f5f5;

  border-radius: 9px;

  font-weight: bold;
}

.checkout-final-total {
  margin: 20px 0;

  text-align: center;

  font-size: 23px;

  font-weight: bold;
}

.order-success {
  margin: 20px 0;

  text-align: center;

  font-size: 18px;

  line-height: 1.5;
}

.order-number {
  margin: 20px 0;

  padding: 20px;

  text-align: center;

  background: #f5f5f5;

  border-radius: 12px;

  font-size: 13px;

  font-weight: bold;
}

.order-number strong {
  display: block;

  margin-top: 8px;

  font-size: 22px;

  letter-spacing: 1px;
}

</style>