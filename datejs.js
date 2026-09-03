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
                typeof parent.GetDataFromAxList === "function"
            )
                ? parent
                : window;


        try {

            caller.GetDataFromAxList(
                params,
                function (response) {

                    try {

                        let parsed = response;


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


                        dashboardData = resultData[0];


                        /* -----------------------------------------
                           Report link
                           ----------------------------------------- */

                        reportLink =
                            dashboardData.link || "";


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
       UPDATE DASHBOARD CARDS
       ========================================================= */

    function updateDashboardCards(item) {

        if (!item) {
            return;
        }


        /* =====================================================
           TOTAL M/C QUANTITY
           ===================================================== */

        setKpiValue(
            "Total M/C Quantity",
            formatNumber(
                item["Total M/C Quantity"],
                0
            )
        );


        /* =====================================================
           TEA QTY
           ===================================================== */

        setKpiValue(
            "TEA QTY",
            formatNumber(
                item["TEA QTY"],
                0
            )
        );


        /* =====================================================
           SALES VALUE
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

        let salesValue = 0;


        if (currency === "USD") {

            salesValue =
                toNumber(
                    dashboardData["Total FCV"]
                );

        } else {

            salesValue =
                toNumber(
                    dashboardData["Revenue"]
                );
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


                if (
                    typeof navigateToUrl === "function"
                ) {

                    navigateToUrl(reportLink);

                } else {

                    window.open(
                        reportLink,
                        "_blank"
                    );
                }
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


        const fdate =
            dateFromElement.value;

        const todate =
            dateToElement.value;


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
       DATE RANGE CHANGE EVENT
       ========================================================= */

    document.addEventListener(
        "dashboardDateRangeChanged",
        function (event) {

            console.log(
                "Cost chart date event:",
                event.detail
            );


            if (
                !event.detail ||
                !event.detail.fromDate ||
                !event.detail.toDate
            ) {

                clearCostCompositionChart();

                return;
            }


            loadCostCompositionChart();
        }
    );


    /* =========================================================
       INITIAL LOAD
       ========================================================= */

    loadSummaryCards();

    loadCostCompositionChart();


    /* =========================================================
       INITIALIZATION COMPLETE
       ========================================================= */

    console.log(
        "Dashboard initialized successfully."
    );

});



