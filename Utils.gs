<!DOCTYPE html>
<html>

<head>

  <base target="_top">

  <meta name="viewport"
        content="width=device-width, initial-scale=1">

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f3f4f6;
      color: #222;
    }

    .header {
      background: #111;
      color: white;
      padding: 18px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-row {
      max-width: 1200px;
      margin: auto;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 15px;
    }

    .dashboard-title {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      white-space: nowrap;
    }

    .restaurant-name {
      font-size: 21px;
      font-weight: bold;
    }

    .last-update {
      font-size: 12px;
      opacity: .75;
      margin-top: 4px;
    }

    .dashboard {
      max-width: 1200px;
      margin: auto;
      padding: 18px;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 2px 8px rgba(0,0,0,.08);
      text-align: center;
      border: 5px solid #d1d5db;
    }

    .summary-card.new {
      border-color: #d97706;
    }

    .summary-card.accepted {
      border-color: #2563eb;
    }

    .summary-card.preparing {
      border-color: #7c3aed;
    }

    .summary-card.ready {
      border-color: #059669;
    }

    .summary-card.active {
      border-color: #dc2626;
    }

    .summary-number {
      font-size: 27px;
      font-weight: bold;
    }

    .summary-label {
      margin-top: 5px;
      font-size: 12px;
      color: #777;
    }


    /* =====================================================
       PAYMENT VERIFICATION
       ===================================================== */

    .payment-verification {
      background: white;
      border-radius: 14px;
      padding: 17px;
      margin-bottom: 20px;
      box-shadow: 0 3px 12px rgba(0,0,0,.10);
      border-left: 6px solid #d97706;
    }

    .payment-verification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .payment-verification-title {
      font-size: 20px;
      font-weight: bold;
    }

    .payment-verification-count {
      display: inline-block;
      min-width: 32px;
      padding: 5px 9px;
      border-radius: 20px;
      background: #fff7ed;
      color: #b45309;
      border: 2px solid #d97706;
      font-size: 13px;
      font-weight: bold;
      text-align: center;
    }

    .payment-proof-list {
      display: grid;
      gap: 10px;
    }

    .payment-proof {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      background: #fafafa;
    }

    .payment-proof-info {
      min-width: 0;
    }

    .payment-proof-order {
      font-size: 14px;
      font-weight: bold;
      word-break: break-all;
    }

    .payment-proof-details {
      margin-top: 5px;
      font-size: 13px;
      color: #555;
      line-height: 1.5;
    }

    .payment-proof-reference {
      margin-top: 3px;
      font-size: 12px;
      color: #777;
      word-break: break-all;
    }

    .payment-proof-view {
      min-width: 80px;
      background: #222;
      color: white;
    }

    .payment-verification-empty {
      padding: 14px;
      text-align: center;
      color: #777;
      background: #f9fafb;
      border-radius: 8px;
      font-size: 13px;
    }


    /* =====================================================
       PAYMENT PROOF DETAIL
       ===================================================== */

    .payment-detail-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.65);
      z-index: 1000;
      padding: 20px;
      overflow-y: auto;
    }

    .payment-detail-overlay.show {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .payment-detail-modal {
      width: 100%;
      max-width: 650px;
      background: white;
      border-radius: 14px;
      box-shadow: 0 10px 40px rgba(0,0,0,.35);
      overflow: hidden;
    }

    .payment-detail-header {
      background: #111;
      color: white;
      padding: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }

    .payment-detail-title {
      font-size: 20px;
      font-weight: bold;
    }

    .payment-detail-close {
      background: #333;
      color: white;
      min-width: 44px;
      padding: 8px 12px;
    }

    .payment-detail-body {
      padding: 20px;
    }

    .payment-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .payment-detail-field {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 11px;
    }

    .payment-detail-field.full {
      grid-column: span 2;
    }

    .payment-detail-label {
      font-size: 11px;
      color: #777;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .payment-detail-value {
      font-size: 14px;
      font-weight: 500;
      word-break: break-word;
    }

    .payment-detail-amount {
      font-size: 22px;
      font-weight: bold;
    }

    .payment-detail-result {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 20px;
      background: #fff7ed;
      color: #b45309;
      border: 1px solid #d97706;
      font-size: 12px;
      font-weight: bold;
    }

    .payment-proof-link {
      display: inline-block;
      margin-top: 5px;
      color: #2563eb;
      font-weight: bold;
      text-decoration: none;
      word-break: break-all;
    }

    .payment-detail-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 20px;
    }

    .payment-approve {
      background: #059669;
      color: white;
    }

    .payment-reject {
      background: #dc2626;
      color: white;
    }

    .payment-detail-actions button {
      min-height: 48px;
    }

    .payment-detail-loading {
      padding: 35px;
      text-align: center;
      color: #777;
    }


    /* =====================================================
       STATUS BADGES
       ===================================================== */

    .badge {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      background: #f3f4f6;
      color: #555;
      border: 2px solid #d1d5db;
      white-space: nowrap;
      height: fit-content;
      letter-spacing: .3px;
    }

    .badge.new {
      background: #fff7ed;
      color: #b45309;
      border-color: #d97706;
    }

    .badge.accepted {
      background: #eff6ff;
      color: #1d4ed8;
      border-color: #2563eb;
    }

    .badge.preparing {
      background: #f5f3ff;
      color: #6d28d9;
      border-color: #7c3aed;
    }

    .badge.ready {
      background: #ecfdf5;
      color: #047857;
      border-color: #059669;
    }

    .badge.rejected {
      background: #fef2f2;
      color: #b91c1c;
      border-color: #dc2626;
    }

    .badge.completed {
      background: #f3f4f6;
      color: #4b5563;
      border-color: #6b7280;
    }


    /* =====================================================
       ORDERS
       ===================================================== */

    .customer {
      font-size: 17px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .table {
      font-size: 13px;
      color: #666;
      margin-bottom: 14px;
    }

    .item {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }

    .instruction {
      margin-top: 4px;
      font-size: 12px;
      color: #b45309;
    }

    .total {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
    }

    .notes {
      margin-top: 13px;
      padding: 10px;
      background: #fff7ed;
      border-radius: 8px;
      font-size: 13px;
    }

    .actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 16px;
    }

    button {
      border: 0;
      border-radius: 8px;
      padding: 11px;
      cursor: pointer;
      font-weight: bold;
      background: #222;
      color: white;
    }

    button:hover {
      opacity: .9;
    }

    button:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    .header-actions {
      display: flex;
      justify-content: flex-end;
    }

    .refresh-button {
      min-width: 100px;
    }

    .payment {
      margin-top: 12px;
      width: 100%;
      background: white;
      color: #222;
      border: 1px solid #ddd;
    }

    .payment:hover {
      background: #f5f5f5;
    }

    .empty {
      text-align: center;
      padding: 60px 20px;
      color: #777;
      background: white;
      border-radius: 14px;
    }

    .error {
      padding: 20px;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .loading {
      opacity: .65;
      pointer-events: none;
    }


    /* =====================================================
       RESPONSIVE
       ===================================================== */

    @media(max-width: 900px) {

      .summary {
        grid-template-columns: repeat(3, 1fr);
      }

    }


    @media(max-width: 700px) {

      .summary {
        grid-template-columns: repeat(2, 1fr);
      }

      .summary-card:last-child {
        grid-column: span 2;
      }

      .header-row {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .header-row > div {
        width: 100%;
        text-align: center;
      }

      .header-actions {
        justify-content: center;
      }

      .dashboard-title {
        font-size: 24px;
      }

      .refresh-button {
        width: 100%;
      }

      .payment-verification-header {
        align-items: flex-start;
      }

      .payment-proof {
        grid-template-columns: 1fr;
      }

      .payment-proof-view {
        width: 100%;
      }

      .payment-detail-grid {
        grid-template-columns: 1fr;
      }

      .payment-detail-field.full {
        grid-column: span 1;
      }

      .payment-detail-actions {
        grid-template-columns: 1fr;
      }

    }

  </style>

</head>


<body>

  <header class="header">

    <div class="header-row">

      <div>

        <div class="restaurant-name">
          Utoy's Tapsi
        </div>

        <div
          class="last-update"
          id="lastUpdate">
          Connecting...
        </div>

      </div>

      <div class="dashboard-title">
        Order Dashboard
      </div>

      <div class="header-actions">

        <button
          id="refreshButton"
          class="refresh-button"
          onclick="loadDashboard(true)">
          REFRESH
        </button>

      </div>

    </div>

  </header>


  <main class="dashboard">

    <div id="errorContainer"></div>


    <!-- ===================================================
         ORDER SUMMARY
         =================================================== -->

    <section class="summary">

      <div class="summary-card new">

        <div
          class="summary-number"
          id="newCount">
          0
        </div>

        <div class="summary-label">
          NEW
        </div>

      </div>


      <div class="summary-card accepted">

        <div
          class="summary-number"
          id="acceptedCount">
          0
        </div>

        <div class="summary-label">
          ACCEPTED
        </div>

      </div>


      <div class="summary-card preparing">

        <div
          class="summary-number"
          id="preparingCount">
          0
        </div>

        <div class="summary-label">
          PREPARING
        </div>

      </div>


      <div class="summary-card ready">

        <div
          class="summary-number"
          id="readyCount">
          0
        </div>

        <div class="summary-label">
          READY
        </div>

      </div>


      <div class="summary-card active">

        <div
          class="summary-number"
          id="activeCount">
          0
        </div>

        <div class="summary-label">
          ACTIVE ORDERS
        </div>

      </div>

    </section>


    <!-- ===================================================
         PAYMENT VERIFICATION
         =================================================== -->

    <section
      id="paymentVerification"
      class="payment-verification">

      <div class="payment-verification-header">

        <div class="payment-verification-title">
          Payment Verification
        </div>

        <div
          id="paymentVerificationCount"
          class="payment-verification-count">
          0
        </div>

      </div>

      <div
        id="paymentProofList"
        class="payment-proof-list">

        <div class="payment-verification-empty">
          Checking payment proofs...
        </div>

      </div>

    </section>


    <!-- ===================================================
         ORDERS
         =================================================== -->

    <section
      id="orders"
      class="orders">

      <div class="empty">
        Loading orders...
      </div>

    </section>

  </main>


  <!-- =====================================================
       PAYMENT PROOF DETAIL MODAL
       ===================================================== -->

  <div
    id="paymentDetailOverlay"
    class="payment-detail-overlay">

    <div class="payment-detail-modal">

      <div class="payment-detail-header">

        <div class="payment-detail-title">
          Payment Proof Details
        </div>

        <button
          class="payment-detail-close"
          onclick="closePaymentProof()">
          ✕
        </button>

      </div>


      <div
        id="paymentDetailBody"
        class="payment-detail-body">

        <div class="payment-detail-loading">
          Loading payment proof...
        </div>

      </div>

    </div>

  </div>


  <script>

    let dashboardOrders = [];


    let paymentVerificationData = {
      pendingCount: 0,
      proofs: []
    };


    let dashboardLoading = false;


    let currentPaymentProof = null;


    /* =====================================================
       START
       ===================================================== */

    document.addEventListener(
      'DOMContentLoaded',
      function() {

        loadDashboard(false);


        setInterval(
          function() {

            loadDashboard(false);

          },
          10000
        );

      }
    );


    /* =====================================================
       LOAD DASHBOARD
       ===================================================== */

    function loadDashboard(
      manualRefresh
    ) {

      if (dashboardLoading) {
        return;
      }


      dashboardLoading = true;


      const refreshButton =
        document.getElementById(
          'refreshButton'
        );


      if (manualRefresh) {

        refreshButton.disabled = true;

        refreshButton.innerText =
          'REFRESHING...';

      }


      google.script.run

        .withSuccessHandler(
          function(response) {

            if (
              !response ||
              response.success !== true
            ) {

              dashboardLoading = false;


              if (manualRefresh) {

                refreshButton.disabled =
                  false;

                refreshButton.innerText =
                  'REFRESH';

              }


              showError(
                response &&
                response.error
                  ? response.error
                  : 'Unable to load orders.'
              );

              return;

            }


            dashboardOrders =
              Array.isArray(
                response.orders
              )
                ? response.orders
                : [];


            renderSummary(
              response.summary || {}
            );


            renderOrders(
              dashboardOrders
            );


            google.script.run

              .withSuccessHandler(
                function(paymentResponse) {

                  dashboardLoading = false;


                  if (manualRefresh) {

                    refreshButton.disabled =
                      false;

                    refreshButton.innerText =
                      'REFRESH';

                  }


                  if (
                    !paymentResponse ||
                    paymentResponse.success !== true
                  ) {

                    paymentVerificationData = {
                      pendingCount: 0,
                      proofs: []
                    };


                    renderPaymentVerification();


                    showError(
                      paymentResponse &&
                      paymentResponse.error
                        ? paymentResponse.error
                        : 'Unable to load payment verification.'
                    );

                    return;

                  }


                  clearError();


                  paymentVerificationData = {

                    pendingCount:
                      Number(
                        paymentResponse.pendingCount || 0
                      ),

                    proofs:
                      Array.isArray(
                        paymentResponse.proofs
                      )
                        ? paymentResponse.proofs
                        : []

                  };


                  renderPaymentVerification();


                  document
                    .getElementById(
                      'lastUpdate'
                    )
                    .innerText =
                      'Updated ' +
                      new Date()
                        .toLocaleTimeString();

                }
              )

              .withFailureHandler(
                function(error) {

                  dashboardLoading = false;


                  if (manualRefresh) {

                    refreshButton.disabled =
                      false;

                    refreshButton.innerText =
                      'REFRESH';

                  }


                  paymentVerificationData = {
                    pendingCount: 0,
                    proofs: []
                  };


                  renderPaymentVerification();


                  showError(
                    error &&
                    error.message
                      ? error.message
                      : 'Payment verification connection error.'
                  );

                }
              )

              .getStaffPaymentVerificationData();

          }
        )

        .withFailureHandler(
          function(error) {

            dashboardLoading = false;


            if (manualRefresh) {

              refreshButton.disabled = false;

              refreshButton.innerText =
                'REFRESH';

            }


            showError(
              error &&
              error.message
                ? error.message
                : 'Connection error.'
            );

          }
        )

        .getDashboardOrders();

    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function renderSummary(
      summary
    ) {

      document
        .getElementById(
          'newCount'
        )
        .innerText =
          Number(
            summary.newOrders || 0
          );


      document
        .getElementById(
          'acceptedCount'
        )
        .innerText =
          Number(
            summary.accepted || 0
          );


      document
        .getElementById(
          'preparingCount'
        )
        .innerText =
          Number(
            summary.preparing || 0
          );


      document
        .getElementById(
          'readyCount'
        )
        .innerText =
          Number(
            summary.ready || 0
          );


      document
        .getElementById(
          'activeCount'
        )
        .innerText =
          Number(
            summary.totalActive || 0
          );

    }


    /* =====================================================
       PAYMENT VERIFICATION LIST
       ===================================================== */

    function renderPaymentVerification() {

      const countElement =
        document.getElementById(
          'paymentVerificationCount'
        );


      const listElement =
        document.getElementById(
          'paymentProofList'
        );


      const pendingCount =
        Number(
          paymentVerificationData.pendingCount || 0
        );


      const proofs =
        Array.isArray(
          paymentVerificationData.proofs
        )
          ? paymentVerificationData.proofs
          : [];


      countElement.innerText =
        pendingCount;


      if (!proofs.length) {

        listElement.innerHTML =

          '<div class="payment-verification-empty">' +

            '<strong>No pending payment proofs</strong>' +

            '<br><br>' +

            'Customer-submitted payment proofs will appear here for verification.' +

          '</div>';

        return;

      }


      let html = '';


      proofs.forEach(
        function(proof) {

          const proofId =
            proof.Payment_Proof_ID || '';


          const orderId =
            proof.Order_ID || '';


          const paymentMethod =
            proof.Payment_Method || '';


          const paymentAmount =
            Number(
              proof.Payment_Amount || 0
            );


          const reference =
            proof.Reference || '';


          const submittedDate =
            proof.Submitted_Date || '';


          html +=

            '<div class="payment-proof">' +

              '<div class="payment-proof-info">' +

                '<div class="payment-proof-order">' +

                  'ORDER: ' +

                  escapeHtml(
                    orderId
                  ) +

                '</div>' +


                '<div class="payment-proof-details">' +

                  '<strong>' +

                    escapeHtml(
                      paymentMethod
                    ) +

                  '</strong>' +

                  ' · ₱' +

                  paymentAmount.toFixed(2) +

                  '<br>' +

                  'Submitted: ' +

                  escapeHtml(
                    formatPaymentProofDate(
                      submittedDate
                    )
                  ) +

                '</div>' +


                (
                  reference

                    ? '<div class="payment-proof-reference">' +

                        'Reference: ' +

                        escapeHtml(
                          reference
                        ) +

                      '</div>'

                    : ''

                ) +

              '</div>' +


              '<button ' +

                'class="payment-proof-view" ' +

                'onclick="viewPaymentProof(' +

                  '\'' +

                  escapeJs(
                    proofId
                  ) +

                  '\'' +

                ')">' +

                'VIEW' +

              '</button>' +

            '</div>';

        }
      );


      listElement.innerHTML =
        html;

    }


    /* =====================================================
       PAYMENT PROOF DATE
       ===================================================== */

    function formatPaymentProofDate(
      value
    ) {

      if (!value) {
        return '';
      }


      const date =
        new Date(
          value
        );


      if (
        isNaN(
          date.getTime()
        )
      ) {

        return String(
          value
        );

      }


      return date.toLocaleString();

    }


    /* =====================================================
       VIEW PAYMENT PROOF
       ===================================================== */

    function viewPaymentProof(
      paymentProofId
    ) {

      if (!paymentProofId) {

        showError(
          'Payment proof ID is missing.'
        );

        return;

      }


      const overlay =
        document.getElementById(
          'paymentDetailOverlay'
        );


      const body =
        document.getElementById(
          'paymentDetailBody'
        );


      overlay.classList.add(
        'show'
      );


      body.innerHTML =

        '<div class="payment-detail-loading">' +

          'Loading payment proof...' +

        '</div>';


      google.script.run

        .withSuccessHandler(
          function(response) {

            if (
              !response ||
              response.success !== true
            ) {

              body.innerHTML =

                '<div class="payment-detail-loading">' +

                  escapeHtml(
                    response &&
                    response.error
                      ? response.error
                      : 'Unable to load payment proof.'
                  ) +

                '</div>';

              return;

            }


            currentPaymentProof =
              response.proof || {};


            renderPaymentProofDetail(
              currentPaymentProof
            );

          }
        )

        .withFailureHandler(
          function(error) {

            body.innerHTML =

              '<div class="payment-detail-loading">' +

                escapeHtml(
                  error &&
                  error.message
                    ? error.message
                    : 'Unable to load payment proof details.'
                ) +

              '</div>';

          }
        )

        .getStaffPaymentProofDetail(
          paymentProofId
        );

    }


    /* =====================================================
       RENDER PAYMENT PROOF DETAIL
       ===================================================== */

    function renderPaymentProofDetail(
      proof
    ) {

      const body =
        document.getElementById(
          'paymentDetailBody'
        );


      const proofId =
        proof.Payment_Proof_ID || '';


      const orderId =
        proof.Order_ID || '';


      const submittedDate =
        formatPaymentProofDate(
          proof.Submitted_Date
        );


      const paymentMethod =
        proof.Payment_Method || '';


      const paymentAmount =
        Number(
          proof.Payment_Amount || 0
        );


      const reference =
        proof.Reference || '';


      const proofFileId =
        proof.Proof_File_ID || '';


      const proofFileUrl =
        proof.Proof_File_URL || '';


      const verificationStatus =
        proof.Verification_Status || '';


      const paymentResult =
        proof.Payment_Result || '';


      let html =

        '<div class="payment-detail-grid">' +


          '<div class="payment-detail-field full">' +

            '<div class="payment-detail-label">' +

              'Payment Proof ID' +

            '</div>' +

            '<div class="payment-detail-value">' +

              escapeHtml(
                proofId
              ) +

            '</div>' +

          '</div>' +


          '<div class="payment-detail-field">' +

            '<div class="payment-detail-label">' +

              'Order ID' +

            '</div>' +

            '<div class="payment-detail-value">' +

              escapeHtml(
                orderId
              ) +

            '</div>' +

          '</div>' +


          '<div class="payment-detail-field">' +

            '<div class="payment-detail-label">' +

              'Payment Method' +

            '</div>' +

            '<div class="payment-detail-value">' +

              escapeHtml(
                paymentMethod
              ) +

            '</div>' +

          '</div>' +


          '<div class="payment-detail-field">' +

            '<div class="payment-detail-label">' +

              'Payment Amount' +

            '</div>' +

            '<div class="payment-detail-value payment-detail-amount">' +

              '₱' +

              paymentAmount.toFixed(2) +

            '</div>' +

          '</div>' +


          '<div class="payment-detail-field">' +

            '<div class="payment-detail-label">' +

              'Payment Result' +

            '</div>' +

            '<div class="payment-detail-value">' +

              '<span class="payment-detail-result">' +

                escapeHtml(
                  paymentResult
                ) +

              '</span>' +

            '</div>' +

          '</div>' +


          '<div class="payment-detail-field">' +

            '<div class="payment-detail-label">' +

              'Submitted Date' +

            '</div>' +

            '<div class="payment-detail-value">' +

              escapeHtml(
                submittedDate
              ) +

            '</div>' +

          '</div>' +


          '<div class="payment-detail-field">' +

            '<div class="payment-detail-label">' +

              'Reference' +

            '</div>' +

            '<div class="payment-detail-value">' +

              escapeHtml(
                reference || '-'
              ) +

            '</div>' +

          '</div>' +


          '<div class="payment-detail-field">' +

            '<div class="payment-detail-label">' +

              'Verification Status' +

            '</div>' +

            '<div class="payment-detail-value">' +

              escapeHtml(
                verificationStatus
              ) +

            '</div>' +

          '</div>' +


          '<div class="payment-detail-field full">' +

            '<div class="payment-detail-label">' +

              'Proof File' +

            '</div>' +

            '<div class="payment-detail-value">' +

              (
                proofFileUrl

                  ? '<a class="payment-proof-link" href="' +

                      escapeHtml(
                        proofFileUrl
                      ) +

                      '" target="_blank" rel="noopener">' +

                      'OPEN PAYMENT PROOF' +

                    '</a>'

                  : (
                      proofFileId
                        ? escapeHtml(
                            proofFileId
                          )
                        : '-'
                    )

              ) +

            '</div>' +

          '</div>' +


        '</div>';


      /*
       * Only PENDING proofs may be acted upon.
       */

      if (
        String(
          verificationStatus
        )
        .toUpperCase() === 'PENDING'
      ) {

        html +=

          '<div class="payment-detail-actions">' +

            '<button ' +

              'class="payment-approve" ' +

              'onclick="approveCurrentPaymentProof()">' +

              'APPROVE PAYMENT' +

            '</button>' +


            '<button ' +

              'class="payment-reject" ' +

              'onclick="rejectCurrentPaymentProof()">' +

              'REJECT PAYMENT' +

            '</button>' +

          '</div>';

      }


      body.innerHTML =
        html;

    }


    /* =====================================================
       CLOSE PAYMENT PROOF
       ===================================================== */

    function closePaymentProof() {

      const overlay =
        document.getElementById(
          'paymentDetailOverlay'
        );


      overlay.classList.remove(
        'show'
      );


      currentPaymentProof =
        null;

    }


    /* =====================================================
       APPROVE CURRENT PAYMENT PROOF
       ===================================================== */

    function approveCurrentPaymentProof() {

      if (!currentPaymentProof) {

        showError(
          'No payment proof is selected.'
        );

        return;

      }


      const proofId =
        currentPaymentProof.Payment_Proof_ID || '';


      if (!proofId) {

        showError(
          'Payment proof ID is missing.'
        );

        return;

      }


      const status =
        String(
          currentPaymentProof.Verification_Status || ''
        )
        .toUpperCase();


      if (status !== 'PENDING') {

        showError(
          'This payment proof is no longer pending.'
        );

        closePaymentProof();

        loadDashboard(false);

        return;

      }


      const confirmed =
        confirm(

          'Approve this payment proof?\n\n' +

          'This will create a confirmed payment and update the order payment status.'

        );


      if (!confirmed) {
        return;
      }


      const staffName =
        prompt(
          'Enter staff name or staff ID:',
          ''
        );


      if (
        staffName === null
      ) {

        return;

      }


      const cleanedStaffName =
        String(
          staffName
        )
        .trim();


      if (!cleanedStaffName) {

        showError(
          'Staff name or staff ID is required.'
        );

        return;

      }


      google.script.run

        .withSuccessHandler(
          function(response) {

            if (
              !response ||
              response.success !== true
            ) {

              showError(
                response &&
                response.error
                  ? response.error
                  : 'Unable to approve payment proof.'
              );

              return;

            }


            closePaymentProof();


            loadDashboard(true);


            alert(

              'Payment proof approved successfully.\n\n' +

              'Payment ID: ' +
              (
                response.paymentId ||
                ''
              ) +

              '\n\n' +

              'Paid Amount: ₱' +
              Number(
                response.paidAmount || 0
              ).toFixed(2) +

              '\n\n' +

              'Remaining: ₱' +
              Number(
                response.remainingAmount || 0
              ).toFixed(2) +

              '\n\n' +

              'Payment Status: ' +
              (
                response.paymentStatus ||
                ''
              )

            );

          }
        )

        .withFailureHandler(
          function(error) {

            showError(
              error &&
              error.message
                ? error.message
                : 'Payment approval failed.'
            );

          }
        )

        .staffApprovePaymentProof(
          proofId,
          cleanedStaffName
        );

    }


    /* =====================================================
       REJECT CURRENT PAYMENT PROOF
       ===================================================== */

    function rejectCurrentPaymentProof() {

      if (!currentPaymentProof) {

        showError(
          'No payment proof is selected.'
        );

        return;

      }


      const proofId =
        currentPaymentProof.Payment_Proof_ID || '';


      if (!proofId) {

        showError(
          'Payment proof ID is missing.'
        );

        return;

      }


      const status =
        String(
          currentPaymentProof.Verification_Status || ''
        )
        .toUpperCase();


      if (status !== 'PENDING') {

        showError(
          'This payment proof is no longer pending.'
        );

        closePaymentProof();

        loadDashboard(false);

        return;

      }


      const staffName =
        prompt(
          'Enter staff name or staff ID:',
          ''
        );


      if (
        staffName === null
      ) {

        return;

      }


      const cleanedStaffName =
        String(
          staffName
        )
        .trim();


      if (!cleanedStaffName) {

        showError(
          'Staff name or staff ID is required.'
        );

        return;

      }


      const rejectionReason =
        prompt(
          'Enter rejection reason:',
          ''
        );


      if (
        rejectionReason === null
      ) {

        return;

      }


      const cleanedReason =
        String(
          rejectionReason
        )
        .trim();


      if (!cleanedReason) {

        showError(
          'Rejection reason is required.'
        );

        return;

      }


      const confirmed =
        confirm(

          'Reject this payment proof?\n\n' +

          'Reason: ' +

          cleanedReason

        );


      if (!confirmed) {
        return;
      }


      google.script.run

        .withSuccessHandler(
          function(response) {

            if (
              !response ||
              response.success !== true
            ) {

              showError(
                response &&
                response.error
                  ? response.error
                  : 'Unable to reject payment proof.'
              );

              return;

            }


            closePaymentProof();


            loadDashboard(true);


            alert(
              'Payment proof rejected successfully.'
            );

          }
        )

        .withFailureHandler(
          function(error) {

            showError(
              error &&
              error.message
                ? error.message
                : 'Payment rejection failed.'
            );

          }
        )

        .staffRejectPaymentProof(
          proofId,
          cleanedStaffName,
          cleanedReason
        );

    }


    /* =====================================================
       RENDER ORDERS
       ===================================================== */

    function renderOrders(
      orders
    ) {

      const container =
        document.getElementById(
          'orders'
        );


      if (!orders.length) {

        container.innerHTML =

          '<div class="empty">' +

            '<strong>No active orders</strong>' +

            '<br><br>' +

            'New customer orders will appear here automatically.' +

          '</div>';

        return;

      }


      let html = '';


      orders.forEach(
        function(order) {

          html +=
            renderOrderCard(
              order
            );

        }
      );


      container.innerHTML =
        html;

    }


    /* =====================================================
       ORDER CARD
       ===================================================== */

    function renderOrderCard(
      order
    ) {

      const status =
        String(
          order.status || 'NEW'
        )
        .toUpperCase();


      const statusClass =
        status.toLowerCase();


      let html =

        '<div class="order-card ' +
          statusClass +
        '">' +


          '<div class="order-top">' +

            '<div>' +

              '<div class="order-id">' +

                escapeHtml(
                  order.orderId
                ) +

              '</div>' +

              '<div class="order-time">' +

                escapeHtml(
                  order.orderDate
                ) +

              '</div>' +

            '</div>' +


            '<div class="badge ' +
              statusClass +
            '">' +

              escapeHtml(
                status
              ) +

            '</div>' +

          '</div>' +


          '<div class="customer">' +

            escapeHtml(
              order.customerName ||
              'Customer'
            ) +

          '</div>' +


          '<div class="table">' +

            (
              order.tableId

                ? 'TABLE: ' +
                  escapeHtml(
                    order.tableId
                  )

                : 'ONLINE ORDER'
            ) +

            ' · ' +

            escapeHtml(
              order.orderType ||
              ''
            ) +

          '</div>';


      const items =
        Array.isArray(
          order.items
        )
          ? order.items
          : [];


      items.forEach(
        function(item) {

          html +=

            '<div class="item">' +

              '<div>' +

                '<strong>' +

                  Number(
                    item.quantity || 0
                  ) +

                  ' × ' +

                '</strong>' +

                escapeHtml(
                  item.itemName ||
                  ''
                );


          if (
            item.specialInstructions
          ) {

            html +=

              '<div class="instruction">' +

                'Note: ' +

                escapeHtml(
                  item.specialInstructions
                ) +

              '</div>';

          }


          html +=

              '</div>' +

              '<div>' +

                '₱' +

                Number(
                  item.lineTotal || 0
                ).toFixed(2) +

              '</div>' +

            '</div>';

        }
      );


      if (
        order.customerNotes
      ) {

        html +=

          '<div class="notes">' +

            '<strong>Order Note:</strong>' +

            '<br>' +

            escapeHtml(
              order.customerNotes
            ) +

          '</div>';

      }


      html +=

          '<div class="total">' +

            '<span>TOTAL</span>' +

            '<span>₱' +

              Number(
                order.total || 0
              ).toFixed(2) +

            '</span>' +

          '</div>';


      const paymentStatus =
        String(
          order.paymentStatus ||
          'UNPAID'
        )
        .toUpperCase();


      const nextPaymentStatus =
        paymentStatus === 'PAID'
          ? 'UNPAID'
          : 'PAID';


      html +=

          '<button ' +

            'class="payment" ' +

            'onclick="togglePayment(' +

              '\'' +

              escapeJs(
                order.orderId
              ) +

              '\'' +

              ', ' +

              '\'' +

              nextPaymentStatus +

              '\'' +

            ')">' +

            'PAYMENT: ' +

            escapeHtml(
              paymentStatus
            ) +

          '</button>';


      html +=
        '<div class="actions">';


      if (
        status === 'NEW'
      ) {

        html +=

          '<button ' +

            'onclick="changeStatus(' +

              '\'' +

              escapeJs(
                order.orderId
              ) +

              '\'' +

              ', ' +

              '\'ACCEPTED\'' +

            ')">' +

            'ACCEPT' +

          '</button>' +


          '<button ' +

            'onclick="changeStatus(' +

              '\'' +

              escapeJs(
                order.orderId
              ) +

              '\'' +

              ', ' +

              '\'REJECTED\'' +

            ')">' +

            'REJECT' +

          '</button>';

      }


      else if (
        status === 'ACCEPTED'
      ) {

        html +=

          '<button ' +

            'onclick="changeStatus(' +

              '\'' +

              escapeJs(
                order.orderId
              ) +

              '\'' +

              ', ' +

              '\'PREPARING\'' +

            ')">' +

            'START PREPARING' +

          '</button>';

      }


      else if (
        status === 'PREPARING'
      ) {

        html +=

          '<button ' +

            'onclick="changeStatus(' +

              '\'' +

              escapeJs(
                order.orderId
              ) +

              '\'' +

              ', ' +

              '\'READY\'' +

            ')">' +

            'MARK READY' +

          '</button>';

      }


      else if (
        status === 'READY'
      ) {

        html +=

          '<button ' +

            'onclick="changeStatus(' +

              '\'' +

              escapeJs(
                order.orderId
              ) +

              '\'' +

              ', ' +

              '\'COMPLETED\'' +

            ')">' +

            'COMPLETE ORDER' +

          '</button>';

      }


      html +=

          '</div>' +

        '</div>';


      return html;

    }


    /* =====================================================
       CHANGE ORDER STATUS
       ===================================================== */

    function changeStatus(
      orderId,
      status
    ) {

      google.script.run

        .withSuccessHandler(
          function(response) {

            if (
              !response ||
              response.success !== true
            ) {

              showError(
                response &&
                response.error
                  ? response.error
                  : 'Unable to update order.'
              );

              return;

            }


            loadDashboard(false);

          }
        )

        .withFailureHandler(
          function(error) {

            showError(
              error &&
              error.message
                ? error.message
                : 'Status update failed.'
            );

          }
        )

        .updateOrderStatus(
          orderId,
          status
        );

    }


    /* =====================================================
       PAYMENT
       ===================================================== */

    function togglePayment(
      orderId,
      newStatus
    ) {

      google.script.run

        .withSuccessHandler(
          function(response) {

            if (
              !response ||
              response.success !== true
            ) {

              showError(
                response &&
                response.error
                  ? response.error
                  : 'Unable to update payment status.'
              );

              return;

            }


            loadDashboard(false);

          }
        )

        .withFailureHandler(
          function(error) {

            showError(
              error &&
              error.message
                ? error.message
                : 'Payment update failed.'
            );

          }
        )

        .updatePaymentStatus(
          orderId,
          newStatus
        );

    }


    /* =====================================================
       ERROR
       ===================================================== */

    function showError(
      message
    ) {

      document
        .getElementById(
          'errorContainer'
        )
        .innerHTML =

          '<div class="error">' +

            '<strong>Dashboard Error</strong>' +

            '<br><br>' +

            escapeHtml(
              message ||
              'Unknown error.'
            ) +

          '</div>';

    }


    function clearError() {

      document
        .getElementById(
          'errorContainer'
        )
        .innerHTML = '';

    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(
      value
    ) {

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


    /* =====================================================
       ESCAPE JAVASCRIPT STRING
       ===================================================== */

    function escapeJs(
      value
    ) {

      if (
        value === null ||
        value === undefined
      ) {

        return '';

      }


      return String(value)

        .replace(
          /\\/g,
          '\\\\'
        )

        .replace(
          /'/g,
          "\\'"
        )

        .replace(
          /"/g,
          '\\"'
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
