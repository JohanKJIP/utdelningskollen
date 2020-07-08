window.onload = function() {
    // parse if user selects file
    var inputElement = document.getElementById("myfile");
    inputElement.onchange = function(event) {
        var fileList = inputElement.files;
        parseFile(fileList[0]);
        console.log("heerre");
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
        }
    });
}

/**
 * Dislay total dividens received for each year.
 * @param {*} data 
 */
function yearlyDividends(data) {
    console.log(data)
    
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
        var value = Math.round((years[key] + Number.EPSILON) * 100) / 100;
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
                backgroundColor: "rgba(98,173,222,0.5)"
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