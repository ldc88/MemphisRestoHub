<!DOCTYPE html>
<html>
<head>
  <base target="_top">

  <meta name="viewport"
        content="width=device-width, initial-scale=1.0">

  <title>Utoy's - Admin Menu</title>

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

    /* ======================================================
       HEADER
       ====================================================== */

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

    /* ======================================================
       MAIN
       ====================================================== */

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

    /* ======================================================
       CATEGORY BAR
       ====================================================== */

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

  </style>
</head>

<body>

  <!-- =====================================================
       HEADER
       ===================================================== -->

  <header class="header">

    <div
      id="restaurantName"
      class="restaurant-name">
      Utoy's Tapsi Admin Site
    </div>

    <div class="restaurant-subtitle">
      Links Menu
    </div>

    <div
      id="tableDisplay"
      class="table-display">
    </div>

  </header>


  <!-- =====================================================
       MAIN CONTENT
       ===================================================== -->

  <main class="container">

    <section class="welcome">

      <h1>Welcome Nganih!</h1>

      <p>
        This site is for links and admin menu
      </p>

    </section>


  <!-- CATEGORIES -->

 
    <!-- MENU -->

 

    </div>

  </main>


  </script>

</body>
</html>
