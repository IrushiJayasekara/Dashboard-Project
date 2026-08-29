document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       DASHBOARD INITIALIZATION
       ===================================================== */

    const dashboard =
        document.querySelector(".dashboard");


    if (!dashboard) {

        console.warn(
            "Dashboard container not found."
        );

        return;

    }

    setTimeout(function(){
 
    const cardWrapper = document.querySelector(

        '.dasboard-cards[data-card="{{cardname}}"]'

    );
 
    if(!cardWrapper) return;
 
 
    const fromDate = cardWrapper.querySelector(".from-date");

    const toDate = cardWrapper.querySelector(".to-date");

    const rangeText = cardWrapper.querySelector(".selected-range-value-text");
 
 
    /*  DEFAULT DATES */
 
    const today = new Date();
 
    const previousMonth = new Date(

        today.getFullYear(),

        today.getMonth(),

        today.getDate() - 30

    );
 
 
    function formatDateForInput(date){
 
        const year = date.getFullYear();
 
        const month = String(

            date.getMonth() + 1

        ).padStart(2,"0");
 
        const day = String(

            date.getDate()

        ).padStart(2,"0");
 
        return year + "-" + month + "-" + day;
 
    }
 
 
    /* Default: last 30 days */
 
    fromDate.value = formatDateForInput(previousMonth);

    toDate.value = formatDateForInput(today);
 
 
    /* FORMAT DISPLAY DATE */
 
    function formatDisplayDate(value){
 
        if(!value) return "";
 
        const parts = value.split("-");
 
        const date = new Date(

            Number(parts[0]),

            Number(parts[1]) - 1,

            Number(parts[2])

        );
 
        return date.toLocaleDateString(

            "en-US",

            {

                month:"short",

                day:"numeric",

                year:"numeric"

            }

        );
 
    }
 
 
    /*  UPDATE RANGE TEXT*/
 
    function updateRangeText(){
 
        if(!fromDate.value || !toDate.value){
 
            rangeText.textContent = "Select dates";
 
            return;

        }
 
 
        const from = formatDisplayDate(

            fromDate.value

        );
 
        const to = formatDisplayDate(

            toDate.value

        );
 
 
        rangeText.textContent =

            from + " – " + to;
 
    }
 
 
    /* FROM DATE CHANGE */
 
    fromDate.addEventListener(

        "change",

        function(){
 
            /* To date cannot be before From date */
 
            toDate.min = fromDate.value;
 
 
            if(

                toDate.value &&

                toDate.value < fromDate.value

            ){
 
                toDate.value = fromDate.value;
 
            }
 
 
            updateRangeText();
 
        }

    );
 
 
    /*  TO DATE CHANGE */
 
    toDate.addEventListener(

        "change",

        function(){
 
            if(

                fromDate.value &&

                toDate.value < fromDate.value

            ){
 
                alert(

                    "To Date cannot be earlier than From Date."

                );
 
                toDate.value = fromDate.value;
 
            }
 
 
            updateRangeText();
 
        }

    );
 
 
    /*  INITIAL MIN DATE */
 
    toDate.min = fromDate.value;
 
 
    /*INITIAL DISPLAY */
 
    updateRangeText();
 
 
    /*  APPLY FUNCTION */
 
    window.applyDateRange = function(){
 
        if(!fromDate.value || !toDate.value){
 
            alert(

                "Please select both From Date and To Date."

            );
 
            return;
 
        }
 
 
        if(toDate.value < fromDate.value){
 
            alert(

                "To Date cannot be earlier than From Date."

            );
 
            return;
 
        }
 
 
        const selectedFromDate =

            fromDate.value;
 
        const selectedToDate =

            toDate.value;
 
 
        /*

         * These values can later be used

         * as dashboard parameters.

         */
 
        window.dashboardFromDate =

            selectedFromDate;
 
        window.dashboardToDate =

            selectedToDate;
 
 
        updateRangeText();
 
 
        console.log(

            "From Date:",

            selectedFromDate

        );
 
        console.log(

            "To Date:",

            selectedToDate

        );
 
 
        /*

         * Custom event

         * Useful later when connecting

         * this date range to charts/cards.

         */
 
        document.dispatchEvent(

            new CustomEvent(

                "dashboardDateRangeChanged",

                {

                    detail:{

                        fromDate:selectedFromDate,

                        toDate:selectedToDate

                    }

                }

            )

        );
 
 
        /* Small visual feedback */
 
        const button =

            cardWrapper.querySelector(

                ".date-apply-btn"

            );
 
        const originalText =

            button.textContent;
 
        button.textContent =

            "Applied ✓";
 
 
        setTimeout(function(){
 
            button.textContent =

                originalText;
 
        },1500);
 
    };
 
 
    //   CLEAR FUNCTION
 
    window.clearDateRange = function(){
 
        fromDate.value = "";

        toDate.value = "";
 
        toDate.removeAttribute("min");
 
        rangeText.textContent =

            "Select dates";
 
 
        window.dashboardFromDate = null;

        window.dashboardToDate = null;
 
 
        document.dispatchEvent(

            new CustomEvent(

                "dashboardDateRangeChanged",

                {

                    detail:{

                        fromDate:null,

                        toDate:null

                    }

                }

            )

        );
 
    };
 
 
},10);
 


    /* =====================================================
       VARIABLES
       ===================================================== */

    let dashboardData = null;

    let reportLink = "";


    /* =====================================================
       GET KPI ELEMENT
       ===================================================== */

    function getKpiElement(dataName) {

        return dashboard.querySelector(
            '.kpi-value[data-value="' +
            dataName +
            '"]'
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
            getKpiElement(dataName);


        if (!element) {

            console.warn(
                "KPI element not found:",
                dataName
            );

            return;

        }


        element.textContent =
            formatNumber(value);

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
       LOAD SUMMARY CARD DATA
       ===================================================== */

    function loadSummaryCards() {

        const params = {

            adsNames: [
                "summary_cards_plugin"
            ],

            refreshCache: false,

            sqlParams: {},

            props: {

                ADS: true,

                pageno: 1,

                pagesize: 500

            }

        };


        const caller =
            (
                typeof parent !== "undefined" &&
                parent.GetDataFromAxList
            )
                ? parent
                : window;


        console.log(
            "Calling summary_cards_plugin..."
        );


        if (
            typeof caller.GetDataFromAxList !==
            "function"
        ) {

            console.error(
                "GetDataFromAxList is not available."
            );

            return;

        }


        caller.GetDataFromAxList(

            params,


            /* =================================================
               SUCCESS
               ================================================= */

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
                        typeof parsed ===
                        "string"
                    ) {

                        parsed =
                            JSON.parse(parsed);

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
                        typeof parsed.d ===
                        "string"
                    ) {

                        parsed =
                            JSON.parse(
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


                    /* =========================================
                       GET FIRST SUMMARY ROW
                       ========================================= */

                    dashboardData =
                        listRaw[0];


                    console.log(
                        "SUMMARY ROW:",
                        dashboardData
                    );


                    /* =========================================
                       GET SCAS REPORT LINK
                       ========================================= */

                    reportLink =
                        dashboardData.link ||
                        "";


                    /* =========================================
                       DEBUG DATA
                       ========================================= */

                    console.log(
                        "Name:",
                        dashboardData.name
                    );

                    console.log(
                        "Link:",
                        dashboardData.link
                    );

                    console.log(
                        "Total M/C Quantity:",
                        dashboardData[
                            "Total M/C Quantity"
                        ]
                    );

                    console.log(
                        "Total FCV:",
                        dashboardData[
                            "Total FCV"
                        ]
                    );

                    console.log(
                        "Total CONTRIBUTION:",
                        dashboardData[
                            "Total CONTRIBUTION"
                        ]
                    );

                    console.log(
                        "Total Cost:",
                        dashboardData[
                            "Total Cost"
                        ]
                    );

                    console.log(
                        "Revenue:",
                        dashboardData[
                            "Revenue"
                        ]
                    );

                    console.log(
                        "TEA QTY:",
                        dashboardData[
                            "TEA QTY"
                        ]
                    );

                    console.log(
                        "EXRATE:",
                        dashboardData[
                            "EXRATE"
                        ]
                    );


                    /* =========================================
                       UPDATE DASHBOARD
                       ========================================= */

                    updateDashboardCards(
                        dashboardData
                    );


                } catch (e) {

                    console.error(
                        "summary_cards_plugin parse failed:",
                        e
                    );

                }

            },


            /* =================================================
               ERROR
               ================================================= */

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
            data[
                "Total M/C Quantity"
            ];


        setKpiValue(
            "Total M/C Quantity",
            mcQuantity
        );


        /* =================================================
           TEA QTY
           ================================================= */

        const teaQty =
            data[
                "TEA QTY"
            ];


        setKpiValue(
            "TEA QTY",
            teaQty
        );


        /* =================================================
           SALES VALUE
           
           Original logic:
           
           LKR = Revenue
           USD = Total FCV
           
           ================================================= */

        updateCurrency("LKR");


        /* =================================================
           TOTAL COST
           ================================================= */

        const totalCost =
            data[
                "Total Cost"
            ];


        setKpiValue(
            "Total Cost",
            totalCost
        );


        /* =================================================
           TOTAL PROFIT / LOSS
           ================================================= */

        const contribution =
            data[
                "Total CONTRIBUTION"
            ];


        setKpiValue(
            "Total CONTRIBUTION",
            contribution
        );


        /* =================================================
           TOTAL FCV
           ================================================= */

        const totalFCV =
            data[
                "Total FCV"
            ];


        console.log(
            "Total FCV:",
            totalFCV
        );


        console.log(
            "Dashboard updated successfully."
        );

    }


    /* =====================================================
       UPDATE CURRENCY
       ===================================================== */

    function updateCurrency(currency) {

        if (!dashboardData) {

            return;

        }


        const salesValue =
            getKpiElement(
                "Sales Value"
            );


        const totalCost =
            getKpiElement(
                "Total Cost"
            );


        const contribution =
            getKpiElement(
                "Total CONTRIBUTION"
            );


        const lkrButton =
            dashboard.querySelector(
                '[data-currency="LKR"]'
            );


        const usdButton =
            dashboard.querySelector(
                '[data-currency="USD"]'
            );


        /* =================================================
           VALUES
           ================================================= */

        const revenue =
            toNumber(
                dashboardData[
                    "Revenue"
                ]
            );


        const totalFCV =
            toNumber(
                dashboardData[
                    "Total FCV"
                ]
            );


        const totalCostLKR =
            toNumber(
                dashboardData[
                    "Total Cost"
                ]
            );


        const contributionLKR =
            toNumber(
                dashboardData[
                    "Total CONTRIBUTION"
                ]
            );


        const exchangeRate =
            toNumber(
                dashboardData[
                    "EXRATE"
                ]
            ) || 1;


        const totalCostUSD =
            totalCostLKR /
            exchangeRate;


        const contributionUSD =
            contributionLKR /
            exchangeRate;


        /* =================================================
           USD
           ================================================= */

        if (currency === "USD") {


            /*
             * Sales Value
             *
             * Same logic as your original code:
             * Total FCV
             */

            if (salesValue) {

                salesValue.textContent =
                    formatNumber(
                        totalFCV
                    );

            }


            /*
             * Total Cost
             */

            if (totalCost) {

                totalCost.textContent =
                    formatNumber(
                        totalCostUSD
                    );

            }


            /*
             * Profit / Loss
             */

            if (contribution) {

                contribution.textContent =
                    formatNumber(
                        contributionUSD
                    );

            }


            /* Active button */

            if (usdButton) {

                usdButton.classList.add(
                    "active"
                );

            }


            if (lkrButton) {

                lkrButton.classList.remove(
                    "active"
                );

            }

        }


        /* =================================================
           LKR
           ================================================= */

        else {


            /*
             * Sales Value
             */

            if (salesValue) {

                salesValue.textContent =
                    formatNumber(
                        revenue
                    );

            }


            /*
             * Total Cost
             */

            if (totalCost) {

                totalCost.textContent =
                    formatNumber(
                        totalCostLKR
                    );

            }


            /*
             * Profit / Loss
             */

            if (contribution) {

                contribution.textContent =
                    formatNumber(
                        contributionLKR
                    );

            }


            /* Active button */

            if (lkrButton) {

                lkrButton.classList.add(
                    "active"
                );

            }


            if (usdButton) {

                usdButton.classList.remove(
                    "active"
                );

            }

        }

    }


    /* =====================================================
       CURRENCY BUTTONS
       ===================================================== */

    const currencyButtons =
        dashboard.querySelectorAll(
            ".currency-option"
        );


    currencyButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const currency =
                        button.dataset.currency;


                    updateCurrency(
                        currency
                    );

                }
            );

        }
    );


    /* =====================================================
       SCAS REPORT
       ===================================================== */

    const scasCard =
        dashboard.querySelector(
            '[data-kpi="scas-report"]'
        );


    if (scasCard) {

        scasCard.addEventListener(
            "click",
            function () {

                if (!reportLink) {

                    console.warn(
                        "SCAS Report link not available."
                    );

                    return;

                }


                console.log(
                    "Opening SCAS Report:",
                    reportLink
                );


                /*
                 * Uses the same Axpert
                 * navigation method as your
                 * original code.
                 */

                if (
                    typeof navigateToUrl ===
                    "function"
                ) {

                    navigateToUrl(
                        reportLink
                    );

                } else {

                    window.open(
                        reportLink,
                        "_blank"
                    );

                }

            }
        );

    }


    /* =====================================================
       KPI CARD HOVER
       ===================================================== */

    const kpiCards =
        dashboard.querySelectorAll(
            ".kpi-card"
        );


    kpiCards.forEach(
        function (card) {

            card.addEventListener(
                "mouseenter",
                function () {

                    card.classList.add(
                        "active"
                    );

                }
            );


            card.addEventListener(
                "mouseleave",
                function () {

                    card.classList.remove(
                        "active"
                    );

                }
            );

        }
    );


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

