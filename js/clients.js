// Version of the script
var version = "1.0.9";
console.log("Script Version: " + version);

// Google Cloud API key
var apiKey = 'AIzaSyD1fPFIgLPU6uHuM3TLMN4UP0VHIcQLuWo';

var domain = window.location.hostname;
var domainParts = domain.split('.');
var subdomain = domainParts.length > 2 ? domainParts[0] : null;
var mainDomain = domainParts.length > 2 ? domainParts.slice(1).join('.') : domain;

var sheetId = '1bwvWm-HABNjnDPpbCr77XQ1dmw1XmsSwOaAWvxIv5t4';
var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + mainDomain + '?key=' + apiKey;

fetch(url)
    .then(response => response.json())
    .then(data => {
        var page = window.location.pathname;
        var pageParts = page.split('/');
        var pageName = pageParts[pageParts.length - 1].replace('.html', '').replace(/-/g, ' ');

        var headers = data.values[0];
        var personIndex = subdomain ? headers.indexOf(subdomain.toUpperCase() + ':🧑🏻') : headers.indexOf('🧑🏻');
        var phoneIndex = subdomain ? headers.indexOf(subdomain.toUpperCase() + ':📞') : headers.indexOf('📞');
        var messageIndex = subdomain ? headers.indexOf(subdomain.toUpperCase() + ':💬') : headers.indexOf('💬');
        var tagIndex = subdomain ? headers.indexOf(subdomain.toUpperCase() + ':🏷️') : headers.indexOf('🏷️');

        for (var i = 1; i < data.values.length; i++) {
            if (data.values[i][personIndex] && (data.values[i][personIndex].toLowerCase().includes(pageName.toLowerCase()) || data.values[i][personIndex].toLowerCase().includes(pageName.replace(' ', '').toLowerCase()))) {
                console.log('🧑🏻: ' + data.values[i][personIndex]);
                console.log('📞: ' + data.values[i][phoneIndex]);
                console.log('💬: ' + data.values[i][messageIndex]);
                console.log('🏷️: ' + data.values[i][tagIndex]);
                break;
            }
        }
    })
    .catch(err => console.error(err));