document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       DASHBOARD ELEMENTS
       ========================================================= */

    const dashboard = document.querySelector(".dashboard");

    if (!dashboard) {
        console.error("Dashboard element not found.");
        return;
    }


    /* =========================================================
       DATE RANGE ELEMENTS
       ========================================================= */

    const fromDate = document.querySelector(".from-date");
    const toDate = document.querySelector(".to-date");
    const rangeText = document.querySelector(".selected-range-value-text");


    /* =========================================================
       DATE FUNCTIONS
       ========================================================= */

    function formatDateForInput(date) {

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }


    function formatDisplayDate(dateString) {

        if (!dateString) {
            return "";
        }

        const parts = dateString.split("-");

        if (parts.length !== 3) {
            return dateString;
        }

        return parts[2] + "/" + parts[1] + "/" + parts[0];
    }


    function updateRangeText() {

        if (!fromDate || !toDate || !rangeText) {
            return;
        }

        if (fromDate.value && toDate.value) {

            rangeText.textContent =
                formatDisplayDate(fromDate.value) +
                " → " +
                formatDisplayDate(toDate.value);

        } else {

            rangeText.textContent = "Select dates";
        }
    }


    /* =========================================================
       DEFAULT DATE RANGE
       Last 30 days
       ========================================================= */

    if (fromDate && toDate && rangeText) {

        const today = new Date();

        const previousMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 30
        );

        if (!fromDate.value) {
            fromDate.value = formatDateForInput(previousMonth);
        }

        if (!toDate.value) {
            toDate.value = formatDateForInput(today);
        }

        toDate.min = fromDate.value;

        updateRangeText();


        /* =====================================================
           FROM DATE CHANGE
           ===================================================== */

        fromDate.addEventListener("change", function () {

            if (!fromDate.value) {
                toDate.removeAttribute("min");
                updateRangeText();
                return;
            }

            toDate.min = fromDate.value;

            if (
                toDate.value &&
                toDate.value < fromDate.value
            ) {
                toDate.value = fromDate.value;
            }

            updateRangeText();
        });


        /* =====================================================
           TO DATE CHANGE
           ===================================================== */

        toDate.addEventListener("change", function () {

            if (
                fromDate.value &&
                toDate.value &&
                toDate.value < fromDate.value
            ) {

                alert("To Date cannot be earlier than From Date.");

                toDate.value = fromDate.value;
            }

            updateRangeText();
        });
    }


    /* =========================================================
       APPLY DATE RANGE
       ========================================================= */

    window.applyDateRange = function () {

        if (!fromDate || !toDate) {
            return;
        }

        const selectedFromDate = fromDate.value;
        const selectedToDate = toDate.value;

        if (!selectedFromDate || !selectedToDate) {

            alert("Please select both From Date and To Date.");
            return;
        }


        if (selectedToDate < selectedFromDate) {

            alert("To Date cannot be earlier than From Date.");
            return;
        }


        /* Store globally */
        window.dashboardFromDate = selectedFromDate;
        window.dashboardToDate = selectedToDate;


        /* Update displayed range */
        updateRangeText();

   /* New COde for clickable changes */
/* =========================================================
   COST COMPOSITION LEGEND CLICK TOGGLE
   ---------------------------------------------------------
   ADDITIVE MODIFICATION ONLY
   Does not change:
   - Axpert data loading
   - Date range
   - Chart data
   - Existing chart rendering
   - Existing connected parameters
   ========================================================= */

(function enableCostCompositionLegendToggle() {

    const legend =
        document.getElementById(
            "costCompositionLegend"
        );

    if (!legend) {
        return;
    }


    /* =====================================================
       CLICK EVENT
       Event delegation is used because the legend is
       recreated dynamically every time the chart loads.
       ===================================================== */

    legend.addEventListener(
        "click",
        function (event) {

            const row =
                event.target.closest(
                    ".cost-legend-row"
                );


            if (!row) {
                return;
            }


            /* =================================================
               GET CHART
               ================================================= */

            const chartContainer =
                document.getElementById(
                    "costCompositionChart"
                );


            if (
                !chartContainer ||
                typeof Highcharts === "undefined"
            ) {
                return;
            }


            const chart =
                Highcharts.charts.find(
                    function (chart) {

                        return (
                            chart &&
                            chart.renderTo ===
                                chartContainer
                        );
                    }
                );


            if (!chart) {
                return;
            }


            /* =================================================
               GET PIE SERIES
               ================================================= */

            if (
                !chart.series ||
                !chart.series[0]
            ) {
                return;
            }


            const series =
                chart.series[0];


            /* =================================================
               FIND WHICH LEGEND ROW WAS CLICKED
               ================================================= */

            const rows =
                Array.from(
                    legend.querySelectorAll(
                        ".cost-legend-row"
                    )
                );


            const rowIndex =
                rows.indexOf(row);


            if (rowIndex < 0) {
                return;
            }


            const point =
                series.points[rowIndex];


            if (!point) {
                return;
            }


            /* =================================================
               TOGGLE PIE POINT
               ================================================= */

            const isVisible =
                point.visible !== false;


            point.setVisible(
                !isVisible,
                true
            );


            /* =================================================
               UPDATE DISABLED STYLE
               ================================================= */

            if (isVisible) {

                row.classList.add(
                    "cost-legend-disabled"
                );

            } else {

                row.classList.remove(
                    "cost-legend-disabled"
                );
            }


            /* =================================================
               CALCULATE TOTAL OF VISIBLE ITEMS
               ================================================= */

            let visibleTotal = 0;


            series.points.forEach(
                function (chartPoint) {

                    if (
                        chartPoint.visible !== false
                    ) {

                        visibleTotal +=
                            toNumber(
                                chartPoint.y
                            );
                    }
                }
            );


            /* =================================================
               UPDATE ALL LEGEND PERCENTAGES
               ================================================= */

            rows.forEach(
                function (legendRow, index) {

                    const legendPoint =
                        series.points[index];


                    if (!legendPoint) {
                        return;
                    }


                    const valueElement =
                        legendRow.querySelector(
                            ".cost-legend-value"
                        );


                    const percentElement =
                        legendRow.querySelector(
                            ".cost-legend-percent"
                        );


                    /* -----------------------------------------
                       Hidden item
                       ----------------------------------------- */

                    if (
                        legendPoint.visible === false
                    ) {

                        if (percentElement) {

                            percentElement.textContent =
                                "0.0%";
                        }

                        legendRow.classList.add(
                            "cost-legend-disabled"
                        );

                        return;
                    }


                    /* -----------------------------------------
                       Visible item
                       ----------------------------------------- */

                    const percentage =
                        visibleTotal > 0
                            ? (
                                legendPoint.y /
                                visibleTotal *
                                100
                            )
                            : 0;


                    if (percentElement) {

                        percentElement.textContent =
                            Highcharts.numberFormat(
                                percentage,
                                1
                            ) + "%";
                    }


                    legendRow.classList.remove(
                        "cost-legend-disabled"
                    );
                }
            );

        }
    );

})();   


        /* =====================================================
           DATE RANGE CHANGE EVENT
           ===================================================== */

        document.dispatchEvent(
            new CustomEvent("dashboardDateRangeChanged", {
                detail: {
                    fromDate: selectedFromDate,
                    toDate: selectedToDate
                }
            })
        );


        /* =====================================================
           BUTTON FEEDBACK
           ===================================================== */

        const button = document.querySelector(".date-apply-btn");

        if (button) {

            const originalText = button.textContent;

            button.textContent = "Applied ✓";

            setTimeout(function () {
                button.textContent = originalText;
            }, 1500);
        }
    };


    /* =========================================================
       CLEAR DATE RANGE
       ========================================================= */

    window.clearDateRange = function () {

        if (!fromDate || !toDate) {
            return;
        }


        fromDate.value = "";
        toDate.value = "";

        toDate.removeAttribute("min");


        if (rangeText) {
            rangeText.textContent = "Select dates";
        }


        /* Clear global values */
        window.dashboardFromDate = null;
        window.dashboardToDate = null;


        /* =====================================================
           DATE RANGE CLEAR EVENT
           ===================================================== */

        document.dispatchEvent(
            new CustomEvent("dashboardDateRangeChanged", {
                detail: {
                    fromDate: null,
                    toDate: null
                }
            })
        );


        /* =====================================================
           BUTTON FEEDBACK
           ===================================================== */

        const button = document.querySelector(".date-clear-btn");

        if (button) {

            const originalText = button.textContent;

            button.textContent = "Cleared ✓";

            setTimeout(function () {
                button.textContent = originalText;
            }, 1500);
        }
    };


    /* =========================================================
       DASHBOARD DATA
       ========================================================= */

    let dashboardData = null;
    let reportLink = "";


    /* =========================================================
       KPI ELEMENT
       ========================================================= */

    function getKpiElement(dataName) {

        return document.querySelector(
            '.kpi-value[data-value="' + dataName + '"]'
        );
    }


    /* =========================================================
       SET KPI VALUE
       ========================================================= */

    function setKpiValue(dataName, value) {

        const element = getKpiElement(dataName);

        if (!element) {
            return;
        }

        element.textContent = value;
    }


    /* =========================================================
       NUMBER CONVERSION
       ========================================================= */

    function toNumber(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return 0;
        }

        if (typeof value === "number") {
            return value;
        }

        const cleanedValue = String(value)
            .replace(/,/g, "")
            .replace(/%/g, "")
            .trim();

        const numberValue = Number(cleanedValue);

        return isNaN(numberValue) ? 0 : numberValue;
    }


    /* =========================================================
       NUMBER FORMAT
       ========================================================= */

    function formatNumber(value, decimals) {

        const numberValue = toNumber(value);

        return numberValue.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }


    /* =========================================================
       LOAD SUMMARY CARDS
       ========================================================= */

    function loadSummaryCards() {
      
          /* =====================================================
       GET SELECTED DATE RANGE
       ===================================================== */

    const dateFromElement =
        document.querySelector(".from-date");

    const dateToElement =
        document.querySelector(".to-date");


    if (
        !dateFromElement ||
        !dateToElement
    ) {

        console.error(
            "Summary card date elements not found."
        );

        return;
    }


    const rawFromDate =
        dateFromElement.value;

    const rawToDate =
        dateToElement.value;


    if (
        !rawFromDate ||
        !rawToDate
    ) {

        console.warn(
            "Summary cards require a valid date range."
        );

        return;
    }


    /* =====================================================
       FORMAT DATE
       yyyy-mm-dd → mm/dd/yyyy
       ===================================================== */

/* =====================================================
   FORMAT DATE FOR SUMMARY CARD DATA SOURCE
   -----------------------------------------------------
   HTML date:
   yyyy-mm-dd

   Data source expects:
   mm/dd/yy
   ===================================================== */

const fromParts =
    rawFromDate.split("-");

const toParts =
    rawToDate.split("-");


const fdate =
    fromParts.length === 3
        ? fromParts[1] + "/" +
          fromParts[2] + "/" +
          fromParts[0]
        : rawFromDate;


const todate =
    toParts.length === 3
        ? toParts[1] + "/" +
          toParts[2] + "/" +
          toParts[0]
        : rawToDate;
      
      
/* =====================================================
   SUMMARY CARD DATE DEBUG
   ===================================================== */

console.log("========================================");
console.log("SUMMARY CARD DATE DEBUG");
console.log("========================================");

console.log(
    "Raw From Date:",
    rawFromDate
);

console.log(
    "Raw To Date:",
    rawToDate
);

console.log(
    "Formatted fdate:",
    fdate
);

console.log(
    "Formatted todate:",
    todate
);

console.log(
    "Expected format: mm/dd/yy"
);

console.log("========================================");

    console.log(
        "Summary Card From Date:",
        fdate
    );

    console.log(
        "Summary Card To Date:",
        todate
    );

        if (
            typeof GetDataFromAxList !== "function" &&
            !(
                typeof parent !== "undefined" &&
                typeof parent.GetDataFromAxList === "function"
            )
        ) {

            console.error(
                "GetDataFromAxList function is not available."
            );

            return;
        }


const params = {

    adsNames: [
        "summary_card_with_daterange"
    ],

    refreshCache: false,

    sqlParams: {
        fdate: fdate,
        todate: todate
    },

            props: {
                ADS: true,
                pageno: 1,
                pagesize: 500
            }
        };
      
      
      /* =====================================================
   AXPERT SUMMARY CARD PARAMETER DEBUG
   ===================================================== */

console.log("========================================");
console.log("SUMMARY CARD AXPERT PARAMETERS");
console.log("=================================");

console.log(
    "Data Source:",
    params.adsNames[0]
);

console.log(
    "fdate sent:",
    params.sqlParams.fdate
);

console.log(
    "todate sent:",
    params.sqlParams.todate
);

console.log(
    "Full sqlParams:",
    params.sqlParams
);

console.log(
    "Full params:",
    params
);

console.log("========================================");


        const caller =
            (
                typeof parent !== "undefined" &&
                typeof parent.GetDataFromAxList === "function"
            )
                ? parent
                : window;


        try {

            caller.GetDataFromAxList(
                params,
                function (response) {
        console.log("========================================");
        console.log("SUMMARY CARD RAW RESPONSE");
        console.log("========================================");
        console.log("Raw response:", response);
        console.log("Response type:", typeof response);
                  
                    try {

                        let parsed = response;
                      console.log("Parsed response BEFORE parsing:", parsed);


                        /* -----------------------------------------
                           Parse string response
                           ----------------------------------------- */

                        if (typeof parsed === "string") {

                            parsed = JSON.parse(parsed);
                        }


                        /* -----------------------------------------
                           Parse d property
                           ----------------------------------------- */

                        if (
                            parsed &&
                            typeof parsed.d === "string"
                        ) {

                            parsed.d = JSON.parse(parsed.d);
                        }


                        /* -----------------------------------------
                           Extract result data
                           ----------------------------------------- */

                        let resultData = [];


                        if (
                            parsed &&
                            parsed.result &&
                            Array.isArray(parsed.result.data)
                        ) {

                            parsed.result.data.forEach(function (item) {

                                if (
                                    item &&
                                    Array.isArray(item.data)
                                ) {

                                    resultData =
                                        resultData.concat(item.data);

                                } else if (item) {

                                    resultData.push(item);
                                }
                            });
                        }


                        /* -----------------------------------------
                           Fallback data formats
                           ----------------------------------------- */

                        if (
                            resultData.length === 0 &&
                            parsed &&
                            Array.isArray(parsed.data)
                        ) {

                            resultData = parsed.data;
                        }


                        if (resultData.length === 0) {

                            console.warn(
                                "No summary card data returned."
                            );

                            return;
                        }

                      console.log("========================================");
console.log("SUMMARY CARD RESULT DATA");
console.log("========================================");
console.log("resultData:", resultData);
console.log("Number of rows:", resultData.length);
console.log("First row:", resultData[0]);
console.log(
    "First row keys:",
    Object.keys(resultData[0])
);
console.log("========================================");

                        dashboardData = resultData[0];


                        /* -----------------------------------------
                           Report link
                           ----------------------------------------- */

                      reportLink =
    dashboardData["link"] ||
    dashboardData["Link"] ||
    "";

const reportName =
    dashboardData["name"] ||
    dashboardData["Name"] ||
    "SCAS Report";


console.log(
    "SCAS Report Name:",
    reportName
);

console.log(
    "SCAS Report Link:",
    reportLink
);


                        /* -----------------------------------------
                           Update cards
                           ----------------------------------------- */

                        updateDashboardCards(
                            dashboardData
                        );

                    } catch (error) {

                        console.error(
                            "Error processing summary card response:",
                            error
                        );
                    }
                }
            );

        } catch (error) {

            console.error(
                "Error loading summary cards:",
                error
            );
        }
    }

  
  /* =========================================================
   GET SUMMARY VALUE
   ---------------------------------------------------------
   Handles exact/lowercase Axpert field names
   ========================================================= */

function getSummaryValue(item, fieldName) {

    if (!item) {
        return 0;
    }


    /* Exact match */
    if (
        item[fieldName] !== undefined &&
        item[fieldName] !== null &&
        item[fieldName] !== ""
    ) {

        return item[fieldName];
    }


    /* Case-insensitive match */
    const target =
        fieldName.toLowerCase();


    const key =
        Object.keys(item).find(
            function (itemKey) {

                return (
                    itemKey.toLowerCase() === target
                );
            }
        );


    if (key) {

        console.log(
            "Summary field matched:",
            fieldName,
            "→",
            key,
            "=",
            item[key]
        );

        return item[key];
    }


    console.warn(
        "Summary field not found:",
        fieldName,
        "Available fields:",
        Object.keys(item)
    );


    return 0;
}


    /* =========================================================
       UPDATE DASHBOARD CARDS
       ========================================================= */

    function updateDashboardCards(item) {

    if (!item) {
        console.warn(
            "updateDashboardCards: item is empty."
        );
        return;
    }


    console.log(
        "Updating summary cards with:",
        item
    );


    /* =====================================================
       TOTAL M/C QUANTITY
       ===================================================== */

    setKpiValue(
        "Total M/C Quantity",
        formatNumber(
            getSummaryValue(
                item,
                "Total M/C Quantity"
            ),
            0
        )
    );


    /* =====================================================
       TEA QTY
       ===================================================== */

    setKpiValue(
        "TEA QTY",
        formatNumber(
            getSummaryValue(
                item,
                "TEA QTY"
            ),
            0
        )
    );


    /* =====================================================
       SALES / COST / CONTRIBUTION
       ===================================================== */

    updateCurrency("LKR");
}


    /* =========================================================
       CURRENCY UPDATE
       ========================================================= */

    function updateCurrency(currency) {

        if (!dashboardData) {
            return;
        }


  /* =====================================================
   SALES
   ===================================================== */

let salesValue =
    toNumber(
        dashboardData["Revenue"]
    );


if (currency === "USD") {

    const exchangeRate =
        toNumber(
            dashboardData["EXRATE"]
        );

    if (exchangeRate > 0) {

        salesValue =
            salesValue / exchangeRate;
    }
}   
        setKpiValue(
            "Sales Value",
            formatNumber(
                salesValue,
                2
            )
        );


        /* =====================================================
           TOTAL COST
           ===================================================== */

        let totalCost =
            toNumber(
                dashboardData["Total Cost"]
            );


        if (currency === "USD") {

            const exchangeRate =
                toNumber(
                    dashboardData["EXRATE"]
                );

            if (exchangeRate > 0) {

                totalCost =
                    totalCost / exchangeRate;
            }
        }


        setKpiValue(
            "Total Cost",
            formatNumber(
                totalCost,
                2
            )
        );


        /* =====================================================
           TOTAL CONTRIBUTION
           ===================================================== */

        let contribution =
            toNumber(
                dashboardData["Total CONTRIBUTION"]
            );


        if (currency === "USD") {

            const exchangeRate =
                toNumber(
                    dashboardData["EXRATE"]
                );

            if (exchangeRate > 0) {

                contribution =
                    contribution / exchangeRate;
            }
        }


        setKpiValue(
            "Total CONTRIBUTION",
            formatNumber(
                contribution,
                2
            )
        );


        /* =====================================================
           UPDATE CURRENCY BUTTONS
           ===================================================== */

        document
            .querySelectorAll(".currency-option")
            .forEach(function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.currency === currency
                );
            });
    }


    /* =========================================================
       CURRENCY BUTTON EVENTS
       ========================================================= */

    document
        .querySelectorAll(".currency-option")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const currency =
                        this.dataset.currency;

                    updateCurrency(currency);
                }
            );
        });


    /* =========================================================
       SCAS REPORT
       ========================================================= */

/* =========================================================
   SCAS REPORT
   ========================================================= */

const scasCard =
    document.querySelector(
        '[data-kpi="scas-report"]'
    );


if (scasCard) {

    scasCard.addEventListener(
        "click",
        function () {

            if (!reportLink) {

                console.warn(
                    "SCAS report link is not available."
                );

                return;
            }


            console.log(
                "Opening SCAS Report:",
                reportLink
            );


            /* =================================================
               AXPERT NAVIGATION
               ================================================= */

            if (
                typeof navigateToUrl === "function"
            ) {

                navigateToUrl(
                    reportLink
                );

                return;
            }


            if (
                typeof parent !== "undefined" &&
                typeof parent.navigateToUrl === "function"
            ) {

                parent.navigateToUrl(
                    reportLink
                );

                return;
            }


            console.error(
                "navigateToUrl function is not available."
            );
        }
    );
}


    /* =========================================================
       KPI HOVER
       ========================================================= */

    document
        .querySelectorAll(".kpi-card")
        .forEach(function (card) {

            card.addEventListener(
                "mouseenter",
                function () {

                    this.classList.add("active");
                }
            );


            card.addEventListener(
                "mouseleave",
                function () {

                    this.classList.remove("active");
                }
            );
        });


    /* =========================================================
       COST COMPOSITION CHART
       ========================================================= */

    const costCompositionColors = [
        "#00A88A",
        "#3B82F6",
        "#F59E0B",
        "#8B5CF6",
        "#EF4444",
        "#14B8A6",
        "#EC4899",
        "#6366F1"
    ];


    /* =========================================================
       GET COST VALUE
       ========================================================= */

    function getCostCompositionValue(
        data,
        fieldName
    ) {

        if (!data || !data[0]) {
            return 0;
        }

        return toNumber(
            data[0][fieldName]
        );
    }


    /* =========================================================
       CLEAR COST CHART
       ========================================================= */

    function clearCostCompositionChart() {

        const chartContainer =
            document.getElementById(
                "costCompositionChart"
            );

        const legend =
            document.getElementById(
                "costCompositionLegend"
            );


        /* -----------------------------------------
           Destroy existing Highcharts instance
           ----------------------------------------- */

        if (
            typeof Highcharts !== "undefined" &&
            chartContainer
        ) {

            const existingChart =
                Highcharts.charts.find(function (chart) {

                    return (
                        chart &&
                        chart.renderTo === chartContainer
                    );
                });


            if (existingChart) {

                existingChart.destroy();
            }
        }


        if (chartContainer) {

            chartContainer.innerHTML = "";
        }


        if (legend) {

            legend.innerHTML = "";
        }
    }


    /* =========================================================
       LOAD COST COMPOSITION CHART
       ========================================================= */

    function loadCostCompositionChart() {

        const chartContainer =
            document.getElementById(
                "costCompositionChart"
            );


        if (!chartContainer) {

            console.error(
                "Cost composition chart container not found."
            );

            return;
        }


        /* =====================================================
           CHECK HIGHCHARTS
           ===================================================== */

        if (
            typeof Highcharts === "undefined"
        ) {

            console.error(
                "Highcharts library is not loaded."
            );

            return;
        }


        /* =====================================================
           GET DATES
           ===================================================== */

        const dateFromElement =
            document.querySelector(
                ".from-date"
            );

        const dateToElement =
            document.querySelector(
                ".to-date"
            );


        if (
            !dateFromElement ||
            !dateToElement
        ) {

            console.error(
                "Date range elements not found."
            );

            return;
        }


/*change date */
      
      const rawFromDate = dateFromElement.value;
const rawToDate = dateToElement.value;

// Convert yyyy-mm-dd → mm/dd/yyyy
function formatCostChartDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const parts = dateValue.split("-");

    if (parts.length !== 3) {
        return dateValue;
    }

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    return month + "/" + day + "/" + year;
}

const fdate = formatCostChartDate(rawFromDate);
const todate = formatCostChartDate(rawToDate);
      
      
      
      console.log("=== COST CHART DATE DEBUG ===");
console.log("Selected From Date:", fdate);
console.log("Selected To Date:", todate);


        /* =====================================================
           VALIDATE DATES
           ===================================================== */

        if (!fdate || !todate) {

            clearCostCompositionChart();

            return;
        }


        console.log(
            "Loading cost composition:",
            fdate,
            todate
        );


        /* =====================================================
           AXPERT PARAMETERS
           ===================================================== */

        const params = {

            adsNames: [
                "summary_cards_plugin_daterange"
            ],

            refreshCache: false,

            sqlParams: {
                fdate: fdate,
                todate: todate
            },

            props: {
                ADS: true,
                pageno: 1,
                pagesize: 500
            }
        };

      
      /* DEBUG */
console.log("=== AXPERT PARAMS ===");
console.log("adsNames:", params.adsNames);
console.log("sqlParams:", params.sqlParams);
console.log("fdate sent:", params.sqlParams.fdate);
console.log("todate sent:", params.sqlParams.todate);
console.log("Full params:", params);
      

        const caller =
            (
                typeof parent !== "undefined" &&
                typeof parent.GetDataFromAxList === "function"
            )
                ? parent
                : window;


        if (
            typeof caller.GetDataFromAxList !==
            "function"
        ) {

            console.error(
                "GetDataFromAxList function is not available."
            );

            return;
        }


        try {

            caller.GetDataFromAxList(
                params,
                function (response) {

                    try {

                        let parsed = response;


                        /* -----------------------------------------
                           Parse string response
                           ----------------------------------------- */

                        if (
                            typeof parsed === "string"
                        ) {

                            parsed =
                                JSON.parse(parsed);
                        }


                        /* -----------------------------------------
                           Parse d property
                           ----------------------------------------- */

                        if (
                            parsed &&
                            typeof parsed.d === "string"
                        ) {

                            parsed.d =
                                JSON.parse(parsed.d);
                        }


                        /* -----------------------------------------
                           Extract data
                           ----------------------------------------- */

                        let resultData = [];


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

                                        resultData =
                                            resultData.concat(
                                                item.data
                                            );

                                    } else if (item) {

                                        resultData.push(
                                            item
                                        );
                                    }
                                }
                            );
                        }


                        /* -----------------------------------------
                           Fallback
                           ----------------------------------------- */

                        if (
                            resultData.length === 0 &&
                            parsed &&
                            Array.isArray(
                                parsed.data
                            )
                        ) {

                            resultData =
                                parsed.data;
                        }


                        if (
                            resultData.length === 0
                        ) {

                            console.warn(
                                "No cost composition data returned."
                            );

                            clearCostCompositionChart();

                            return;
                        }


                        console.log(
                            "Cost composition data:",
                            resultData
                        );


                        /* =================================================
                           BUILD CHART DATA
                           ================================================= */

                        const item =
                            resultData[0];


                        const fields = [

                            {
                                name: "Tea Cost",
                                field: "Tea Cost"
                            },

                            {
                                name: "PACK MATERIAL",
                                field: "PACK MATERIAL"
                            },

                            {
                                name: "INFUSION",
                                field: "INFUSION"
                            },

                            {
                                name: "BLEND EXP",
                                field: "BLEND EXP"
                            },

                            {
                                name: "SHIP EXP",
                                field: "SHIP EXP"
                            },

                            {
                                name: "Transport",
                                field: "Transport"
                            },

                            {
                                name: "INSURANCE",
                                field: "INSURANCE"
                            },

                            {
                                name: "FUMIGATION",
                                field: "FUMIGATION"
                            }
                        ];


                        const chartData = [];


                        fields.forEach(
                            function (field) {

                                const value =
                                    toNumber(
                                        item[field.field]
                                    );


                                if (value > 0) {

                                    chartData.push({

                                        name: field.name,

                                        y: value
                                    });
                                }
                            }
                        );


                        /* =================================================
                           TOTAL COST
                           ================================================= */

                        const totalCost =
                            toNumber(
                                item["Total Cost"]
                            );


                        /* =================================================
                           RENDER
                           ================================================= */

                        renderCostCompositionChart(
                            chartData,
                            totalCost
                        );

                    } catch (error) {

                        console.error(
                            "Error processing cost composition response:",
                            error
                        );

                        clearCostCompositionChart();
                    }
                }
            );

        } catch (error) {

            console.error(
                "Error loading cost composition:",
                error
            );

            clearCostCompositionChart();
        }
    }


    /* =========================================================
       RENDER COST COMPOSITION CHART
       ========================================================= */

    function renderCostCompositionChart(
        chartData,
        totalCost
    ) {

        const chartContainer =
            document.getElementById(
                "costCompositionChart"
            );


        const legend =
            document.getElementById(
                "costCompositionLegend"
            );


        if (!chartContainer) {
            return;
        }


        if (!legend) {
            return;
        }


        /* =====================================================
           CLEAR OLD CONTENT
           ===================================================== */

        clearCostCompositionChart();


        if (
            !chartData ||
            chartData.length === 0
        ) {

            chartContainer.innerHTML =
                '<div style="text-align:center;padding:40px;color:#888;">' +
                "No cost data available" +
                "</div>";

            return;
        }


        /* =====================================================
           HIGHCHARTS DONUT
           ===================================================== */

        const chart =
            Highcharts.chart(
                chartContainer,
                {

                    chart: {

                        type: "pie",

                        backgroundColor:
                            "transparent",

                        height: 330,

                        spacing: [
                            0,
                            0,
                            0,
                            0
                        ]
                    },


                    title: {
                        text: null
                    },


                    credits: {
                        enabled: false
                    },


                    exporting: {
                        enabled: false
                    },


                    tooltip: {

                        useHTML: true,

                        backgroundColor:
                            "#ffffff",

                        borderWidth: 1,

                        shadow: true,


                        formatter: function () {

                            return (
                                "<b>" +
                                this.point.name +
                                "</b>" +
                                Highcharts.numberFormat(
                                    this.y,
                                    2
                                ) +
                                " M" +
                                Highcharts.numberFormat(
                                    this.percentage,
                                    1
                                ) +
                                "%"
                            );
                        }
                    },


                    plotOptions: {

                        pie: {

                            innerSize: "58%",

                            size: "86%",

                            center: [
                                "50%",
                                "50%"
                            ],

                            borderWidth: 2,

                            borderColor: "#ffffff",

                            dataLabels: {
                                enabled: false
                            },

                            showInLegend: false,

                            allowPointSelect: false,

                            animation: true
                        }
                    },


                    series: [

                        {

                            name: "Cost",

                            data: chartData,

                            colors:
                                costCompositionColors
                        }
                    ]
                }
            );


        /* =====================================================
           CENTER TOTAL
           ===================================================== */

        addCostCompositionCenterText(
            chart,
            totalCost
        );


        /* =====================================================
           CUSTOM LEGEND
           ===================================================== */

        renderCostCompositionLegend(
            chartData,
            totalCost
        );
    }


    /* =========================================================
       ADD CENTER TEXT
       ========================================================= */

    function addCostCompositionCenterText(
        chart,
        totalCost
    ) {

        if (!chart) {
            return;
        }


        const centerGroup =
            chart.renderer
                .g("cost-center-group")
                .add();


        const totalLabel =
            chart.renderer
                .text(
                    "Total Cost",
                    0,
                    0
                )
                .css({

                    fontSize: "13px",

                    fontWeight: "500",

                    color: "#6b7280"
                })
                .add(centerGroup);


        const totalValue =
            chart.renderer
                .text(
                    Highcharts.numberFormat(
                        totalCost,
                        2
                    ) + " M",
                    0,
                    0
                )
                .css({

                    fontSize: "20px",

                    fontWeight: "700",

                    color: "#111827"
                })
                .add(centerGroup);


        function positionCenterText() {

            const centerX =
                chart.plotLeft +
                chart.plotWidth / 2;


            const centerY =
                chart.plotTop +
                chart.plotHeight / 2;


            const labelBox =
                totalLabel.getBBox();

            const valueBox =
                totalValue.getBBox();


            totalLabel.attr({

                x:
                    centerX -
                    labelBox.width / 2,

                y:
                    centerY - 4
            });


            totalValue.attr({

                x:
                    centerX -
                    valueBox.width / 2,

                y:
                    centerY + 20
            });
        }


        positionCenterText();


        Highcharts.addEvent(
            chart,
            "redraw",
            function () {

                positionCenterText();
            }
        );
    }


    /* =========================================================
       CUSTOM LEGEND
       ========================================================= */

    function renderCostCompositionLegend(
        chartData,
        totalCost
    ) {

        const legend =
            document.getElementById(
                "costCompositionLegend"
            );


        if (!legend) {
            return;
        }


        legend.innerHTML = "";


        chartData.forEach(
            function (item, index) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "cost-legend-row";


                const left =
                    document.createElement(
                        "div"
                    );


                left.className =
                    "cost-legend-left";


                const dot =
                    document.createElement(
                        "span"
                    );


                dot.className =
                    "cost-legend-dot";


                dot.style.backgroundColor =
                    costCompositionColors[
                        index %
                        costCompositionColors.length
                    ];


                const name =
                    document.createElement(
                        "span"
                    );


                name.className =
                    "cost-legend-name";


                name.textContent =
                    item.name;


                left.appendChild(dot);
                left.appendChild(name);


                const right =
                    document.createElement(
                        "div"
                    );


                right.className =
                    "cost-legend-right";


                const value =
                    document.createElement(
                        "span"
                    );


                value.className =
                    "cost-legend-value";


                value.textContent =
                    Highcharts.numberFormat(
                        item.y,
                        2
                    ) + " M";


                const percentage =
                    totalCost > 0
                        ? (
                            item.y /
                            totalCost *
                            100
                        )
                        : 0;


                const percent =
                    document.createElement(
                        "span"
                    );


                percent.className =
                    "cost-legend-percent";


                percent.textContent =
                    Highcharts.numberFormat(
                        percentage,
                        1
                    ) + "%";


                right.appendChild(value);
                right.appendChild(percent);


                row.appendChild(left);
                row.appendChild(right);


                legend.appendChild(row);
            }
        );
    }

  
  /* =========================================================
   REVENUE VS COST VS CONTRIBUTION BY BUYER
   ---------------------------------------------------------
   NEW ADDITIVE CHART
   Does not modify:
   - KPI cards
   - Cost Composition chart
   - Existing date range functions
   - Existing currency functions
   ========================================================= */


/* =========================================================
   CLEAR BUYER PERFORMANCE CHART
   ========================================================= */

function clearBuyerPerformanceChart() {

    const container =
        document.getElementById(
            "buyerPerformanceChart"
        );


    if (!container) {
        return;
    }


    /* -----------------------------------------
       Destroy existing Highcharts instance
       ----------------------------------------- */

    if (
        typeof Highcharts !== "undefined"
    ) {

        const existingChart =
            Highcharts.charts.find(
                function (chart) {

                    return (
                        chart &&
                        chart.renderTo === container
                    );
                }
            );


        if (existingChart) {

            existingChart.destroy();
        }
    }


    container.innerHTML = "";
}


/* =========================================================
   EXTRACT AXPERT RESPONSE DATA
   ---------------------------------------------------------
   Uses the same response structure already used
   by your existing Cost Composition chart.
   ========================================================= */

function extractBuyerPerformanceData(response) {

    let parsed = response;


    /* -----------------------------------------
       Parse string response
       ----------------------------------------- */

    if (
        typeof parsed === "string"
    ) {

        try {

            parsed =
                JSON.parse(parsed);

        } catch (error) {

            console.error(
                "Unable to parse buyer chart response:",
                error
            );

            return [];
        }
    }


    /* -----------------------------------------
       Parse d property
       ----------------------------------------- */

    if (
        parsed &&
        typeof parsed.d === "string"
    ) {

        try {

            parsed.d =
                JSON.parse(parsed.d);

        } catch (error) {

            console.error(
                "Unable to parse buyer chart d property:",
                error
            );
        }
    }


    /* -----------------------------------------
       Extract result data
       ----------------------------------------- */

    let resultData = [];


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

                    resultData =
                        resultData.concat(
                            item.data
                        );

                } else if (item) {

                    resultData.push(item);
                }
            }
        );
    }


    /* -----------------------------------------
       Fallback
       ----------------------------------------- */

    if (
        resultData.length === 0 &&
        parsed &&
        Array.isArray(
            parsed.data
        )
    ) {

        resultData =
            parsed.data;
    }


    return resultData;
}


/* =========================================================
   LOAD ONE BUYER DATA SOURCE
   ========================================================= */

function loadBuyerPerformanceDataSource(
    adsName,
    fromDate,
    toDate
) {

    return new Promise(
        function (resolve) {

            const params = {

                adsNames: [
                    adsName
                ],

                refreshCache: false,

                sqlParams: {

                    fdate:
                        formatBuyerChartDate(
                            fromDate
                        ),

                    todate:
                        formatBuyerChartDate(
                            toDate
                        )
                },

                props: {

                    ADS: true,

                    pageno: 1,

                    pagesize: 5000
                }
            };


            const caller =
                (
                    typeof parent !== "undefined" &&
                    typeof parent.GetDataFromAxList === "function"
                )
                    ? parent
                    : window;


            if (
                !caller ||
                typeof caller.GetDataFromAxList !==
                    "function"
            ) {

                console.error(
                    "GetDataFromAxList is not available for:",
                    adsName
                );

                resolve([]);

                return;
            }


            console.log(
                "Loading buyer data source:",
                adsName,
                params.sqlParams
            );


            try {

                caller.GetDataFromAxList(
                    params,
                    function (response) {

                        const data =
                            extractBuyerPerformanceData(
                                response
                            );


                        console.log(
                            "Buyer source result:",
                            adsName,
                            data
                        );


                        resolve(data);
                    }
                );

            } catch (error) {

                console.error(
                    "Error loading buyer data source:",
                    adsName,
                    error
                );

                resolve([]);
            }
        }
    );
}


/* =========================================================
   FORMAT DATE FOR BUYER CHART
   ---------------------------------------------------------
   yyyy-mm-dd → mm/dd/yyyy
   ========================================================= */

function formatBuyerChartDate(
    dateValue
) {

    if (!dateValue) {
        return "";
    }


    const parts =
        dateValue.split("-");


    if (parts.length !== 3) {
        return dateValue;
    }


    const year =
        parts[0];

    const month =
        parts[1];

    const day =
        parts[2];


    return (
        month +
        "/" +
        day +
        "/" +
        year
    );
}


/* =========================================================
   GET CATEGORY FROM SOURCE ROW
   ========================================================= */

function getBuyerCategory(row) {

    if (!row) {
        return "";
    }


    return String(
        row["Category"] ??
        row["category"] ??
        ""
    ).trim();
}


/* =========================================================
   AGGREGATE BUYER DATA
   ---------------------------------------------------------
   Example:

   CUSTOMER020  444.84
   CUSTOMER020  407.93
   CUSTOMER020  234.90

   becomes:

   CUSTOMER020  1087.67
   ========================================================= */

function aggregateBuyerValues(
    data,
    valueFields
) {

    const totals = {};


    if (!Array.isArray(data)) {
        return totals;
    }


    data.forEach(
        function (row) {

            const category =
                getBuyerCategory(row);


            if (!category) {
                return;
            }


            /* -----------------------------------------
               Find the value field
               ----------------------------------------- */

            let value = 0;


            for (
                let i = 0;
                i < valueFields.length;
                i++
            ) {

                const field =
                    valueFields[i];


                if (
                    row[field] !==
                    undefined &&
                    row[field] !==
                    null &&
                    row[field] !== ""
                ) {

                    value =
                        toNumber(
                            row[field]
                        );

                    break;
                }
            }


            /* -----------------------------------------
               Add to customer total
               ----------------------------------------- */

            if (
                !Object.prototype.hasOwnProperty.call(
                    totals,
                    category
                )
            ) {

                totals[category] = 0;
            }


            totals[category] += value;
        }
    );


    return totals;
}


/* =========================================================
   LOAD REVENUE VS COST VS CONTRIBUTION
   ========================================================= */

function loadBuyerPerformanceChart() {

    const chartContainer =
        document.getElementById(
            "buyerPerformanceChart"
        );


    if (!chartContainer) {

        console.error(
            "Buyer performance chart container not found."
        );

        return;
    }


    if (
        typeof Highcharts ===
        "undefined"
    ) {

        console.error(
            "Highcharts is not loaded."
        );

        return;
    }


    /* =====================================================
       GET SELECTED DATES
       ===================================================== */

    const dateFromElement =
        document.querySelector(
            ".from-date"
        );

    const dateToElement =
        document.querySelector(
            ".to-date"
        );


    if (
        !dateFromElement ||
        !dateToElement
    ) {

        console.error(
            "Buyer chart date elements not found."
        );

        return;
    }


    const rawFromDate =
        dateFromElement.value;

    const rawToDate =
        dateToElement.value;


    if (
        !rawFromDate ||
        !rawToDate
    ) {

        clearBuyerPerformanceChart();

        return;
    }


    console.log(
        "===================================="
    );

    console.log(
        "BUYER PERFORMANCE CHART"
    );

    console.log(
        "From:",
        rawFromDate
    );

    console.log(
        "To:",
        rawToDate
    );


    /* =====================================================
       DATA SOURCE NAMES
       ===================================================== */

    const revenueSource =
        "rev_cost_contrib_revenuedb";

    const costSource =
        "rev_cost_contrib_costdb";

    const contributionSource =
        "rev_cost_contrib_contrbdb";


    /* =====================================================
       LOAD ALL THREE DATA SOURCES
       ===================================================== */

    Promise.all([

        loadBuyerPerformanceDataSource(
            revenueSource,
            rawFromDate,
            rawToDate
        ),

        loadBuyerPerformanceDataSource(
            costSource,
            rawFromDate,
            rawToDate
        ),

        loadBuyerPerformanceDataSource(
            contributionSource,
            rawFromDate,
            rawToDate
        )

    ])
    .then(
        function (results) {

            const revenueData =
                results[0];

            const costData =
                results[1];

            const contributionData =
                results[2];


            console.log(
                "Revenue raw data:",
                revenueData
            );

            console.log(
                "Cost raw data:",
                costData
            );

            console.log(
                "Contribution raw data:",
                contributionData
            );


            /* =================================================
               AGGREGATE REVENUE
               ================================================= */

            const revenueTotals =
                aggregateBuyerValues(
                    revenueData,
                    [
                        "Revenue",
                        "Total Revenue",
                        "Sales Value"
                    ]
                );


            /* =================================================
               AGGREGATE COST
               ================================================= */

            const costTotals =
                aggregateBuyerValues(
                    costData,
                    [
                        "Total Cost",
                        "Cost"
                    ]
                );


            /* =================================================
               AGGREGATE CONTRIBUTION
               ================================================= */

            const contributionTotals =
                aggregateBuyerValues(
                    contributionData,
                    [
                        "Contribution",
                        "Total CONTRIBUTION",
                        "Profit/Loss"
                    ]
                );


            console.log(
                "Aggregated Revenue:",
                revenueTotals
            );

            console.log(
                "Aggregated Cost:",
                costTotals
            );

            console.log(
                "Aggregated Contribution:",
                contributionTotals
            );


            /* =================================================
               TOP 6 REVENUE CUSTOMERS
               ================================================= */

            const top6Customers =
                Object.keys(
                    revenueTotals
                )
                .map(
                    function (customer) {

                        return {

                            customer:
                                customer,

                            revenue:
                                revenueTotals[
                                    customer
                                ]
                        };
                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            b.revenue -
                            a.revenue
                        );
                    }
                )
                .slice(
                    0,
                    6
                );


            console.log(
                "TOP 6 REVENUE CUSTOMERS:",
                top6Customers
            );


            /* =================================================
               BUILD FINAL CHART DATA
               ================================================= */

            const categories = [];

            const revenueValues = [];

            const costValues = [];

            const contributionValues = [];


            top6Customers.forEach(
                function (item) {

                    const customer =
                        item.customer;


                    categories.push(
                        customer
                    );


                    revenueValues.push(
                        item.revenue
                    );


                    costValues.push(
                        costTotals[
                            customer
                        ] || 0
                    );


                    contributionValues.push(
                        contributionTotals[
                            customer
                        ] || 0
                    );
                }
            );


            console.log(
                "Final buyer categories:",
                categories
            );

            console.log(
                "Final revenue values:",
                revenueValues
            );

            console.log(
                "Final cost values:",
                costValues
            );

            console.log(
                "Final contribution values:",
                contributionValues
            );


            /* =================================================
               NO DATA
               ================================================= */

            if (
                categories.length === 0
            ) {

                clearBuyerPerformanceChart();


                chartContainer.innerHTML =
                    '<div style="' +
                    'text-align:center;' +
                    'padding:120px 20px;' +
                    'color:#888;' +
                    'font-size:14px;' +
                    '">' +
                    "No revenue data available" +
                    "</div>";


                return;
            }


            /* =================================================
               RENDER
               ================================================= */

            renderBuyerPerformanceChart(
                categories,
                revenueValues,
                costValues,
                contributionValues
            );
        }
    )
    .catch(
        function (error) {

            console.error(
                "Error loading buyer performance chart:",
                error
            );

            clearBuyerPerformanceChart();
        }
    );
}


/* =========================================================
   RENDER BUYER PERFORMANCE CHART
   ========================================================= */

function renderBuyerPerformanceChart(
    categories,
    revenueValues,
    costValues,
    contributionValues
) {

    const chartContainer =
        document.getElementById(
            "buyerPerformanceChart"
        );


    if (!chartContainer) {
        return;
    }


    clearBuyerPerformanceChart();


    /* =====================================================
       HIGHCHARTS COLUMN CHART
       ===================================================== */

    Highcharts.chart(
        chartContainer,
        {

            chart: {

                type: "column",

                backgroundColor:
                    "transparent",

                height: 410,

                spacing: [
                    10,
                    0,
                    0,
                    0
                ]
            },


            title: {
                text: null
            },


            credits: {
                enabled: false
            },


            exporting: {
                enabled: false
            },


            xAxis: {

                categories:
                    categories,

                lineColor:
                    "#d1d5db",

                tickColor:
                    "#d1d5db",

                labels: {

                    style: {

                        color:
                            "#374151",

                        fontSize:
                            "11px"
                    }
                }
            },


            yAxis: {

                min: 0,

                title: {
                    text: null
                },

                gridLineColor:
                    "#e5e7eb",

                labels: {

                    style: {

                        color:
                            "#64748b",

                        fontSize:
                            "11px"
                    },

                    formatter:
                        function () {

                            return Highcharts.numberFormat(
                                this.value,
                                0
                            );
                        }
                }
            },


            legend: {

                enabled: true,

                align: "center",

                verticalAlign: "top",

                itemStyle: {

                    fontSize:
                        "11px",

                    fontWeight:
                        "500",

                    color:
                        "#374151"
                },

                symbolRadius: 0
            },


            tooltip: {

                shared: true,

                useHTML: true,

                backgroundColor:
                    "#ffffff",

                borderColor:
                    "#d1d5db",

                borderWidth: 1,

                shadow: true,

                formatter:
                    function () {

                        let html =
                            "<div style='" +
                            "font-size:12px;" +
                            "font-weight:600;" +
                            "margin-bottom:6px;" +
                            "'>" +
                            this.x +
                            "</div>";


                        this.points.forEach(
                            function (point) {

                                html +=
                                    "<div style='" +
                                    "font-size:12px;" +
                                    "line-height:20px;" +
                                    "'>" +
                                    "<span style='" +
                                    "color:" +
                                    point.color +
                                    "'>●</span> " +
                                    point.series.name +
                                    ": <b>" +
                                    Highcharts.numberFormat(
                                        point.y,
                                        2
                                    ) +
                                    "</b>" +
                                    "</div>";
                            }
                        );


                        return html;
                    }
            },


            plotOptions: {

                column: {

                    borderWidth: 0,

                    borderRadius: 3,

                    pointPadding:
                        0.08,

                    groupPadding:
                        0.12,

                    dataLabels: {

                        enabled: false
                    }
                },

                series: {

                    animation: true
                }
            },


            series: [

                {

                    name:
                        "Sales Value",

                    data:
                        revenueValues,

                    color:
                        "#2563EB"
                },

                {

                    name:
                        "Total Cost",

                    data:
                        costValues,

                    color:
                        "#F59E0B"
                },

                {

                    name:
                        "Profit/Loss",

                    data:
                        contributionValues,

                    color:
                        "#16A34A"
                }
            ]
        }
    );
}

    /* =========================================================
       DATE RANGE CHANGE EVENT
       ========================================================= */

  document.addEventListener(
    "dashboardDateRangeChanged",
    function (event) {

        console.log(
            "Dashboard date event:",
            event.detail
        );


        if (
            !event.detail ||
            !event.detail.fromDate ||
            !event.detail.toDate
        ) {

            /* Existing chart */
            clearCostCompositionChart();


            /* New buyer chart */
            clearBuyerPerformanceChart();


            return;
        }

        /* =====================================================
           SUMMARY CARDS
           -----------------------------------------------------
           Reload using selected date range
           ===================================================== */

        loadSummaryCards();
        /* =====================================================
           EXISTING COST COMPOSITION CHART
           ===================================================== */

        loadCostCompositionChart();


        /* =====================================================
           NEW REVENUE VS COST VS CONTRIBUTION CHART
           ===================================================== */

        loadBuyerPerformanceChart();
    }
);

/* =========================================================
   INITIAL LOAD
   ========================================================= */

loadSummaryCards();

loadCostCompositionChart();

loadBuyerPerformanceChart();


    /* =========================================================
       INITIALIZATION COMPLETE
       ========================================================= */

    console.log(
        "Dashboard initialized successfully."
    );

});















