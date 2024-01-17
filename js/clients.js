// Include PapaParse library
var script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.1.0/papaparse.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

// Version of the script
var version = "1.0.2";
console.log("Script Version: " + version);

// Wait for PapaParse to load
script.onload = function () {
    var domain = window.location.hostname;
    var sheetId = '1bwvWm-HABNjnDPpbCr77XQ1dmw1XmsSwOaAWvxIv5t4';
    var url = 'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:csv&sheet=' + domain;

    // Use CORS proxy server
    // url = 'https://cors-anywhere.herokuapp.com/' + url;

    Papa.parse(url, {
        download: true,
        header: true,
        complete: function (results) {
            var data = results.data;
            var page = window.location.pathname;
            var pageName = page.split('/')[1].split('.')[0].split('-').slice(-1)[0];

            for (var i = 0; i < data.length; i++) {
                if (data[i]['📍'].toLowerCase().includes(pageName.toLowerCase())) {
                    console.log('🧑🏻: ' + data[i]['🧑🏻']);
                    console.log('📞: ' + data[i]['📞']);
                    console.log('💬: ' + data[i]['💬']);
                    console.log('🏷️: ' + data[i]['🏷️']);
                    break;
                }
            }
        },
        error: function(err, file, inputElem, reason) {
            console.error("Error:", err);
            console.error("File:", file);
            console.error("Input Element:", inputElem);
            console.error("Reason:", reason);
        }
    });
};

script.onerror = function() {
    console.error("Failed to load PapaParse library");
};