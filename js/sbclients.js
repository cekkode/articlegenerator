var version = "0.0.17";
console.log("Supabase Client JS Script Version: " + version);

var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
document.head.appendChild(script);

script.onload = async function() {
  const supabaseUrl = 'https://mwikqvfpuxttqjucmhoj.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aWtxdmZwdXh0dHFqdWNtaG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1MjU1NjUsImV4cCI6MjAyMTEwMTU2NX0.GXfqYXnP7owuTb24UpYDDRB0ZAXyHLVuuBbzubwsrWM';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Test connection
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('testing')
            .select('*')
            .limit(1);
        if (error) {
            console.error('Error connecting to Supabase:', error.message);
        } else {
            console.log('Successfully connected to Supabase. Data:', data);
        }
    } catch (error) {
        console.error('Error connecting to Supabase:', error.message);
    }
}

testConnection();

var domain = window.location.hostname;
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

var validMainDomain = mainDomain.replace(/\./g, '_');

var storedVersion = localStorage.getItem('version');
var data = localStorage.getItem('sheetData');
var lastFetch = localStorage.getItem('lastFetch');

if (data && lastFetch && new Date().getTime() - lastFetch < 24 * 60 * 60 * 1000 && version === storedVersion) {
    processData(JSON.parse(data));
} else {
    console.log('Accessing table:', mainDomain);
    let { data: MainDomain, error } = await supabase
        .from(mainDomain)
        .select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Fetched data:', MainDomain); // Log the fetched data
        localStorage.setItem('version', version);
        localStorage.setItem('sheetData', JSON.stringify(MainDomain));
        localStorage.setItem('lastFetch', new Date().getTime());
        processData(MainDomain);
    }
}

function processData(data) {
    console.log('Processing data:', data); // Log the data being processed
    var page = window.location.pathname;
    var pageParts = page.split('/');
    var pageName = pageParts[pageParts.length - 1].replace('.html', '').replace(/-/g, ' ');

  // Convert pageName to title case
  pageName = pageName.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    for (var i = 0; i < data.length; i++) {
        if (data[i]['📍'] && (data[i]['📍'].toLowerCase().includes(pageName.toLowerCase()) || data[i]['📍'].toLowerCase().includes(pageName.replace(' ', '').toLowerCase()))) {
            var person = data[i][subdomain ? subdomain + '🧑🏻' : '🧑🏻'];
            var number = data[i][subdomain ? subdomain + '#️⃣' : '#️⃣'];
            var track = data[i][subdomain ? subdomain + '📊' : '📊'];
            var phone = data[i][subdomain ? subdomain + '📞' : '📞'];
            var message = data[i][subdomain ? subdomain + '💬' : '💬'];
            var tag = data[i][subdomain ? subdomain + '🏷️' : '🏷️'];

            console.log('🧑🏻: ' + person);
            console.log('#️⃣: ' + number);
            console.log('📊: ' + track);
            console.log('📞: ' + phone);
            console.log('💬: ' + message);
            console.log('🏷️: ' + tag);

            var whatsappFloating = document.querySelector('.whatsapp-floating a');
            var tlpFloating = document.querySelector('.tlp-floating a');

            var displayNumber = number.startsWith('62') ? '0' + number.slice(2) : number;
            displayNumber = displayNumber.replace(/(\d{4})/g, '$1 ').trim();

            if (whatsappFloating) {
                whatsappFloating.href = track.startsWith('https://') ? track + '/' + message : 'https://' + track + '/' + message;
                whatsappFloating.innerHTML = `<img src="https://1.bp.blogspot.com/-Y1SNUYeVK44/XhZwF187--I/AAAAAAAAHfA/lfOZFsZCF885e8rLL6NleS8vxHTcz_v1ACLcBGAsYHQ/s1600/whatsapp%2Bicon.png" alt="whatsapp" style="height:18px !important; margin-right:5px;  margin-top:7px;  cursor:pointer; float:left;"><span style="float:right;">${displayNumber} (${person})</span>`;
            }

            if (tlpFloating) {
                tlpFloating.href = track.startsWith('https://') ? track + '/' + phone : 'https://' + track + '/' + phone;
                tlpFloating.innerHTML = `<img src="https://1.bp.blogspot.com/-37NtuGBQHdw/XhZwF_W04vI/AAAAAAAAHe8/6QEm7CRzPoMfN01Yl3stD89xpmuFUcTyQCLcBGAsYHQ/s1600/phone%2Bicon.png" alt="whatsapp" style="height:18px !important; margin-right:5px;  margin-top:7px;  cursor:pointer; float:left;"><span style="float:right;">${displayNumber} (${person})</span>`;
            }

            break;
        }
    }
}};