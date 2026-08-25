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
       KPI CARD HOVER
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

        });

    });


    /* =====================================================
       LOAD SUMMARY CARD DATA
       ===================================================== */

    function loadSummaryCards() {

        const params = {

            adsNames: ["summary_cards_plugin"],

            refreshCache: false,

            sqlParams: {},

            props: {
                ADS: true,
                pageno: 1,
                pagesize: 500
            }

        };


        const caller =
            (typeof parent !== "undefined" &&
             parent.GetDataFromAxList)
                ? parent
                : window;


        console.log(
            "Calling summary_cards_plugin..."
        );


        caller.GetDataFromAxList(

            params,

            function (resp) {

                try {

                    console.log(
                        "summary_cards_plugin RAW response:",
                        resp
                    );


                    /* =========================================
                       PARSE RESPONSE
                       ========================================= */

                    let parsed = resp;


                    if (
                        typeof parsed === "string"
                    ) {

                        parsed = JSON.parse(parsed);

                    }


                    /*
                     * Sometimes Axpert returns:
                     *
                     * {
                     *     d: "JSON STRING"
                     * }
                     */

                    if (
                        parsed &&
                        parsed.d &&
                        typeof parsed.d === "string"
                    ) {

                        parsed = JSON.parse(
                            parsed.d
                        );

                    }


                    console.log(
                        "summary_cards_plugin PARSED:",
                        parsed
                    );


                    /* =========================================
                       GET DATA
                       ========================================= */

                    let listRaw = [];


                    if (
                        parsed &&
                        parsed.result &&
                        Array.isArray(
                            parsed.result.data
                        )
                    ) {

                        parsed.result.data.forEach(
                            function (item) {

                                if (
                                    item &&
                                    Array.isArray(
                                        item.data
                                    )
                                ) {

                                    listRaw =
                                        listRaw.concat(
                                            item.data
                                        );

                                }

                            }
                        );

                    }


                    console.log(
                        "summary_cards_plugin DATA:",
                        listRaw
                    );


                    /* =========================================
                       CHECK DATA
                       ========================================= */

                    if (
                        listRaw.length === 0
                    ) {

                        console.warn(
                            "summary_cards_plugin returned no rows."
                        );

                        return;

                    }


                    /*
                     * Usually this query returns
                     * one summary row.
                     */

                    const data = listRaw[0];


                    console.log(
                        "SUMMARY ROW:",
                        data
                    );


                    /* =========================================
                       SHOW ALL COLUMNS
                       ========================================= */

                    console.log(
                        "Name:",
                        data.name
                    );

                    console.log(
                        "Link:",
                        data.link
                    );

                    console.log(
                        "Total M/C Quantity:",
                        data["Total M/C Quantity"]
                    );

                    console.log(
                        "Total FCV:",
                        data["Total FCV"]
                    );

                    console.log(
                        "Total CONTRIBUTION:",
                        data["Total CONTRIBUTION"]
                    );

                    console.log(
                        "Total Cost:",
                        data["Total Cost"]
                    );

                    console.log(
                        "Revenue:",
                        data["Revenue"]
                    );

                    console.log(
                        "TEA QTY:",
                        data["TEA QTY"]
                    );

                    console.log(
                        "EXRATE:",
                        data["EXRATE"]
                    );


                    /* =========================================
                       UPDATE DASHBOARD
                       ========================================= */

                    updateDashboardCards(data);


                } catch (e) {

                    console.error(
                        "summary_cards_plugin parse failed:",
                        e
                    );

                }

            },

            function (err) {

                console.error(
                    "summary_cards_plugin failed:",
                    err
                );

            }

        );

    }


    /* =====================================================
       UPDATE DASHBOARD CARDS
       ===================================================== */

    function updateDashboardCards(data) {


        /* =================================================
           TOTAL M/C QUANTITY
           ================================================= */

        const mcQuantity =
            data["Total M/C Quantity"];

        setKpiValue(
            "Total M/C Quantity",
            mcQuantity
        );


        /* =================================================
           TEA QTY
           ================================================= */

        const teaQty =
            data["TEA QTY"];

        setKpiValue(
            "TEA QTY",
            teaQty
        );


        /* =================================================
           REVENUE / SALES USD
           ================================================= */

        const revenue =
            data["Revenue"];

        setKpiValue(
            "Revenue",
            revenue
        );


        /* =================================================
           REVENUE LKR
           
           Revenue × EXRATE
           ================================================= */

        const exRate =
            data["EXRATE"];


        const revenueLKR =
            toNumber(revenue) *
            toNumber(exRate);


        setKpiValue(
            "RevenueLKR",
            revenueLKR
        );


        /* =================================================
           TOTAL COST
           ================================================= */

        const totalCost =
            data["Total Cost"];

        setKpiValue(
            "Total Cost",
            totalCost
        );


        /* =================================================
           TOTAL CONTRIBUTION / PROFIT
           ================================================= */

        const contribution =
            data["Total CONTRIBUTION"];

        setKpiValue(
            "Total CONTRIBUTION",
            contribution
        );


        /* =================================================
           OPTIONAL: TOTAL FCV
           ================================================= */

        const totalFCV =
            data["Total FCV"];


        console.log(
            "Total FCV:",
            totalFCV
        );


        /* =================================================
           FINAL DEBUG
           ================================================= */

        console.log(
            "Dashboard updated successfully."
        );

    }


    /* =====================================================
       SET KPI VALUE
       ===================================================== */

    function setKpiValue(
        dataName,
        value
    ) {

        const element =
            dashboard.querySelector(
                '.kpi-value[data-value="' +
                dataName +
                '"]'
            );


        if (!element) {

            console.warn(
                "KPI element not found:",
                dataName
            );

            return;

        }


        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            value = 0;

        }


        element.textContent =
            formatNumber(value);


        console.log(
            "KPI updated:",
            dataName,
            "=",
            value
        );

    }


    /* =====================================================
       CONVERT VALUE TO NUMBER
       ===================================================== */

    function toNumber(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return 0;

        }


        /*
         * Remove commas and other
         * non-numeric characters.
         */

        const cleaned =
            String(value)
                .replace(/,/g, "")
                .replace(/[^\d.-]/g, "");


        const number =
            parseFloat(cleaned);


        if (isNaN(number)) {

            return 0;

        }


        return number;

    }


    /* =====================================================
       FORMAT NUMBER
       ===================================================== */

    function formatNumber(value) {

        const number =
            toNumber(value);


        return number.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    /* =====================================================
       LOAD DATA
       ===================================================== */

    loadSummaryCards();


    /* =====================================================
       DASHBOARD READY
       ===================================================== */

    console.log(
        "Dashboard initialized successfully."
    );

});

