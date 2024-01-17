// Version of the script
var version = "1.1.1";
console.log("Script Version: " + version);

// Google Cloud API key
var apiKey = 'AIzaSyD1fPFIgLPU6uHuM3TLMN4UP0VHIcQLuWo';

var domain = window.location.hostname;
console.log("Domain: " + domain);

var domainParts = domain.split('.');
var subdomain = null;
var mainDomain = null;

if (domainParts.length === 3 && domainParts[1].length === 2) {
    mainDomain = domainParts.join('.');
} else if (domainParts.length > 2) {
    subdomain = domainParts[0].toUpperCase();
    mainDomain = domainParts.slice(1).join('.');
} else {
    mainDomain = domain;
}

console.log("Subdomain: " + subdomain);
console.log("Main Domain: " + mainDomain);

var sheetId = '1bwvWm-HABNjnDPpbCr77XQ1dmw1XmsSwOaAWvxIv5t4';
var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + mainDomain + '?key=' + apiKey;

console.log("URL: " + url);

fetch(url)
    .then(response => {
        console.log("Response: ", response);
        return response.json();
    })
    .then(data => {
        console.log("Data: ", data);

        var page = window.location.pathname;
        var pageParts = page.split('/');
        var pageName = pageParts[pageParts.length - 1].replace('.html', '').replace(/-/g, ' ');

        console.log("Page Name: " + pageName);

        var headers = data.values[0];
        var personIndex = subdomain ? headers.indexOf(subdomain + ':🧑🏻') : headers.indexOf('🧑🏻');
        var phoneIndex = subdomain ? headers.indexOf(subdomain + ':📞') : headers.indexOf('📞');
        var messageIndex = subdomain ? headers.indexOf(subdomain + ':💬') : headers.indexOf('💬');
        var tagIndex = subdomain ? headers.indexOf(subdomain + ':🏷️') : headers.indexOf('🏷️');

        console.log("Indices: ", personIndex, phoneIndex, messageIndex, tagIndex);

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