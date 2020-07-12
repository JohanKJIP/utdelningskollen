window.onload = function() {
    // parse if user selects file
    var inputElement = document.getElementById("myfile");
    inputElement.onchange = function(event) {
        var fileList = inputElement.files;
        Chart.defaults.global.defaultFontFamily = "'Poppins', sans-serif";

        // if changing data file without reloading page
        // destroy the preivous graphs or visual error occur
        if (typeof window.yearlyChart !== 'undefined') {
            window.yearlyChart.destroy();
            window.accumulativeChart.destroy();
            window.monthlyChart.destroy();
        }
    
        parseFile(fileList[0]);
        document.getElementById("panel-container").style.display = "inline";
        document.getElementById("chart-container").style.display = "inline";
        document.getElementById("panel-container").scrollIntoView({ block: 'start',  behavior: 'smooth' });
    }
}

/**
 * Parse Avanza CSV file.
 * @param {*} file 
 */
function parseFile(file) {
    Papa.parse(file, {
        complete: function(results) {
            yearlyDividends(results['data']);
            movingAverage(results['data']);
            accumulative(results['data']);
        }
    });
}

function round(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
}

/**
 * Dislay total dividens received for each year.
 * @param {*} data 
 */
function yearlyDividends(data) {    
    // calculate data
    var years = {};
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        // break at the end of the data 
        if (row.length != 10) break;

        var date = new Date(Date.parse(row[0]));
        year = date.getFullYear();
        if (!(year in years)) {
            years[year] = 0;
        }
        years[year] += parseFloat(row[6].replace(",", "."));
    }

    // sort keys
    keys = [];
    for (var key in years) {
        keys.push(key);
    }
    keys.sort();

    var data = [];
    var total = 0;
    for (const key of keys) {
        var value = years[key];
        total += value
        data.push(round(value));
    }

    // update panels
    document.getElementById("total-divs").innerHTML = round(total).toLocaleString("se-SE") + " SEK";
    var dividendGrowth = round((years[keys[keys.length-1]]-years[keys[keys.length-2]])/years[keys[keys.length-2]])*100;
    document.getElementById("div-growth").innerHTML = dividendGrowth.toLocaleString("se-SE") + "%";
    if (dividendGrowth >= 0) {
        document.getElementById("div-growth").classList.add("green");
    } else {
        document.getElementById("div-growth").classList.add("red");
    }

    // draw chart
    var ctx = document.getElementById('yearly-divs').getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0.4, 'rgba(142,196,229,1)');
    gradient.addColorStop(1, 'rgba(30,134,198,1)'); 
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: keys,
            datasets: [
              {
                label: "Utdelning",
                data: data,
                backgroundColor: gradient
              }
            ]
          },
        options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    yAxes: [
                        {
                            ticks: {
                                callback: function(label, index, labels) {
                                    return label/1000+'k';
                                }
                            },
                        }
                    ]
                },
                tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function(tooltipItems, data) { 
                            return tooltipItems.yLabel + ' SEK';
                        }
                    }
                },
                legend: {
                    onClick: (e) => e.stopPropagation()
                }
        },
    });
    window.yearlyChart = myBarChart;
}

/**
 * Compute total received dividends for each month.
 * @param {*} data 
 */
function sumMonth(data) {
    result = {};
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        // break at the end of the data 
        if (row.length != 10) break;

        var date = new Date(Date.parse(row[0]));
        if (!(date.getFullYear() in result)) {
            result[date.getFullYear()] = Array(12).fill(0);
        }
        result[date.getFullYear()][date.getMonth()-1] += parseFloat(row[6].replace(",", "."));
    }
    return result;
}

/**
 * Display 12 month moving average.
 * @param {*} data 
 */
function movingAverage(data) {
    var result = sumMonth(data);

    var labels = [];
    var datapoints = [];

    // sort by year
    var keys = [];
    for (var key in result) {
        keys.push(key);
    }
    keys.sort();

    // update each month card
    var current_year = result[keys[keys.length-1]];
    var currentTime = new Date();
    var currentMonth = currentTime.getMonth();
    var averageMonth = round(current_year.reduce(function(a, b) { return a + b; }, 0)/(currentMonth+1));
    document.getElementById("div-average-month").innerHTML = averageMonth.toLocaleString("se-SE") + " SEK";

    for (const key of keys) {
        var months = result[key];
        for (var i = 0; i < months.length; i++) {
            var date = new Date(key,i+1,1);
            labels.push(date);
            datapoints.push({t:date, y:round(months[i])});
        }
    }

    var movingAvg = [];
    var factor = 12
    // calculate moving average
    for (var i = 0; i < datapoints.length; i++) {
        var sum = 0
        for (var j = 0; j < factor; j++) {
            var index = i-j;
            if (!(index < 0)) {
                sum += datapoints[i-j]['y'];
            }
        }
        movingAvg[i] = round(sum/factor);
    }

    // draw chart
    var ctx = document.getElementById('moving-avg-divs').getContext('2d');
    var barGradient = ctx.createLinearGradient(0, 0, 0, 400);
    barGradient.addColorStop(0.4, 'rgba(142,196,229,1)');
    barGradient.addColorStop(1, 'rgba(30,134,198,1)');   
    var mixedChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Utdelning',
                data: datapoints,
                backgroundColor: barGradient,
            }, {
                label: '12 månader rullande utdelning',
                data: movingAvg,
                borderColor: 'rgb(207, 79, 79)',
                backgroundColor: "rgba(223,87,87,0)",
    
                // Changes this dataset to become a line
                type: 'line'
            }],
            labels: labels
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        tooltipFormat: 'll',
                        displayFormats: {
                            quarter: 'MMM YYYY'
                        }
                    }
                }],
                yAxes: [
                    {
                        ticks: {
                            callback: function(label, index, labels) {
                                return label/1000+'k';
                            }
                        },
                    }
                ]
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) { 
                        return tooltipItems.yLabel + ' SEK';
                    }
                }
            },
            legend: {
                onClick: (e) => e.stopPropagation()
            }
        }
    });
    window.monthlyChart = mixedChart;
}

function accumulative(data) {
    var labels = [];
    var datapoints = [];
    var sum = 0;
    for (var i = data.length-2; i > 0; i--) {
        var row = data[i];

        var date = new Date(Date.parse(row[0]));
        var amount = parseFloat(row[6].replace(",", "."));
        labels.push(date);
        sum += amount;
        datapoints.push({t:date, y:round(sum)});
    }

    var ctx = document.getElementById('accumulative').getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0.4, 'rgba(142,196,229,0.3)');
    gradient.addColorStop(1, 'rgba(30,134,198,0.7)');  
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
              {
                label: "Total utdelning",
                data: datapoints,
                backgroundColor: gradient, 
                borderColor : "rgba(21,101,151,1)",
                borderWidth: 1,
                lineTension: 0,
              }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                point:{
                    radius: 2
                }
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'month',
                        tooltipFormat: 'll'
                    }
                }],
                yAxes: [
                    {
                        ticks: {
                            callback: function(label, index, labels) {
                                return label/1000+'k';
                            }
                        },
                    }
                ],
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) { 
                        return tooltipItems.yLabel + ' SEK';
                    }
                }
            },
            legend: {
                onClick: (e) => e.stopPropagation()
            }
        }
    });
    window.accumulativeChart = chart;
}