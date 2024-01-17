// Include PapaParse library
var script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

// Wait for PapaParse to load
script.onload = function () {
    var domain = window.location.hostname;
    var sheetId = '1bwvWm-HABNjnDPpbCr77XQ1dmw1XmsSwOaAWvxIv5t4';
    var url = 'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:csv&sheet=' + domain;

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
        }
    });
};
