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
             */

        });

    });


    /* =====================================================
       GET USERNAME
       ===================================================== */

    let currentUsername = "";

    try {

        if (typeof username !== "undefined") {
            currentUsername = username;
        }

    } catch (e) {

        console.warn("Username not available.");

    }


    /* =====================================================
       LOAD SUMMARY CARD DATA
       ===================================================== */

    function loadSummaryCardData() {

        try {

            /*
             * Get Axpert caller
             */

            const caller =
                (typeof parent !== "undefined" &&
                 typeof parent.AxGetSqlData === "function")
                    ? parent
                    : window;


            /*
             * Call Axpert data source
             */

            const resultStr = caller.AxGetSqlData(
                "summary_cards_plugin",
                {
                   
                }
            );


            console.log(
                "summary_cards_plugin raw response:",
                resultStr
            );


            /*
             * Parse response
             */

            const parsed =
                typeof resultStr === "string"
                    ? JSON.parse(resultStr)
                    : resultStr;


            console.log(
                "summary_cards_plugin parsed response:",
                parsed
            );


            /*
             * Validate response
             */

            if (
                !parsed ||
                !parsed.result ||
                !parsed.result[0] ||
                !parsed.result[0].result
            ) {

                console.error(
                    "Invalid response from summary_cards_plugin."
                );

                return;
            }


            /*
             * Get rows
             */

            const rows =
                parsed.result[0].result.row;


            console.log(
                "summary_cards_plugin rows:",
                rows
            );


            if (!rows || rows.length === 0) {

                console.warn(
                    "No data returned from summary_cards_plugin."
                );

                return;
            }


            /* =================================================
               GET FIRST SUMMARY ROW
               ================================================= */

            const data = rows[0];


            console.log(
                "Summary data row:",
                data
            );


            /* =================================================
               GET DATA SOURCE VALUES
               ================================================= */

            const totalMCQuantity =
                getDataValue(
                    data,
                    "Total M/C Quantity"
                );


            const totalFCV =
                getDataValue(
                    data,
                    "Total FCV"
                );


            const totalContribution =
                getDataValue(
                    data,
                    "Total CONTRIBUTION"
                );


            const totalCost =
                getDataValue(
                    data,
                    "Total Cost"
                );


            const revenue =
                getDataValue(
                    data,
                    "Revenue"
                );


            const teaQty =
                getDataValue(
                    data,
                    "TEA QTY"
                );


            const exRate =
                getDataValue(
                    data,
                    "EXRATE"
                );


            /* =================================================
               CONSOLE CHECK
               ================================================= */

            console.log(
                "Total M/C Quantity:",
                totalMCQuantity
            );

            console.log(
                "Total FCV:",
                totalFCV
            );

            console.log(
                "Total CONTRIBUTION:",
                totalContribution
            );

            console.log(
                "Total Cost:",
                totalCost
            );

            console.log(
                "Revenue:",
                revenue
            );

            console.log(
                "TEA QTY:",
                teaQty
            );

            console.log(
                "EXRATE:",
                exRate
            );


            /* =================================================
               UPDATE KPI CARDS
               ================================================= */

            updateKpiCard(
                "Total M/C Quantity",
                totalMCQuantity
            );

            updateKpiCard(
                "Total FCV",
                totalFCV
            );

            updateKpiCard(
                "Total CONTRIBUTION",
                totalContribution
            );

            updateKpiCard(
                "Total Cost",
                totalCost
            );

            updateKpiCard(
                "Revenue",
                revenue
            );

            updateKpiCard(
                "TEA QTY",
                teaQty
            );

            updateKpiCard(
                "EXRATE",
                exRate
            );


            console.log(
                "Summary card values updated successfully."
            );

        } catch (error) {

            console.error(
                "Error loading summary_cards_plugin:",
                error
            );

        }

    }


    /* =====================================================
       GET VALUE FROM DATA SOURCE
       ===================================================== */

    function getDataValue(data, columnName) {

        if (
            data &&
            Object.prototype.hasOwnProperty.call(
                data,
                columnName
            )
        ) {

            const value = data[columnName];

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return "0";

            }

            return value;

        }

        console.warn(
            "Column not found in data source:",
            columnName
        );

        return "0";

    }


    /* =====================================================
       UPDATE KPI CARD
       ===================================================== */

    function updateKpiCard(titleText, value) {

        const cards =
            dashboard.querySelectorAll(".kpi-card");


        cards.forEach(function (card) {

            const title =
                card.querySelector(".kpi-title");


            if (!title) {
                return;
            }


            const cardTitle =
                title.textContent.trim();


            /*
             * Match KPI title with data source column
             */

            if (
                cardTitle.toLowerCase() ===
                titleText.toLowerCase()
            ) {

                /*
                 * Try common value element names.
                 */

                let valueElement =
                    card.querySelector(".kpi-value");


                if (!valueElement) {

                    valueElement =
                        card.querySelector(".kpi-number");

                }


                if (!valueElement) {

                    valueElement =
                        card.querySelector(".kpi-amount");

                }


                if (!valueElement) {

                    valueElement =
                        card.querySelector(".value");

                }


                if (!valueElement) {

                    /*
                     * Find element inside the card
                     * that is not the title.
                     */

                    const elements =
                        card.querySelectorAll(
                            "span, div, p"
                        );


                    for (
                        let i = 0;
                        i < elements.length;
                        i++
                    ) {

                        if (
                            !elements[i].classList.contains(
                                "kpi-title"
                            )
                        ) {

                            valueElement =
                                elements[i];

                            break;

                        }

                    }

                }


                if (valueElement) {

                    valueElement.textContent =
                        formatValue(value);

                    console.log(
                        "Updated:",
                        titleText,
                        "=",
                        value
                    );

                } else {

                    console.warn(
                        "Value element not found for:",
                        titleText
                    );

                }

            }

        });

    }


    /* =====================================================
       FORMAT VALUE
       ===================================================== */

    function formatValue(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "0";

        }


        /*
         * Keep existing formatted strings
         */

        if (typeof value === "string") {

            const trimmed =
                value.trim();


            if (trimmed === "") {
                return "0";
            }


            /*
             * If value is already formatted,
             * return it as it is.
             */

            if (
                trimmed.indexOf(",") !== -1 ||
                trimmed.indexOf("%") !== -1
            ) {

                return trimmed;

            }

        }


        /*
         * Format numeric values
         */

        const numericValue =
            Number(value);


        if (!isNaN(numericValue)) {

            return numericValue.toLocaleString(
                "en-US",
                {
                    maximumFractionDigits: 2
                }
            );

        }


        return value;

    }


    /* =====================================================
       LOAD DATA
       ===================================================== */

    loadSummaryCardData();


    /* =====================================================
       DASHBOARD READY
       ===================================================== */

    console.log(
        "Dashboard initialized successfully."
    );

});