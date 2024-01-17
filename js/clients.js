// Version of the script
var version = "1.0.7";
console.log("Script Version: " + version);

// Google Cloud API key
var apiKey = 'AIzaSyD1fPFIgLPU6uHuM3TLMN4UP0VHIcQLuWo';

var domain = window.location.hostname;
var sheetId = '1bwvWm-HABNjnDPpbCr77XQ1dmw1XmsSwOaAWvxIv5t4';
var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + domain + '?key=' + apiKey;

fetch(url)
    .then(response => response.json())
    .then(data => {
        var page = window.location.pathname;
        var pageName = page.split('/')[2].split('.')[0];

        var headers = data.values[0];
        var locationIndex = headers.indexOf('📍');
        var personIndex = headers.indexOf('🧑🏻');
        var phoneIndex = headers.indexOf('📞');
        var messageIndex = headers.indexOf('💬');
        var tagIndex = headers.indexOf('🏷️');

        for (var i = 1; i < data.values.length; i++) {
            if (data.values[i][locationIndex] && data.values[i][locationIndex].toLowerCase().includes(pageName.toLowerCase())) {
                console.log('🧑🏻: ' + data.values[i][personIndex]);
                console.log('📞: ' + data.values[i][phoneIndex]);
                console.log('💬: ' + data.values[i][messageIndex]);
                console.log('🏷️: ' + data.values[i][tagIndex]);
                break;
            }
        }
    })
    .catch(err => console.error(err));