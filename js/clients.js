// Include PapaParse library
var script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.1.0/papaparse.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

// Version of the script
var version = "1.0.3";
console.log("Script Version: " + version);

// Array of CORS proxy servers
var corsProxies = [
    'https://cors-anywhere.herokuapp.com/',
    'https://cors-proxy.htmldriven.com/?url=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://api.allorigins.win/get?url=${encodeURIComponent("',
    'https://proxy.cors.sh/'
];

// Wait for PapaParse to load
script.onload = function () {
    var domain = window.location.hostname;
    var sheetId = '1bwvWm-HABNjnDPpbCr77XQ1dmw1XmsSwOaAWvxIv5t4';
    var url = 'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:csv&sheet=' + domain;

    // Recursive function to try each CORS proxy server
    function tryCorsProxies(index) {
        if (index >= corsProxies.length) {
            console.error("All CORS proxy servers failed");
            return;
        }

        var corsUrl = corsProxies[index] + url;

        Papa.parse(corsUrl, {
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

                // Try next CORS proxy server
                tryCorsProxies(index + 1);
            }
        });
    }

    // Start with first CORS proxy server
    tryCorsProxies(0);
};

script.onerror = function() {
    console.error("Failed to load PapaParse library");
};