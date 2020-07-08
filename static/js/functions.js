window.onload = function() {
    // parse if user selects file
    var inputElement = document.getElementById("myfile");
    inputElement.onchange = function(event) {
        var fileList = inputElement.files;
        parseFile(fileList[0]);
        //document.getElementById("input-container").style.visibility = "hidden";
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
    for (var i = 0; i < data.length; i++) {
        if (i == 0) continue;
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

    data = [];
    for (const key of keys) {
        var value = round(years[key]);
        data.push(value);
    }

    // draw chart
    var ctx = document.getElementById('yearly-divs').getContext('2d');
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: keys,
            datasets: [
              {
                label: "Utdelning",
                data: data,
                backgroundColor: "rgba(98,173,222,1)"
              }
            ]
          },
        options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Utdelning per år',         
                },
        },
    });
}

function sumMonth(data) {
    result = {};
    for (var i = 0; i < data.length; i++) {
        if (i == 0) continue;
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
        movingAvg[i] = sum/factor;
    }

    // draw chart
    var ctx = document.getElementById('moving-avg-divs').getContext('2d');
    var mixedChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Utdelning',
                data: datapoints,
                backgroundColor: "rgba(98,173,222,1)",
            }, {
                label: '12 månader rullande utdelning',
                data: movingAvg,
                borderColor: "rgba(223,87,87,1)",
                backgroundColor: "rgba(223,87,87,0)",
    
                // Changes this dataset to become a line
                type: 'line'
            }],
            labels: labels
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Utdelning per månad',         
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            quarter: 'MMM YYYY'
                        }
                    }
                }]
    
            }
        }
    });
}