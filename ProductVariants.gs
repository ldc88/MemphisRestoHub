<!DOCTYPE html>
<html>

<head>

  <base target="_top">

  <meta name="viewport"
        content="width=device-width, initial-scale=1">

  <title>Utoy's Tapsi - QR Tables</title>

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 24px;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      color: #222;
    }

    .header {
      max-width: 1100px;
      margin: 0 auto 24px;
    }

    .header h1 {
      margin: 0 0 6px;
      font-size: 28px;
    }

    .header p {
      margin: 0;
      color: #666;
    }

    .actions {
      max-width: 1100px;
      margin: 0 auto 24px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    button {
      border: none;
      border-radius: 8px;
      padding: 11px 18px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }

    .primary {
      background: #222;
      color: white;
    }

    .secondary {
      background: white;
      border: 1px solid #ccc;
      color: #222;
    }

    .status {
      max-width: 1100px;
      margin: 0 auto 20px;
      padding: 12px 15px;
      border-radius: 8px;
      background: white;
      border: 1px solid #ddd;
      display: none;
    }

    .grid {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .card {
      background: white;
      border-radius: 14px;
      padding: 22px;
      text-align: center;
      box-shadow:
        0 2px 8px rgba(0,0,0,0.08);
      break-inside: avoid;
    }

    .restaurant {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .table-name {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .table-id {
      font-size: 13px;
      color: #777;
      margin-bottom: 15px;
    }

    .qr {
      width: 220px;
      height: 220px;
      object-fit: contain;
      margin: 5px auto 15px;
      display: block;
    }

    .instruction {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .url {
      font-size: 10px;
      color: #777;
      word-break: break-all;
      margin-bottom: 15px;
    }

    .card-actions {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .loading {
      max-width: 1100px;
      margin: 50px auto;
      text-align: center;
      color: #777;
    }


    /* ========================================================
       PRINT
       ======================================================== */

    @media print {

      @page {
        size: A4;
        margin: 10mm;
      }

      body {
        background: white;
        padding: 0;
      }

      .header,
      .actions,
      .status {
        display: none !important;
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8mm;
        max-width: none;
      }

      .card {
        border: 1px solid #ccc;
        box-shadow: none;
        border-radius: 0;
        padding: 10mm;
        min-height: 125mm;
      }

      .qr {
        width: 55mm;
        height: 55mm;
      }

      .url,
      .card-actions {
        display: none !important;
      }

    }

  </style>

</head>


<body>

  <div class="header">

    <h1>Utoy's Tapsi</h1>

    <p>
      Table QR Code Manager
    </p>

  </div>


  <div class="actions">

    <button
      class="primary"
      onclick="window.print()">

      Print All QR Cards

    </button>


    <button
      class="secondary"
      onclick="loadTables()">

      Refresh

    </button>


    <button
      class="secondary"
      onclick="goDashboard()">

      Staff Dashboard

    </button>

  </div>


  <div
    id="status"
    class="status">
  </div>


  <div
    id="loading"
    class="loading">

    Loading tables...

  </div>


  <div
    id="grid"
    class="grid">
  </div>


  <script>

    /**
     * ========================================================
     * LOAD TABLES
     * ========================================================
     */

    function loadTables() {

      document
        .getElementById('loading')
        .style.display = 'block';

      document
        .getElementById('grid')
        .innerHTML = '';

      google.script.run
        .withSuccessHandler(
          renderTables
        )
        .withFailureHandler(
          showError
        )
        .getTablesForQrPage();

    }


    /**
     * ========================================================
     * RENDER TABLES
     * ========================================================
     */

    function renderTables(tables) {

      document
        .getElementById('loading')
        .style.display = 'none';


      const grid =
        document.getElementById('grid');


      if (
        !tables ||
        tables.length === 0
      ) {

        grid.innerHTML =
          '<div class="card">' +
          'No active tables found.' +
          '</div>';

        return;

      }


      tables.forEach(
        function(table) {

          const card =
            document.createElement('div');

          card.className =
            'card';


          const tableId =
            String(
              table.tableId || ''
            );


          const tableName =
            String(
              table.tableName || tableId
            );


          const url =
            String(
              table.url || ''
            );


          /*
           * QR image is generated through
           * Google Chart-compatible QR endpoint.
           *
           * The encoded content is ONLY the
           * customer URL.
           */

          const qrUrl =
            'https://quickchart.io/qr?size=500&text=' +
            encodeURIComponent(url);


          card.innerHTML =

            '<div class="restaurant">' +
              "Utoy's Tapsi" +
            '</div>' +

            '<div class="table-name">' +
              escapeHtml(tableName) +
            '</div>' +

            '<div class="table-id">' +
              'Table ID: ' +
              escapeHtml(tableId) +
            '</div>' +

            '<img ' +
              'class="qr" ' +
              'src="' +
              qrUrl +
              '" ' +
              'alt="QR code for ' +
              escapeHtml(tableName) +
              '">' +

            '<div class="instruction">' +
              'SCAN TO ORDER' +
            '</div>' +

            '<div class="url">' +
              escapeHtml(url) +
            '</div>' +

            '<div class="card-actions">' +

              '<button ' +
                'class="primary" ' +
                'onclick="printOne(this)">' +
                'Print' +
              '</button>' +

              '<button ' +
                'class="secondary" ' +
                'onclick="copyUrl(this)">' +
                'Copy URL' +
              '</button>' +

            '</div>';


          card.dataset.url = url;


          grid.appendChild(card);

        }
      );

    }


    /**
     * ========================================================
     * PRINT ONE CARD
     * ========================================================
     */

    function printOne(button) {

      const card =
        button.closest('.card');


      const allCards =
        document.querySelectorAll('.card');


      allCards.forEach(
        function(item) {

          item.dataset.originalDisplay =
            item.style.display;

          item.style.display =
            'none';

        }
      );


      card.style.display =
        'block';


      window.print();


      allCards.forEach(
        function(item) {

          item.style.display =
            item.dataset.originalDisplay || '';

        }
      );

    }


    /**
     * ========================================================
     * COPY URL
     * ========================================================
     */

    function copyUrl(button) {

      const card =
        button.closest('.card');


      const url =
        card.dataset.url;


      navigator.clipboard
        .writeText(url)
        .then(
          function() {

            showStatus(
              'Customer URL copied.'
            );

          }
        )
        .catch(
          function() {

            showStatus(
              url
            );

          }
        );

    }


    /**
     * ========================================================
     * DASHBOARD
     * ========================================================
     */

function goDashboard() {

  google.script.run
    .withSuccessHandler(
      function(url) {

        window.top.location.href =
          url +
          '?page=dashboard';

      }
    )
    .withFailureHandler(
      function(error) {

        alert(
          'Unable to open Staff Dashboard: ' +
          (
            error.message ||
            error
          )
        );

      }
    )
    .getWebAppUrl();

}


    /**
     * ========================================================
     * ERROR
     * ========================================================
     */

    function showError(error) {

      document
        .getElementById('loading')
        .style.display = 'none';


      showStatus(
        'Error: ' +
        (
          error &&
          error.message
            ? error.message
            : error
        )
      );

    }


    /**
     * ========================================================
     * STATUS
     * ========================================================
     */

    function showStatus(message) {

      const status =
        document.getElementById('status');


      status.textContent =
        message;


      status.style.display =
        'block';

    }


    /**
     * ========================================================
     * HTML ESCAPE
     * ========================================================
     */

    function escapeHtml(value) {

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


    /**
     * ========================================================
     * INITIAL LOAD
     * ========================================================
     */

    loadTables();

  </script>

</body>

</html>
