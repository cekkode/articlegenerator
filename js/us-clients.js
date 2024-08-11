var version = '0.0.1';

// Step 1: Extract the URL parameter
function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// Assuming the parameter name is the state abbreviation followed by the city name
let param = getURLParameter('fl-clearwater');
let [state, searchKey] = param.split('-');

// Step 2: Fetch the data from Google Sheets
async function fetchData() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDTTAc6YiatUsUAACaDo5RcnK2M4wKsktznsh16Vc-S5DSjz6hW_WmRRLNZ-l0Z91glgOSZDdGRYZd/pub?output=csv';
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

// Step 3: Parse the data and find the matching row
async function findData() {
    const csvData = await fetchData();
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');
    const paramIndex = headers.indexOf('PARAM');
    const businessIndex = headers.indexOf('🏢');

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        if (row[paramIndex].toLowerCase() === searchKey.toLowerCase()) {
            // Step 4: Replace placeholders on the page
            document.body.innerHTML = document.body.innerHTML.replace('[BUSINESS]', row[businessIndex]);
            break;
        }
    }
}

findData();