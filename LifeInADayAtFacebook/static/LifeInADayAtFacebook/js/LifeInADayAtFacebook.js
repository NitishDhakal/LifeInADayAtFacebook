/**
 * Created by Nitish Dhakal on 10/17/2016.
 */
'use strict';
function lifeInADayAtFacebook() {
    var margin = {
            top: 20,
            bottom: 20,
            left: 20,
            right: 20
        },
        dimension = {
            bottomChart: 145,//145 default
            navigationChartHeight: 70,
            playButtonDiameter: 60,
            frontDateDisplay: 40,
            dailyStatBarchartHeight: 200,
            dailyStatBarchartWidth: 200,
            latencyBetweenPostElementWidth: 140,
            widthInteractiveLineChart: 160,
            heightInteractiveLineChart: 20
        },
        dailyTimeStatsData = [0, 0, 0, 0, 0, 0],
        dailyTimeStatsPercentData = [0, 0, 0, 0, 0, 0],

        /*
         The time duration has been divided into 6 different parts
         {
         time_00_04:0,
         time_04_08:0,
         time_08_12:0,
         time_12_16:0,
         time_16_20:0,
         time_20_00:0
         },
         */
        version = "1.0.0",
        chartTitle = '',
        chartData = [],
        startDate,
        endDate,
        timeBeforeAfterStartDate = 1000 * 60 * 60 * 5, //go 6 hr before and after the start date
        svgHeight = 800,
        svgWidth = 600,
        halt = true,
        forward = false,
        debug = false,
        cycleStart = false,
        forwardSpeed = 500,
        selection,
        slidingTimeValue = 0,
        forwardSlider = false,
        buttonGroup,
        restart = false,
        interval,
        startTimeView,
        endTimeView,
        timeScale,
        mainAxis,
        mainAxisGroup,
        intervalNav,
        startTimeNav,
        endTimeNav,
        xScale,
        navigationXAxis,
        navigationXAxisGroup,
        viewport, navigationViewRect,
        displayDailyStats = true,
        displayLineChart = true,
        dailyStats,
        barchart,
        dateBucket = [],
        postPadding = 60,
        postWidth = 550,
        postHeight = 180,
        individualPostSectionHeight = 115,
        userName = 'Nitish Dhakal',
        resetChart,
        latencyBetweenPost,
        postCount = 0,
        lineChartFxn,
        toolTipLatencyText = "Latency between the interactions shows the average time period between any two interactions. ",
        barChartColorRange = ["#062f4f", "#54afdb", "#33FFBD", "#f58632", "#f9be02", "#8c8d8f"];


    /*******************Line Chart Starts************************/
    function generateLineChartInteractions() {
        var widthInteractiveLineChart = dimension.widthInteractiveLineChart,
            heightInteractiveLineChart = dimension.heightInteractiveLineChart,
            padding = 30,
            xScaleLineChart,
            yScaleLineChart,
            yDomainDailyStats = [''],
            fontFamilyDailyStatsText = "sans-serif",
            fontSizeDailyStatsText = "12px",
            fontfillDailyStatsText = "white",
            textAnchorDailyStatsText = "middle",
            wholeChartInteractionData,
            individualDataForLine,
            movingLine,
            selectedElement,
            updateMovingLine,
            mainChartOnMove,
            startDateLineChart = startDate,
            endDateLineChart = endDate
            , lineChartXAxis,
            toolTipLineChartText = "This chart shows the instances of the interactions over the specified dates. White dots shows interactions while the empty spaces are the latencies.",
            lineChartXAxisGroup, dataPoints, displayTitle = false;


        var lineChartInteractions = function (selection) {
            if (selection === 'undefined') {
                console.log("selection is undefined");
                return;
            }
            selectedElement = selection;
            //set the scales
            xScaleLineChart = d3.time.scale()
                .range([0, widthInteractiveLineChart]) //scale time across width
                .domain([startDateLineChart, endDateLineChart])

            yScaleLineChart = d3.scale.ordinal()
                .range([heightInteractiveLineChart, 0])
                .domain([yDomainDailyStats])

            // Add the scatterplot
            dataPoints = selection.append("g")
                .attr("class", "datapointsLineChart");

            dataPoints.selectAll("rect")
                .data(wholeChartInteractionData)
                .attr("class", "movingLineInLineChart")
                .enter().append("rect")
                .attr("width", 0.5)
                .attr("height", heightInteractiveLineChart)
                .attr("x", function (d) {
                    var createdTime;
                    createdTime = d.created_time;
                    return xScaleLineChart(new Date(createdTime));
                })
                .attr("y", function (d) {
                    return 1;
                })


            //define axis and its group
            lineChartXAxis = d3.svg.axis()
                .orient("bottom")
                .tickFormat(d3.time.format('%y/%m/%d'))
                .tickValues(xScaleLineChart.domain())

            // var lineChartYAxis = d3.svg.axis().scale(yScaleLineChart).orient("left");

            lineChartXAxisGroup = selection.append("g")
                .attr("class", "interactiveLineAxis")
                .attr("transform", "translate(0," + heightInteractiveLineChart + ")")
                .call(lineChartXAxis)

            lineChartXAxis.scale(xScaleLineChart)(lineChartXAxisGroup);


            // var dateTicks = lineChartXAxisGroup.selectAll(".tick");
            // //Since some ticks were coliding I used the technique as provided on https://groups.google.com/forum/#!topic/d3-js/oVbg5HkAoH4
            // //The following technique uses  .getBoundingRect() method to detect whether the tick was colliding with its neighbors and removes them
            // for (var j = 0; j < dateTicks[0].length; j++) {
            //     var c = dateTicks[0][j],
            //         n = dateTicks[0][j + 1];
            //     if (!c || !n || !c.getBoundingClientRect || !n.getBoundingClientRect)
            //         continue;
            //     while (c.getBoundingClientRect().right > n.getBoundingClientRect().left) {
            //         d3.select(n).remove();
            //         j++;
            //         n = dateTicks[0][j + 1];
            //         if (!n)
            //             break;
            //     }
            // }

            // add group for y axis
            //  var lineChartYAxisGroup = selection.append("g")
            //    .attr("class", "navigationYAxis")
            //    .call(lineChartYAxis);


//add the tool tip to this

            //Add tooltips 2 these chart titles
            var tooltipLineChart = d3.select("body")
                .append("div")
                .attr("class", "tooltip lineChart header")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .text(toolTipLineChartText);


            var tooltipGroupLineChart = selection
                .append("g").attr("fill", "white")
                .attr("transform", "translate(" + eval(widthInteractiveLineChart + 20) + "," + eval(heightInteractiveLineChart / 2) + ")");

            tooltipGroupLineChart.append("circle")
                .attr("class", "tooltip1")
                .attr("stroke", "none")
                .attr("r", 10)
                .on("mouseover", function () {
                    d3.select(this).attr("stroke", "white")
                    return tooltipLineChart.style("visibility", "visible");
                })
                .on("mousemove", function () {
                    d3.select(this).attr("stroke", "white")
                    return tooltipLineChart.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke", "none")
                    return tooltipLineChart.style("visibility", "hidden");
                });

            tooltipGroupLineChart.append("text")
                .attr("y", "4")
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "white")
                .text("?");
            if (displayTitle) {
                selection.append("text")
                    .attr("class", "lineChartTitle")
                    .attr("x", widthInteractiveLineChart / 2)
                    .attr("y", eval(heightInteractiveLineChart + 40))
                    .attr("text-anchor", "middle")
                    .style("font-size", "12px")
                    .attr("fill", "black")
                    .style("text-decoration", "underline")
                    .text("Interaction Instance with respect to Date Intervals");
            }

            return lineChartInteractions;
        }

        lineChartInteractions.wholeChartInteractionData = function (arg) {
            if (arguments.length == 0)
                return wholeChartInteractionData;
            wholeChartInteractionData = arg;
            return lineChartInteractions;
        }
        lineChartInteractions.widthDailyStats = function (arg) {
            if (arguments.length == 0)
                return individualDataForLine;
            individualDataForLine = arg;
            return lineChartInteractions;
        }
        lineChartInteractions.widthInteractiveLineChart = function (arg) {
            if (arguments.length == 0)
                return widthInteractiveLineChart;
            widthInteractiveLineChart = arg;
            return lineChartInteractions;
        }
        lineChartInteractions.heightInteractiveLineChart = function (arg) {
            if (arguments.length == 0)
                return heightInteractiveLineChart;
            heightInteractiveLineChart = arg;
            return lineChartInteractions;
        }

        lineChartInteractions.updateMovingLine = function (arg) {
            if (arguments.length == 0)
                return lineChartInteractions;
            movingLine.attr("x", xScaleLineChart(arg))
            return lineChartInteractions;
        }

        lineChartInteractions.startDateLineChart = function (arg) {
            if (arguments.length == 0)
                return startDateLineChart;
            startDateLineChart = arg;
            return lineChartInteractions;
        }

        lineChartInteractions.endDateLineChart = function (arg) {
            if (arguments.length == 0)
                return endDateLineChart;
            endDateLineChart = arg;
            return lineChartInteractions;
        }
        lineChartInteractions.mainChartOnMove = function () {
            //remove older rectangle instances
            dataPoints.selectAll("rect").remove();
            dataPoints.selectAll("circle").remove();
            //add the line
            movingLine = selectedElement.append("rect")
                .attr("class", "movingLineInLineChart")
                .attr("x", xScaleLineChart.range[0])
                .attr("y", 1)
                .attr("width", 0.5)
                .attr("height", heightInteractiveLineChart)

            //reset the moving line
            movingLine.attr("x", xScaleLineChart(startDateLineChart))
            //add the circles
            dataPoints.selectAll("circle")
                .data(wholeChartInteractionData)
                .enter()
                .append("circle")
                .attr("r", 1)
                .attr("cx", function (d) {
                    var createdTime;
                    createdTime = d.created_time;
                    return xScaleLineChart(new Date(createdTime));
                })
                .attr("cy", function (d) {
                    return yScaleLineChart("Line Chart Instance");
                })


        }

        lineChartInteractions.reset = function () {
            //reset the x axis
            xScaleLineChart.domain([startDateLineChart, endDateLineChart]);
            lineChartXAxisGroup.selectAll(".tick").remove();
            lineChartXAxis.tickFormat(d3.time.format('%y/%m/%d'))
                .tickValues(xScaleLineChart.domain())
            lineChartXAxis.scale(xScaleLineChart)(lineChartXAxisGroup);
            movingLine.remove()
            // var dateTicks = lineChartXAxisGroup.selectAll(".tick");
            // //Since some ticks were coliding I used the technique as provided on https://groups.google.com/forum/#!topic/d3-js/oVbg5HkAoH4
            // //The following technique uses  .getBoundingRect() method to detect whether the tick was colliding with its neighbors and removes them
            // for (var j = 0; j < dateTicks[0].length; j++) {
            //     var c = dateTicks[0][j],
            //         n = dateTicks[0][j + 1];
            //     if (!c || !n || !c.getBoundingClientRect || !n.getBoundingClientRect)
            //         continue;
            //     while (c.getBoundingClientRect().right > n.getBoundingClientRect().left) {
            //         d3.select(n).remove();
            //         j++;
            //         n = dateTicks[0][j + 1];
            //         if (!n)
            //             break;
            //     }
            // }
            //remove older cirlce and rectanle  instances
            dataPoints.selectAll("circle").remove();
            dataPoints.selectAll("rect").remove();

            dataPoints.selectAll("rect")
                .data(wholeChartInteractionData)
                .attr("class", "movingLineInLineChart")
                .enter().append("rect")
                .attr("width", 0.5)
                .attr("height", heightInteractiveLineChart)
                .attr("x", function (d) {
                    var createdTime;
                    createdTime = d.created_time;
                    return xScaleLineChart(new Date(createdTime));
                })
                .attr("y", function (d) {
                    return 1;
                })


        }


        return lineChartInteractions;

    }


    /*******************Line Chart Ends************************/


    /*******************Daily Stats Bar charting Starts************************/

    function generateDailyStats() {

        var widthDailyStats = dimension.dailyStatBarchartWidth,
            heightDailyStats = dimension.dailyStatBarchartHeight,
            padding = 30,
            yDomainDailyStats = ['00:00 AM - 4:00 AM', '04:00 AM - 8:00 AM', '08:00 AM- 12:00 PM', '12:00 PM - 16:00 PM', '16:00 PM- 20:00 PM', '20:00 PM - 00:00 AM'],
            fontFamilyDailyStatsText = "sans-serif",
            fontSizeDailyStatsText = "12px",
            fontfillDailyStatsText = "white",
            textAnchorDailyStatsText = "middle",
            rectangles, svgBlock,
            yScaleDailyStats,
            xScaleDailyStats,
            yAxis, axisGroup,
            barChartColorMap,
            toolTipDailyStatsText = "This chart shows the average percentage of interactions done within the selected date." +
                "When the chart starts moving this chart gradually shows the average percentage of interaction day after day until the final selected date";


        var barchart = function (selection) {
            if (selection === 'undefined') {
                console.log("selection is undefined");
                return;
            }
            //generate color scale for bar charts
            barChartColorMap = d3.scale.ordinal()
                .domain(yDomainDailyStats)
                .range(barChartColorRange);
            svgBlock = selection.append("g")
                .attr("class", "svgDailyStats")
                .attr("width", widthDailyStats)
                .attr("height", heightDailyStats);

            yScaleDailyStats = d3.scale.ordinal()
                .domain(yDomainDailyStats)
                .rangeRoundBands([padding, heightDailyStats - padding], 0.05);

            xScaleDailyStats = d3.scale.linear()
                .domain([0, d3.max(dailyTimeStatsPercentData, function (d) {
                    return parseFloat(d);
                })])
                .range([0, widthDailyStats]);
            //add axis
            yAxis = d3.svg.axis()
                .scale(yScaleDailyStats)
                .orient("left");
            axisGroup = selection.append("g")
                .attr("class", "axisBarChart")
                //.attr("transform", "translate(20,20)")
                .call(yAxis)
            //add rectangles
            rectangles = svgBlock.selectAll("rect")
                .data(dailyTimeStatsPercentData)
                .enter()
                .append("rect")
                .attr({
                    x: function (d, i) {
                        return 0;
                    },
                    y: function (d, i) {
                        return yScaleDailyStats(yDomainDailyStats[i]);
                    },
                    width: function (d) {
                        return xScaleDailyStats(d);
                    },
                    height: yScaleDailyStats.rangeBand(),
                    fill: function (d, i) {
                        return barChartColorMap(yDomainDailyStats[i]);
                    },
                })


            //add text
            svgBlock.selectAll("text")
                .attr("class", "dailyStatus")
                .data(dailyTimeStatsPercentData)
                .enter()
                .append("text")
                .text(function (d) {
                    return d
                })
                .attr("x", function (d, i) {
                    return xScaleDailyStats(d) - 15;
                })
                .attr("y", function (d, i) {
                    return yScaleDailyStats(yDomainDailyStats[i]) + yScaleDailyStats.rangeBand() / 1.5;
                })
                .attr("font-family", fontFamilyDailyStatsText)
                .attr("font-size", fontSizeDailyStatsText)
                .attr("fill", fontfillDailyStatsText)
                .attr("text-anchor", textAnchorDailyStatsText)


            //add title
            var dailyStatsChartTitle = "(%) of Interactions vs Time";
            var textElementDailyStatsChart = svgBlock.append("text")
                .attr("class", "barChartTitle")
                .attr("x", (widthDailyStats / 2))
                .attr("y", heightDailyStats)
                .attr("text-anchor", textAnchorDailyStatsText)
                .style("font-size", fontSizeDailyStatsText)
                .style("text-decoration", "underline")
                .text(dailyStatsChartTitle);

            //Add tooltips to these chart titles
            //find the widht occupied by this text
            var bboxDailyStatsText = textElementDailyStatsChart.node().getBBox();

            var tooltipDailyStats = d3.select("body")
                .append("div")
                .attr("class", "tooltip dailyStats")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .text(toolTipDailyStatsText);


            var tooltipGroupDailyStats = selection
                .append("g").attr("fill", "green")
                .attr("transform", "translate(" + eval((widthDailyStats / 2) + bboxDailyStatsText.width - 60) + "," + eval(heightDailyStats - 5) + ")");

            tooltipGroupDailyStats.append("circle")
                .attr("class", "tooltip1")
                .attr("stroke", "none")
                .attr("r", 10)
                .on("mouseover", function () {
                    d3.select(this).attr("stroke", "green")
                    return tooltipDailyStats.style("visibility", "visible");
                })
                .on("mousemove", function () {
                    d3.select(this).attr("stroke", "green")
                    return tooltipDailyStats.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke", "none")
                    return tooltipDailyStats.style("visibility", "hidden");
                });

            tooltipGroupDailyStats.append("text")
                .attr("y", "4")
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "white")
                .text("?");

            return barchart;
        }
        barchart.rectangles = function (arg) {
            if (arguments.length == 0)
                return rectangles;
            rectangles = arg;
            return barchart;
        }
        barchart.widthDailyStats = function (arg) {
            if (arguments.length == 0)
                return widthDailyStats;
            widthDailyStats = arg;
            return barchart;
        }
        barchart.heightDailyStats = function (arg) {
            if (arguments.length == 0)
                return heightDailyStats;
            heightDailyStats = arg;
            return barchart;
        }

        barchart.reset = function (arg) {
            //remove all rectangles and texts

            svgBlock.selectAll("rect")
                .data([])
                .exit().remove();
            svgBlock.selectAll("text")
                .data([])
                .exit().remove();

            return barchart;
        }

        barchart.updateRectangles = function (arg) {

            if (arguments.length == 0)
                return rectangles;

            xScaleDailyStats.domain([0, d3.max(dailyTimeStatsPercentData, function (d) {
                return parseFloat(d);
            })])

            //update rectangles
            svgBlock.selectAll("rect")
                .data(dailyTimeStatsPercentData)
                .attr({
                    x: function (d, i) {
                        return 0;
                    },
                    y: function (d, i) {
                        return yScaleDailyStats(yDomainDailyStats[i]);
                    },
                    width: function (d) {
                        return xScaleDailyStats(d);
                    },
                    height: yScaleDailyStats.rangeBand(),
                    fill: function (d, i) {
                        return barChartColorMap(yDomainDailyStats[i]);
                    },
                })

            //update texts
            svgBlock.selectAll("text")
                .data(dailyTimeStatsPercentData)
                .text(function (d) {
                    return d
                })
                .attr("x", function (d, i) {
                    return xScaleDailyStats(d) - 15;
                })
                .attr("y", function (d, i) {
                    return yScaleDailyStats(yDomainDailyStats[i]) + yScaleDailyStats.rangeBand() / 1.5;
                })
                .attr("font-family", fontFamilyDailyStatsText)
                .attr("font-size", fontSizeDailyStatsText)
                .attr("fill", fontfillDailyStatsText)
                .attr("text-anchor", textAnchorDailyStatsText)

            return barchart;
        }

        return barchart;
    }


    /*******************Daily Stats Bar charting Ends************************/

    /*******************Animation  Buttons Starts************************/

    var playPauseButton = function (bottomChart) {

        if ((d3.select("#stop").empty()) && (d3.select("#play").empty()) && (d3.select("#pause").empty())) {
            buttonGroup = bottomChart.append("g")
                .attr("transform", "translate(" + eval(margin.left + 20) + ",45)")
                .attr("class", "playPauseButton")
                .attr("id", "playPauseButton");
            //this wraps the play pause button we r not showing this now
            // var button = buttonGroup.append("circle")
            //     .attr("r", dimension.playButtonDiameter / 2)
            //     .attr("stroke", "green")
            //     .attr("fill", "none");
        }

        var play = function () {
            var playButton = buttonGroup.append("polygon")
                .attr("points", "-9,-20 -9,22 23,2")
                .attr("stroke", "green")
                .attr("stroke-width", 2)
                .attr("fill", "green")
                .attr("id", "play");


        };
        var pause = function () {
            var pauseButton = buttonGroup.append("path")
                .attr("d", "M-12,-20 L-12,22 L-4,22 L-4,-20  M6,-20 L6,22 L14,22 L14,-20")
                .attr("stroke", "green")
                .attr("stroke-width", 2)
                .attr("fill", "green")
                .attr("id", "pause");
        };
        var stop = function () {
            //remove the play button if exists
            d3.select("#play").remove();
            //remove the pause button if exists
            d3.select("#pause").remove();
            var stopButton = buttonGroup.append("rect")
                .attr("width", "30")
                .attr("height", "30")
                .attr("x", "-14")
                .attr("y", "-15")
                .attr("stroke", "green")
                .attr("stroke-width", 2)
                .attr("fill", "green")
                .attr("id", "stop");
        };

        var restartFxn = function () {
            d3.select("#pause").remove();
             d3.select("#play").remove();
            restart = true;
            play();

        };
        //add the stop button for the first time
        play();
        var registerEvents = function () {
            //attach the event handler to play pause button
            buttonGroup.on("click", function () {

                //get the value of play or pause
                if (halt) {
                    //if the play button is called for restart

                    if (restart) {
                        //reset the chart
                        restart = false;
                    }

                    //remove the play button if exists
                    d3.select("#play").remove();
                    //add the play button
                    pause();
                    d3.select("#play").remove();
                    halt = false;
                }
                else {
                    //remove the play button
                    d3.select("#pause").remove();
                    //add the pause button
                    play();
                    halt = true;
                }
            });
        }
        registerEvents();

        return {
            play: play,
            pause: pause,
            stop: stop,
            restart: restartFxn
        }

    }

    /*******************Animation Buttons Ends************************/

    /*******************Slider Starts************************/

    //Add the slider for speeding up the timeline

    function speedSlider() {
        var width = 120,
            height = 100,
            minValue = 1,
            maxValue = 100,
            xPosition = 20,
            yPosition = 22,
            lineHeight = 3,
            speedMin = 500,
            speedMax = 20,
            circleColor = "#2394F5",
            lineColor = "#C0C0C0";

        var slider = function (selection) {
            if (selection === 'undefined') {
                console.log("selection is undefined");
                return;
            }
            ;
            //define domain and range for xaxis
            var xScale = d3.scale.ordinal()
                .domain(["1", "2", "3", "4", "5"])
                .rangePoints([0, width]);

            var speedScale = d3.scale.linear()
                .domain([1, width])
                .range([speedMin, speedMax]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

            var drag = d3.behavior.drag()
                .origin(Object)
                .on("drag", dragMove)
                .on('dragend', dragEnd);

            var g = selection.selectAll("g")
                .attr("class", "sliderData")
                .data([{x: xPosition, y: yPosition}])
                .enter()
                .append('g')
                .attr("height", height)
                .attr("width", width)

            var rect = g.append('rect')
                .attr("class", "rectangleBarSlider")
                .attr('x', xPosition)
                .attr('y', yPosition)
                .attr("height", lineHeight)
                .attr("width", width)
                .attr('fill', lineColor);

            var axisGroup = selection.append("g")
                .attr("class", "axisSlider")
                .attr("transform", "translate(20,20)")
                .call(xAxis)

            g.append("circle")
                .attr("r", 7)
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })
                .attr("fill", circleColor)
                .call(drag);

            function dragMove(d) {

                d3.select(this)
                    .attr("opacity", 0.6)
                    .attr("cx", d.x = Math.max(eval(minValue + 20), Math.min(eval(maxValue - 30), d3.event.x)))
                    .attr("cy", d.y = yPosition);


                // console.log("forwardSpeed" + forwardSpeed);
                //change the speed
                forwardSpeed = speedScale(Math.max(eval(minValue + 20), Math.min(maxValue, d3.event.x)));

            }

            function dragEnd() {
                d3.select(this)
                    .attr('opacity', 1)

            }

            return slider;
        }
        /*
         Create Getter and Setter for Slider
         */
        slider.width = function (arg) {
            if (arguments.length == 0)
                return width;
            width = arg;
            return slider;
        }

        slider.height = function (arg) {
            if (arguments.length == 0)
                return height;
            height = arg;
            return slider;
        }
        slider.circleColor = function (arg) {
            if (arguments.length == 0)
                return circleColor;
            circleColor = arg;
            return slider;
        }
        return slider;
    }

    /*******************Slider Ends************************/

    /******************* Post Creation Starts************************/

    function postTemplate() {
        var width = 550,
            height = 180,
            postData = [],
            individualPostSectionColor = "white",
            individualPostSectionHeight = 115,
            userIcon = "M1600 1405q0 120-73 189.5t-194 69.5h-874q-121 0-194-69.5t-73-189.5q0-53 3.5-103.5t14-109 26.5-108.5 43-97.5 62-81 85.5-53.5 111.5-20q9 0 42 21.5t74.5 48 108 48 133.5 21.5 133.5-21.5 108-48 74.5-48 42-21.5q61 0 111.5 20t85.5 53.5 62 81 43 97.5 26.5 108.5 14 109 3.5 103.5zm-320-893q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5z",
            likesIcon = "M21.216 8h-2.216v-1.75l1-3.095v-3.155h-5.246c-2.158 6.369-4.252 9.992-6.754 10v-1h-8v13h8v-1h2l2.507 2h8.461l3.032-2.926v-10.261l-2.784-1.813zm.784 11.225l-1.839 1.775h-6.954l-2.507-2h-2.7v-7c3.781 0 6.727-5.674 8.189-10h1.811v.791l-1 3.095v4.114h3.623l1.377.897v8.328z",
            commentsIcon = "M1408 768q0 139-94 257t-256.5 186.5-353.5 68.5q-86 0-176-16-124 88-278 128-36 9-86 16h-3q-11 0-20.5-8t-11.5-21q-1-3-1-6.5t.5-6.5 2-6l2.5-5 3.5-5.5 4-5 4.5-5 4-4.5q5-6 23-25t26-29.5 22.5-29 25-38.5 20.5-44q-124-72-195-177t-71-224q0-139 94-257t256.5-186.5 353.5-68.5 353.5 68.5 256.5 186.5 94 257zm384 256q0 120-71 224.5t-195 176.5q10 24 20.5 44t25 38.5 22.5 29 26 29.5 23 25q1 1 4 4.5t4.5 5 4 5 3.5 5.5l2.5 5 2 6 .5 6.5-1 6.5q-3 14-13 22t-22 7q-50-7-86-16-154-40-278-128-90 16-176 16-271 0-472-132 58 4 88 4 161 0 309-45t264-129q125-92 192-212t67-254q0-77-23-152 129 71 204 178t75 230z",
            commentedByIcon = "M1792 896q0 174-120 321.5t-326 233-450 85.5q-70 0-145-8-198 175-460 242-49 14-114 22-17 2-30.5-9t-17.5-29v-1q-3-4-.5-12t2-10 4.5-9.5l6-9 7-8.5 8-9q7-8 31-34.5t34.5-38 31-39.5 32.5-51 27-59 26-76q-157-89-247.5-220t-90.5-281q0-130 71-248.5t191-204.5 286-136.5 348-50.5q244 0 450 85.5t326 233 120 321.5z",
            iconColor = "green",
            wordsLengthMesage = 90,
            wordsLengthPostStory = 55,
            postCreationDate = '',
            commentCreationDate = '',
            postStory,
            postMessage,
            commentSenderName,
            commentMessage,
            postCommentCount,
            postLikeCount,
            postUserName = userName;


        /*
         Function to get the pot story without first name if psot story is present
         */
        function cutShortPostStory(pstStory) {
            //cut the post story upto the limit ;todo: could be improvised

            if (pstStory == "") {
                return "";
            }
            else {
                //make the first 2 spaces of the post as user name
                var indexOfFirstSpace = pstStory.indexOf(" ");
                var sentenceAfterFirstName = pstStory.substring(indexOfFirstSpace + 1, pstStory.length);
                var lengthOfSecondSpace = sentenceAfterFirstName.indexOf(" ");
                var tokens = pstStory.split(' ');
                postUserName = tokens[0] + " " + tokens[1];
                postUserName = pstStory.substring(0, eval(indexOfFirstSpace + lengthOfSecondSpace + 1));
                var postStory1 = pstStory.substring(eval(tokens[0].length + tokens[1].length + 2), pstStory.length)
                var postStory2 = (pstStory.length > wordsLengthPostStory) ? postStory1.substring(0, wordsLengthPostStory) + "..." : postStory1.substring(0, wordsLengthPostStory);
                return postStory2;
            }


        }

        function getPostData(postID) {
            //loop over chart
            for (var count = 0; count < chartData.length; count++) {
                if (chartData[count].app_specific_post_id == postID && chartData[count].is_post == "1") {

                    //cut the post message upto the limit ;todo: could be improvised
                    var postStory1 = (typeof chartData[count].post_story === 'undefined' || chartData[count].post_story === null) ? "" : chartData[count].post_story;
                    postStory = cutShortPostStory(postStory1);

                    postMessage = ((typeof chartData[count].post_message === 'undefined') || (chartData[count].post_message === null)) ? "" : chartData[count].post_message;
                    postMessage = (postMessage == "") ? "" : (postMessage.length > wordsLengthMesage) ? postMessage.substring(0, wordsLengthMesage) + "..." : postMessage.substring(0, wordsLengthMesage);
                    postCreationDate = new Date(chartData[count].created_time);
                    postCommentCount = chartData[count].post_comment_count;
                    postLikeCount = chartData[count].post_like_count;
                    break;
                }


            }


        }

        var post = function (selection) {
            if (selection === 'undefined') {
                console.log("selection is undefined");
                return;
            }

            if ((typeof postData == 'undefined') || (postData.length == 0)) {
                return;
            }

            //get the chart datas
            if (postData.is_post == "1") {
                postCreationDate = new Date(postData.created_time);
                //cut the post story upto the limit ;todo: could be improvised
                var postStory1 = (typeof postData.post_story === 'undefined' || postData.post_story === null) ? "" : postData.post_story;
                postStory = cutShortPostStory(postStory1);


                //cut the post message upto the limit ;todo: could be improvised
                postMessage = (typeof postData.post_message === 'undefined' || postData.post_message === null) ? "" : postData.post_message;
                postMessage = (postMessage == "") ? "" : postMessage.substring(0, wordsLengthMesage) + "...";
                postCommentCount = postData.post_comment_count;
                postLikeCount = postData.post_like_count;
            }
            else {
                commentCreationDate = new Date(postData.created_time);
                commentSenderName = postData.comment_sender_name;
                commentMessage = postData.comment_message;
                getPostData(postData.app_specific_post_id);
            }


            //create an outer group
            var selectedSvg = selection.append("svg")
                .attr("width", width)
                .attr("height", (postData.is_post == "1") ? individualPostSectionHeight : height)
            //create a rectangle and fill it white for design
            selectedSvg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "none")
                .attr("class", "postMainSection");
            //individual post
            var individualPost = selectedSvg.append("g")
                .attr("transform", "translate(0,0)")
                .attr("class", "individualPost");
            //fill individualPost with white
            individualPost.append("rect")
                .attr("fill", individualPostSectionColor)
                .attr("width", width)
                .attr("height", individualPostSectionHeight);
            //create a post section
            var postSection = individualPost.append("g")
                .attr("class", "postSection");
            //story section
            var storySection = postSection.append("g")
                .attr("class", "StorySection");

            //add user icon
            var userIconElem = storySection.append("svg")
                .attr("fill", iconColor)
                .attr("width", 30)
                .attr("height", 30)
                .attr("viewBox", "0 0 1792 1792")

            //add path for user icon

            userIconElem.append("path")
                .attr("d", userIcon);

            storySection.append("text")
                .attr("transform", "translate(30,25)")
                .attr("class", "userName")
                .text(postUserName)


            storySection.append("text")
                .attr("transform", "translate(140,25)")
                .text(postStory)
            //Add date of post creation

            postSection.append("text")
                .attr("transform", "translate(5,43)")
                .attr("class", "dateDisplay")
                .text(postCreationDate.toLocaleString("en-us", {month: "short"}) + " " + postCreationDate.getDate() + ", " + postCreationDate.getFullYear() + " " + postCreationDate.toLocaleTimeString())
            //append the full psot message
            postSection.append("text")
                .attr("transform", "translate(5,70)")
                .attr("class", "postMessage")
                .text(postMessage)

            //Add the comment section
            var commentSection = selectedSvg.append("g")
                .attr("transform", "translate(0,100)")
                .attr("class", "commentSection");

            //create section to add stats
            var statsSection = commentSection.append("g")
                .attr("class", "statsSection");
            // add section for like stats
            var likeStats = statsSection.append("g")
                .attr("class", "likeStats")
                .attr("transform", "translate(5,-15)");

            //add like icon
            var likeIcon = likeStats.append("svg")
                .attr("fill", iconColor)
                .attr("width", 20)
                .attr("height", 20)
                .attr("viewBox", "0 0 24 24")

            //add path for like icon

            likeIcon.append("path")
                .attr("d", likesIcon)
            // add the like count

            likeStats.append("text")
                .attr("transform", "translate(32,15)")
                .attr("id", "likeCount")
                .text(postLikeCount);


            // add section for comment stats
            var commentStats = statsSection.append("g")
                .attr("class", "CommentStats")
                .attr("transform", "translate(70,-15)");

            //add comments icon
            var commentIcon = commentStats.append("svg")
                .attr("fill", iconColor)
                .attr("width", 20)
                .attr("height", 20)
                .attr("viewBox", "0 0 1792 1792")

            //add path for comments icon

            commentIcon.append("path")
                .attr("d", commentsIcon)
            // add the comments count
            commentStats.append("text")
                .attr("transform", "translate(35,15)")
                .attr("id", "commmentCount")
                .text(postCommentCount);

            if (postData.is_post != "1") {
                //user comment in post section
                var commentStarts = commentSection.append("g")
                    .attr("class", "commentStats")
                    .attr("transform", "translate(5,40)");

                //section for comment  by user name and date of comment
                var commentNameAndDate = commentStarts.append("g")
                    .attr("class", "commentNameandDate")
                    .attr("transform", "translate(0,-2)");
                ;

                var userCommentIcon = commentStarts.append("g")
                    .attr("transform", "translate(5,-22)");

                //add the comment icon
                var svgComment = userCommentIcon.append("svg")
                    .attr("fill", iconColor)
                    .attr("width", 25)
                    .attr("height", 25)
                    .attr("viewBox", "0 0 1792 1792")
                //add the path of the icon
                svgComment.append("path")
                    .attr("d", commentedByIcon);
                //add commenter name
                var commentSender = commentNameAndDate.append("text")
                    .attr("transform", "translate(35,-2)")
                    .attr("class", "commentSenderName")
                    .text(commentSenderName);
                //find the widht occupied by this text
                var bboxSenderComment = commentSender.node().getBBox();
                //section for user comment on the post
                //add the commented text after the sender name
                commentNameAndDate.append("text")
                    .attr("transform", "translate(" + eval(35 + bboxSenderComment.width + 5) + ",-2)")
                    .attr("class", "commentText")
                    .text(commentMessage);

                //add commented date
                commentNameAndDate.append("text")
                    .attr("transform", "translate(5,20)")
                    .attr("class", "dateDisplay")
                    .text(commentCreationDate.toLocaleString("en-us", {month: "short"}) + " " + commentCreationDate.getDate() + ", " + commentCreationDate.getFullYear() + " " + commentCreationDate.toLocaleTimeString());


            }


            return post;
        }
        post.postData = function (arg) {
            if (arguments.length == 0)
                return postData;
            postData = arg;
            return post;
        }
        post.height = function (arg) {
            if (arguments.length == 0)
                return height;
            height = arg;
            return post;
        }

        post.width = function (arg) {
            if (arguments.length == 0)
                return width;
            width = arg;
            return post;
        }


        return post;
    }

//get average time period between interactions also called latency between interactions
    var getLatencyAmongPost = function () {
        var totalTimeDifference = 0;
        for (var count = 0; count < chartData.length; count++) {
            if (count == chartData.length - 1)
                break;
            //check if the data is post or comment
            var d = chartData[count]
            var d1 = chartData[count + 1]
            var createdTimeForCurrentInteraction, createdTimeForNextInteraction;
            createdTimeForCurrentInteraction = d.created_time.getTime();
            createdTimeForNextInteraction = d1.created_time.getTime();
            var timeDifferenceBetweenConsecutiveInteractions = -createdTimeForNextInteraction + createdTimeForCurrentInteraction;
            totalTimeDifference = totalTimeDifference + timeDifferenceBetweenConsecutiveInteractions;
        }
        var averageTimeBetweenInteractions = 0;
        if (chartData.length > 0) {
            averageTimeBetweenInteractions = totalTimeDifference / chartData.length;
            averageTimeBetweenInteractions = parseFloat(averageTimeBetweenInteractions / (1000 * 60 * 60 * 24)).toFixed(2)
        }
        return averageTimeBetweenInteractions;
    }
    /******************* Post Creation Ends************************/

    /******************* Bar Chart Overview  Starts************************/

    function getBarChartOverView() {
        dailyTimeStatsData = [0, 0, 0, 0, 0, 0];
        dailyTimeStatsPercentData = [0, 0, 0, 0, 0, 0];

        var updateAllPercents = function () {
            for (var count = 0; count < dailyTimeStatsPercentData.length; count++) {
                dailyTimeStatsPercentData[count] = parseFloat((dailyTimeStatsData[count] / chartData.length) * 100).toFixed(0);
            }
        }
        for (var count = 0; count < chartData.length; count++) {
            var createdTime;
            var hourCreated;

            createdTime = chartData[count].created_time;
            hourCreated = createdTime.getHours();
            if ((hourCreated >= 0) && (hourCreated < 4)) {
                dailyTimeStatsData[0] += 1;
            }
            else if ((hourCreated >= 4) && (hourCreated < 8)) {
                dailyTimeStatsData[1] += 1;
            }
            else if ((hourCreated >= 8) && (hourCreated < 12)) {
                dailyTimeStatsData[2] += 1;
            }
            else if ((hourCreated >= 12) && (hourCreated < 16)) {
                dailyTimeStatsData[3] += 1;
            }
            else if ((hourCreated >= 16) && (hourCreated < 20)) {
                dailyTimeStatsData[4] += 1;
            }
            else if ((hourCreated >= 20) && (hourCreated < 24)) {
                dailyTimeStatsData[5] += 1;
            }
        }
        updateAllPercents();
        dailyStats.updateRectangles(dailyTimeStatsPercentData);
    }


    /******************* Bar Chart Overview  Ends************************/


    /*******************Chart Starts************************/
    var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
    //Define a chart
    var chart = function (s) {
        selection = s;
        if (selection === 'undefined') {
            console.log("selection is undefined");
            return;
        }
        ;
        if (startDate === 'undefined') {
            console.log("Improper start date selected");
            return;
        }
        if (endDate === 'undefined') {
            console.log("Improper end date selected");
            return;
        }

        chartTitle = chartTitle || "";

        //create an svg
        var svg = selection.append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr("class", "entireChart")
        // .style("fill", "#f5f5f5");


        /*define and create main chart*/
        //get the necessary dimension for main chart
        var mainChartWidth = svgWidth - margin.left - margin.right;
        var mainChartHeight = svgHeight - margin.top - margin.bottom - dimension.bottomChart;
        //console.log("mainChartWidth"+mainChartWidth)
        //console.log("mainChartHeight"+mainChartHeight)

        var mainChart = svg.append("g")
            .attr("class", "mainChart")
            .attr("id", "mainChartPlace")

            .attr("width", mainChartWidth)
            .attr("height", mainChartHeight)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //add background to main chart
        mainChart.append("rect")
            .attr("class", "rectMainChart")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", mainChartWidth)
            .attr("height", mainChartHeight)
            .style("fill", "#f5f5f5")

        //add front diplay date
        var frontDateDisplay = mainChart.append("text")
            .attr("id", "frontDateDisplay")
            .attr("x", margin.left + 80)
            .attr("y", 40)
            .attr("width", dimension.frontDateDisplay)
            .attr("text-anchor", "middle")
            .attr("font-family", "Bevan")
            .attr("font-size", "26px")
            .attr("font-weight", "bold")
            .attr("fill", "green")
        //add text element for latency between post

        var latencyText = "Average latency between interactions :" + getLatencyAmongPost() + "d";
        latencyBetweenPost = mainChart.append("text")
            .attr("id", "latencyPeriod")
            .attr("x", mainChartWidth / 1.25)
            .attr("y", dimension.dailyStatBarchartHeight + 50)
            .attr("width", dimension.latencyBetweenPostElementWidth)
            .attr("text-anchor", "middle")
            .attr("font-family", "Bevan")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "green")
            .text(latencyText)

        //find the widht occupied by this text
        var bboxLatencyText = latencyBetweenPost.node().getBBox();

//add tool tip for latency between posts

        //Add tooltips 2 these chart titles
        var tooltipLatency = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .text(toolTipLatencyText);


        var tooltipGroupLatency = mainChart
            .append("g").attr("fill", "green")
            .attr("transform", "translate(" + eval((mainChartWidth / 1.25) + bboxLatencyText.width - 120) + "," + eval(dimension.dailyStatBarchartHeight + 45) + ")");

        tooltipGroupLatency.append("circle")
            .attr("class", "tooltip1")
            .attr("stroke", "none")
            .attr("r", 10)
            .on("mouseover", function () {
                d3.select(this).attr("stroke", "green")
                return tooltipLatency.style("visibility", "visible");
            })
            .on("mousemove", function () {
                d3.select(this).attr("stroke", "green")
                return tooltipLatency.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke", "none")
                return tooltipLatency.style("visibility", "hidden");
            });

        tooltipGroupLatency.append("text")
            .attr("y", "4")
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "white")
            .text("?");


        //define clip path to constrain the objects within main chart
        mainChart.append("defs").append("clipPath")
            .attr("id", "myClip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", mainChartWidth)
            .attr("height", mainChartHeight);

        //create a group for all the post objects within main chart
        var groupPostElement = mainChart.append("g")
            .attr("class", "postElementsGroup")
            .attr("transform", "translate(0, 0)")
            .attr("clip-path", "url(#myClip")
            .append("g");
        //define the time scale
        timeScale = d3.time
            .scale()
            .range([0, mainChartHeight])
        //define axis and its group
        mainAxis = d3.svg.axis().orient("right");
        mainAxisGroup = mainChart.append("g")
            .attr("class", "timeAxis")
            .attr("transform", "translate(" + mainChartWidth / 2 + ",0)");

        interval = startDate.getTime() - timeBeforeAfterStartDate;
        startTimeView = new Date(interval);
        endTimeView = new Date(startDate);


        timeScale.domain([startTimeView, endTimeView]);
        mainAxis.scale(timeScale)(mainAxisGroup);

        //create a border line
        slidingTimeValue = timeBeforeAfterStartDate;
        svg.append("line")
            .attr("x1", margin.left + 20)
            .attr("y1", eval(mainChartHeight + margin.top))
            .attr("x2", mainChartWidth)
            .attr("y2", eval(mainChartHeight + margin.top))
            .attr("stroke", "green")
            .attr("stroke-width", "2")
            .attr("opacity", "0.2")


        /*define and create bottom chart*/
        //get the necessary dimension for navigation chart
        var bottomChartWidth = svgWidth - margin.left - margin.right;
        var bottomChartHeight = dimension.bottomChart - margin.bottom;
        var bottomChart = svg.append("g")
            .attr("class", "bottomChart")
            .attr("transform", "translate (" + margin.left + "," + eval(mainChartHeight + margin.top) + ")")
            .attr("width", bottomChartWidth)
            .attr("height", bottomChartHeight)

        //Add background to bottom chart
        bottomChart.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", bottomChartWidth)
            .attr("height", bottomChartHeight)
            .style("fill", "#f5f5f5");

        //define navigation chart within bottom section
        var navigationChart = bottomChart.append("g")
            .attr("class", "navigationChart")
            .attr("width", navigationChartWidth)
            .attr("height", dimension.navigationChartHeight)
            .attr("transform", "translate (" + eval(dimension.playButtonDiameter + 40) + ",15)");
        //add some background
        var navigationChartWidth = mainChartWidth / 2 - dimension.playButtonDiameter - 40;
        navigationChart.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", navigationChartWidth)
            .attr("height", dimension.navigationChartHeight)
            .style("shape-rendering", "crispEdges").style("fill", "none");

        //define the scale for navigation
        xScale = d3.time
            .scale()
            .range([0, navigationChartWidth]);
        var domain = ['Post', 'Comment'];
        var yScale = d3.scale.ordinal()
            .domain(domain)
            .rangeRoundPoints([dimension.navigationChartHeight, 0], 1)

        //define axis and its group
        navigationXAxis = d3.svg.axis().orient("bottom");
        var navigationYAxis = d3.svg.axis().orient("right");

        navigationXAxisGroup = navigationChart.append("g")
            .attr("class", "timeAxis")
            .attr("transform", "translate(0," + dimension.navigationChartHeight + ")");

        // add group for y axis
        var navigationYAxisGroup = navigationChart.append("g")
            .attr("class", "navigationYAxis");
        // Mke a group of all the data items inside the navigation chart
        var navChartGroup = navigationChart.append("g")
            .attr("class", "navigationData");
        //add axis to the navigation chart
        intervalNav = eval(startDate.getTime() - timeBeforeAfterStartDate * 4);//go 24 hr beyond
        startTimeNav = new Date(intervalNav);
        endTimeNav = new Date(startDate);
        var offset = 0.5 * 1000 * 60 * 60;
        endTimeNav = new Date(endTimeNav.getTime() + offset);
        xScale.domain([startTimeNav, endTimeNav]);
        navigationXAxis.scale(xScale)(navigationXAxisGroup);
        navigationYAxis.scale(yScale)(navigationYAxisGroup);
        viewport = d3.svg.brush()
            .x(xScale)
            // .extent([endTimeView, startTimeView])
            .extent([startTimeView, endTimeView])
            .on("brush", function () {
                // get the current time extent of viewport
                var extent = viewport.extent();
                startTimeView = extent[0];
                endTimeView = extent[1];
                var offset = 0.5 * 1000 * 60 * 60;
                // update the x domain of the main chart
                timeScale.domain(viewport.empty() ? xScale.domain() : extent);

                // update the x axis of the main chart
                mainAxis.scale(timeScale)(mainAxisGroup);
                // call the display update
                updateDisplay();
            });

        // create group and assign to brush
        navigationViewRect = navigationChart.append("g")
            .attr("class", "viewport")
            .attr("id", "navigationChart")
            .call(viewport)
            .selectAll("rect")
            .attr("height", dimension.navigationChartHeight);

        //create play pause button
        playPauseButton(bottomChart);
        //create speed slider if forward slider is true
        if (forwardSlider) {
            var divSpeedSlider = speedSlider()
                .width("50")
                .height("50")
                .circleColor("green");
            //call the slider
            var svgSlider = bottomChart
                .append('g')
                .call(divSpeedSlider)
                .attr("transform", "translate (" + 0 + "," + eval(dimension.playButtonDiameter + 1) + ")");
        }
        //if displayDailyStats is true
        if (displayDailyStats) {
            dailyStats = generateDailyStats()
                .widthDailyStats(dimension.dailyStatBarchartWidth)
                .heightDailyStats(dimension.dailyStatBarchartHeight);
            //call the chart after selcting main chart as the location for barchart

            barchart = mainChart
                .append("g")
                .call(dailyStats)
                .attr("id", "dailyStatsBarChart")
                .attr("transform", "translate (" + mainChartWidth / 1.2 + "," + eval(margin.top) + ")");

            getBarChartOverView();
        }

        //if line chart is true
        if (displayLineChart) {
            var yPositionLineChart = margin.top;
            //if dailystats is displayed then put line chart after it
            if (displayDailyStats) {
                yPositionLineChart = dimension.dailyStatBarchartHeight + 60
            }

            lineChartFxn = generateLineChartInteractions()
                .widthInteractiveLineChart(dimension.widthInteractiveLineChart)
                .heightInteractiveLineChart(dimension.heightInteractiveLineChart)
                .wholeChartInteractionData(chartData)
                .startDateLineChart(startDate)
                .endDateLineChart(endDate)


            console.log(chartData)

            // var lineChart = mainChart
            //     .append("g")
            //     .call(lineChartFxn)
            //     .attr("class","overviewLineChart")
            //     .attr("transform", "translate (" + mainChartWidth / 1.35 + "," + yPositionLineChart + ")");
            //done so that this chart appears on the top along with calender
            var lineChart = d3.select("#lineChartWrapper")
                .append("svg")
                .call(lineChartFxn)
                .attr("class", "overviewLineChart")
             .attr("id", "overviewLineChart")


        }
        function updateDisplay() {
            //accomodate only items within view port

            var data = chartData.filter(function (d) {

                if ((d.created_time.getTime() < endTimeNav.getTime()) && (d.created_time.getTime() > startTimeNav.getTime()))
                    return true;

            })
            //if start navigation time is 12 midnight we display the timer
            if (startTimeNav.getHours() == 0) {
                frontDateDisplay.text(new Date(startTimeNav.getTime() + 24 * 60 * 60 * 1000).toDateString())
            }

            //loop through data and update it

            data.forEach(function (d) {
                var connectingLineCoordinates = {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0
                }
                var postCoordinates = {
                    x: 0,
                    y: 0
                }
                var x = 0;
                var y = 0;
                if (d.side == 'left') {
                    x = (parseInt(mainChartWidth / 2 - postPadding - postWidth));
                }
                else {
                    x = parseInt(mainChartWidth / 2 + postPadding);
                }

                createdTime = d.created_time;

                y = timeScale(createdTime);
                postCoordinates.x = x;
                //this is done to make sure the post rectangle is at middle
                if (d.is_post == "1") {
                    postCoordinates.y = eval(y - individualPostSectionHeight / 2);
                }
                else {
                    postCoordinates.y = eval(y - postHeight / 2);
                }

                d["postCordinates"] = postCoordinates;
                if (d.side == 'left') {
                    connectingLineCoordinates.x1 = x + postWidth;
                    connectingLineCoordinates.x2 = mainChartWidth / 2;

                }
                else {
                    connectingLineCoordinates.x1 = mainChartWidth / 2;
                    connectingLineCoordinates.x2 = postPadding + mainChartWidth / 2;

                }

                connectingLineCoordinates.y1 = y
                connectingLineCoordinates.y2 = y;


                d["connectingLineCoordinates"] = connectingLineCoordinates;

            });

            /*
             * Section to update main chart
             */
            var updateMainSelection = groupPostElement.selectAll(".post")
                .data(data);


            console.log(updateMainSelection)
            // remove items
            updateMainSelection.exit().remove();

            updateMainSelection.enter()
                .append('g')
                .attr("class", "post")

            updateMainSelection.each(function (d) {
                console.log(d);
                var templatePost = postTemplate()
                    .width(postWidth)
                    .height(postHeight)
                templatePost.postData(d);
                d3.select(this).call(templatePost)

            })

            updateMainSelection.attr("transform", function translate(d) {
                return "translate(" + d.postCordinates.x + "," + d.postCordinates.y + ")";
            })

            //draw the connecting line between the post and the axis from the centerLineCoordinates data
            var connectingLine = groupPostElement.selectAll(".connecting-lines").data(data);
            // remove items
            connectingLine.exit().remove();

            connectingLine.enter()
                .append('line')
                .attr("class", "connecting-lines")


            connectingLine
                .attr("stroke", "black")
                .attr("stroke-width", "1")
                //.attr("class","connecting-line")
                .attr("x1", function (d) {
                    return d.connectingLineCoordinates.x1
                })
                .attr("y1", function (d) {
                    return d.connectingLineCoordinates.y1;
                })
                .attr("x2", function (d) {
                    return d.connectingLineCoordinates.x2
                })
                .attr("y2", function (d) {
                    return d.connectingLineCoordinates.y2;
                })

            /*
             * Section to update navigation chart
             */
            var selectionNavigation = navChartGroup.selectAll("circle")
                .data(data);
            // remove exceeded items
            selectionNavigation.exit().remove();
            // add newer data sets
            selectionNavigation.enter().append("circle")
                .attr("r", 7)


            // added items now part of update selection; set coordinates of points
            selectionNavigation.attr("cx", function (d) {


                return xScale(d.created_time);

            })
                .attr("cy", function (d) {
                    return yScale(d.category);
                })
                .attr("fill", function (d) {
                    if (d.is_post == "1") {
                        return "orange";
                    }
                    else {
                        return "#4267b2";
                    }
                })

            //update the daily status data if status is shown
            if (displayDailyStats) {

                //reset the values
                if (!(cycleStart)) {
                    dailyTimeStatsPercentData = [0, 0, 0, 0, 0, 0];
                    dailyTimeStatsData = [0, 0, 0, 0, 0, 0];
                    dailyStats.updateRectangles(dailyTimeStatsPercentData)
                }

                var checkDatePresentInArray = function (checkTime) {
                    var isPresent = false;
                    for (var i = 0; i < dateBucket.length; i++) {
                        if (dateBucket[i] == checkTime) {
                            isPresent = true;
                            break;
                        }
                    }
                    return isPresent;

                };
                var getAllPostCount = function () {
                    var sum = 0;
                    for (var count = 0; count < dailyTimeStatsPercentData.length; count++) {
                        sum = sum + dailyTimeStatsData[count];
                    }
                    return sum;
                }

                var updateAllPercents = function () {
                    var totalSum = getAllPostCount()
                    for (var count = 0; count < dailyTimeStatsPercentData.length; count++) {
                        dailyTimeStatsPercentData[count] = parseFloat((dailyTimeStatsData[count] / totalSum) * 100).toFixed(0);
                    }
                }
                for (var count = 0; count < data.length; count++) {
                    var createdTime;
                    var hourCreated;

                    createdTime = data[count].created_time;


                    if ((createdTime.getTime() < endTimeNav.getTime()) && (createdTime.getTime() > startTimeNav.getTime())) {
                        hourCreated = createdTime.getHours();
                        if ((hourCreated >= 0) && (hourCreated < 4)) {
                            if (!checkDatePresentInArray(createdTime.getTime())) {
                                dateBucket.push(createdTime.getTime());
                                dailyTimeStatsData[0] += 1;
                                updateAllPercents();
                            }
                        }
                        else if ((hourCreated >= 4) && (hourCreated < 8)) {

                            dateBucket.push(createdTime);
                            if (!checkDatePresentInArray(createdTime.getTime())) {
                                dateBucket.push(createdTime.getTime());
                                dailyTimeStatsData[1] += 1;
                                updateAllPercents();
                            }

                        }
                        else if ((hourCreated >= 8) && (hourCreated < 12)) {

                            if (!checkDatePresentInArray(createdTime.getTime())) {
                                dailyTimeStatsData[2] += 1;
                                updateAllPercents();
                                dateBucket.push(createdTime.getTime());
                            }
                        }
                        else if ((hourCreated >= 12) && (hourCreated < 16)) {

                            if (!checkDatePresentInArray(createdTime.getTime())) {
                                dateBucket.push(createdTime.getTime());
                                dailyTimeStatsData[3] += 1;
                                updateAllPercents();
                            }

                        }
                        else if ((hourCreated >= 16) && (hourCreated < 20)) {

                            if (!checkDatePresentInArray(createdTime.getTime())) {
                                dateBucket.push(createdTime.getTime());
                                dailyTimeStatsData[4] += 1;
                                updateAllPercents();
                            }
                        }
                        else if ((hourCreated >= 20) && (hourCreated < 24)) {

                            if (!checkDatePresentInArray(createdTime.getTime())) {
                                dateBucket.push(createdTime.getTime());
                                dailyTimeStatsData[5] += 1;
                                updateAllPercents();
                            }
                        }
                    }
                }

                dailyStats.updateRectangles(dailyTimeStatsPercentData);
                console.log(dailyTimeStatsPercentData)


            }

            if (displayLineChart) {
                if (!(cycleStart)) {
                    lineChartFxn.mainChartOnMove()
                }
                cycleStart = true;
                lineChartFxn.updateMovingLine(new Date(startTimeView))
            }

        }

        /*
         code to create a moving display
         */

        function moveCharts() {
            setTimeout(function () {
                if (!halt) {
                    // get current viewport extent
                    //var extent = viewport.empty() ? xScale.domain() : viewport.extent();
                    // var interval = extent[1].getTime() - extent[0].getTime();
                    // var offset = extent[0].getTime() - xScale.domain()[0].getTime();

                    //console.log("extent"+extent);
                    //console.log("interval"+interval);

                    var offset = 0.5 * 1000 * 60 * 60;
                    startTimeNav = new Date(startTimeNav.getTime() + offset);
                    endTimeNav = new Date(endTimeNav.getTime() + offset);

                    // compute new viewport extents
                    startTimeView = new Date(startTimeView.getTime() + offset);
                    endTimeView = new Date(endTimeView.getTime() + offset);

                    //return after the endDate
                    if (endTimeView > new Date(endDate.getTime() + 3 * 1000 * 60 * 60)) {
                        resetChart();
                        return;
                    }
                    viewport.extent([startTimeView, endTimeView])
                    //call the viewport again
                    navigationChart.select(".viewport")
                        .call(viewport)

                    // update scale and axis
                    timeScale.domain([startTimeView, endTimeView]);
                    xScale.domain([startTimeNav, endTimeNav]);
                    mainAxis.scale(timeScale)(mainAxisGroup);
                    navigationXAxis.scale(xScale)(navigationXAxisGroup);

                    // refresh svg
                    updateDisplay();
                    console.log("forwardSpeed11 " + forwardSpeed);

                }
                moveCharts();
            }, forwardSpeed);
        }

        moveCharts();


        resetChart = function () {


            if (displayDailyStats) {
                getBarChartOverView();
                dailyStats.updateRectangles(dailyTimeStatsPercentData);
                dateBucket = [];
            }
            halt = true;
            playPauseButton().restart();
            cycleStart = false;
            //change the time for main chart
            interval = startDate.getTime() - timeBeforeAfterStartDate;
            startTimeView = new Date(interval);
            endTimeView = new Date(startDate);

            timeScale.domain([startTimeView, endTimeView]);
            mainAxis.scale(timeScale)(mainAxisGroup);

            //Change the timer for navigation axis
            intervalNav = eval(startDate.getTime() - timeBeforeAfterStartDate * 4);//go 24 hr beyond
            startTimeNav = new Date(intervalNav);
            endTimeNav = new Date(startDate);
            xScale.domain([startTimeNav, endTimeNav]);
            navigationXAxis.scale(xScale)(navigationXAxisGroup);
            //reset the view port in navigation
            viewport = d3.svg.brush()
                .x(xScale)
                .extent([startTimeView, endTimeView])
                .on("brush", function () {
                    // get the current time extent of viewport
                    var extent = viewport.extent();
                    startTimeView = extent[0];
                    endTimeView = extent[1];
                    var offset = 0.5 * 1000 * 60 * 60;
                    // update the x domain of the main chart
                    timeScale.domain(viewport.empty() ? xScale.domain() : extent);

                    // update the x axis of the main chart
                    mainAxis.scale(timeScale)(mainAxisGroup);
                    // call the display update
                    updateDisplay();
                });

            //move the brush to cover just 2 hrs
            viewport.extent([startTimeView, endTimeView])
            navigationChart.select(".viewport")
                .call(viewport)
            navigationViewRect = d3.select("viewport")
                .call(viewport)
                .selectAll("rect")
                .attr("height", dimension.navigationChartHeight);
            //clear the big date display on the right
            frontDateDisplay.text("");
            //reset barchart
            if (displayDailyStats) {
                getBarChartOverView();
                dailyStats.updateRectangles(dailyTimeStatsPercentData);
            }
            //reset line chart if exits
            if (displayLineChart) {
                console.log(chartData)

                lineChartFxn.wholeChartInteractionData(chartData)
                    .startDateLineChart(startDate)
                    .endDateLineChart(endDate);
                lineChartFxn.reset()
            }

            //update the average latency between interactions
            latencyBetweenPost.text("Average latency between interactions :" + getLatencyAmongPost() + "d")
            moveCharts();

        }

        return chart;
    }

    /*******************Chart Ends************************/
    /*
     create getter and setter for chart
     */
    chart.data = function (arg) {
        if (arguments.length == 0)
            return chartData;
        chartData = arg;
        return chart;
    }

    chart.chartTitle = function (arg) {
        if (arguments.length == 0)
            return chartTitle;
        chartTitle = arg;
        return chart;
    }

    chart.svgHeight = function (arg) {
        if (arguments.length == 0)
            return svgHeight;
        svgHeight = arg;
        return chart;
    }

    chart.svgWidth = function (arg) {
        if (arguments.length == 0)
            return svgWidth;
        svgWidth = arg;
        return chart;
    }

    chart.halt = function (arg) {
        if (arguments.length == 0)
            return halt;
        halt = arg;
        return chart;
    }

    chart.forward = function (arg) {
        if (arguments.length == 0)
            return forward;
        forward = arg;
        return chart;
    }

    chart.forwardSpeed = function (arg) {
        if (arguments.length == 0)
            return forwardSpeed;
        forwardSpeed = arg;
        return chart;
    }

    chart.startDate = function (arg) {
        if (arguments.length == 0)
            return startDate;
        startDate = arg;
        return chart;
    }

    chart.endDate = function (arg) {
        if (arguments.length == 0)
            return endDate;
        endDate = arg;
        return chart;
    }
    chart.debug = function (arg) {
        if (arguments.debug == 0)
            return debug;
        debug = arg;
        return chart;
    }

    chart.version = function (arg) {
        if (arguments.length == 0)
            return version;
        version = arg;
        return chart;
    }

    chart.forwardSlider = function (arg) {
        if (arguments.length == 0)
            return forwardSlider;
        forwardSlider = arg;
        return chart;
    }

    chart.displayDailyStats = function (arg) {
        if (arguments.length == 0)
            return displayDailyStats;
        displayDailyStats = arg;
        return chart;
    }

    chart.userName = function (arg) {
        if (arguments.length == 0)
            return userName;
        userName = arg;
        return chart;
    }

    chart.reset = function () {
        resetChart();
        return chart;
    }


    return chart;

}
