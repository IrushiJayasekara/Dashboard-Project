document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       DASHBOARD INITIALIZATION
       ===================================================== */

    const dashboard = document.querySelector(".dashboard");

    if (!dashboard) {
        console.warn("Dashboard container not found.");
        return;
    }


    /* =====================================================
       KPI CARDS
       ===================================================== */

    const kpiCards = dashboard.querySelectorAll(".kpi-card");

    kpiCards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {
            card.classList.add("active");
        });

        card.addEventListener("mouseleave", function () {
            card.classList.remove("active");
        });

    });


    /* =====================================================
       SCAS REPORT
       ===================================================== */

    const scasCard = Array.from(kpiCards).find(function (card) {

        const title = card.querySelector(".kpi-title");

        return title &&
               title.textContent.trim() === "SCAS Report";

    });


    if (scasCard) {

        scasCard.addEventListener("click", function () {

            console.log("SCAS Report clicked");

            /*
             * Add SCAS Report action here later.
             *
             * Example:
             * - Open a report
             * - Call an Axpert function
             * - Navigate to another page
             */

        });

    }


    /* =====================================================
       CURRENCY DROPDOWNS
       ===================================================== */

    const currencyElements =
        dashboard.querySelectorAll(".kpi-currency");

    currencyElements.forEach(function (currency) {

        currency.addEventListener("click", function (event) {

            event.stopPropagation();

            console.log("Currency selector clicked");

            /*
             * Currency functionality can be added here later.
             *
             * Example:
             * LKR
             * USD
             * etc.
             */

        });

    });


    /* =====================================================
       DASHBOARD READY
       ===================================================== */

    console.log("Dashboard initialized successfully.");

});