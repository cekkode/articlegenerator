// Include PapaParse library
var script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.1.0/papaparse.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

// Version of the script
var version = "1.0.6";
console.log("Script Version: " + version);

// Google Cloud API key
var apiKey = 'AIzaSyD1fPFIgLPU6uHuM3TLMN4UP0VHIcQLuWo';

// Wait for PapaParse to load
script.onload = function () {
    var domain = window.location.hostname;
    var sheetId = '1bwvWm-HABNjnDPpbCr77XQ1dmw1XmsSwOaAWvxIv5t4';
    var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + domain + '?key=' + apiKey;

    Papa.parse(url, {
        download: true,
        header: true,
        complete: function (results) {
            var data = results.data;
            var page = window.location.pathname;
            var pageName = page.split('/')[2].split('.')[0]; // Corrected this line

            for (var i = 0; i < data.length; i++) {
                if (data[i]['📍'] && data[i]['📍'].toLowerCase().includes(pageName.toLowerCase())) {
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