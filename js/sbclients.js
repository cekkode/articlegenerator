var version = "0.0.40";
console.log("Supabase Client JS Script Version: " + version);

var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
document.head.appendChild(script);

script.onload = async function() {
  const supabaseUrl = 'https://mwikqvfpuxttqjucmhoj.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aWtxdmZwdXh0dHFqdWNtaG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1MjU1NjUsImV4cCI6MjAyMTEwMTU2NX0.GXfqYXnP7owuTb24UpYDDRB0ZAXyHLVuuBbzubwsrWM';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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

var page = window.location.pathname;
var pageParts = page.split('/');
var pageName = pageParts[pageParts.length - 1].replace('.html', '').replace(/[-\s]/g, '').toLowerCase();
console.log('pageName:', pageName);

var storedVersion = localStorage.getItem('version');

console.log('Accessing table:', mainDomain);
const { data, error } = await supabase
    .from(mainDomain)
    .select('*');
    console.log('Fetched data:', data); // Log the fetched data

// Find the row that matches the pageName
const row = data.find(item => item['📍'].toLowerCase() === pageName);

if (row) {
    // Determine the column prefix based on whether the script is executed from a subdomain
    let columnPrefix = subdomain ? subdomain.toUpperCase() : '';
  
    // Check if the column with the prefix exists, if not, try with a space after the prefix
    if (!row.hasOwnProperty(columnPrefix + '🧑🏻')) {
      columnPrefix += ' ';
    }
  
    // Check if the column with the prefix exists, if not, try with lowercase prefix
    if (!row.hasOwnProperty(columnPrefix + '🧑🏻')) {
      columnPrefix = subdomain ? subdomain.toLowerCase() : '';
    }
   
    // Log the required data
    console.log('🧑🏻: ' + row[columnPrefix + '🧑🏻']);
    console.log('#️⃣: ' + row[columnPrefix + '#️⃣']);
    console.log('📊: ' + row[columnPrefix + '📊']);
    console.log('📞: ' + row[columnPrefix + '📞']);
    console.log('💬: ' + row[columnPrefix + '💬']);
    console.log('🏷️: ' + row[columnPrefix + '🏷️']);

    // Format the phone number
    const formattedNumber = row[columnPrefix + '#️⃣'].replace(/^62/, '0').replace(/(\d{4})(?=\d)/g, '$1 ');
  
    // Get the HTML elements
    const whatsappElement = document.querySelector('.whatsapp-floating a');
    const whatsappSpan = whatsappElement.querySelector('span');
    const tlpElement = document.querySelector('.tlp-floating a');
    const tlpSpan = tlpElement.querySelector('span');
  
    // Update the href and text content of the whatsappElement
    whatsappElement.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'];
    whatsappSpan.textContent = formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')';
  
    // Update the href and text content of the tlpElement
    tlpElement.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '📞'];
    tlpSpan.textContent = formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')';
  }}