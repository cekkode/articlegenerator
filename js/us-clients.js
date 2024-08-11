var version = '0.0.3';
console.log("US Clients Version: "+version);

// Step 1: Extract the URL parameter
function getURLParameter() {
    const query = window.location.search.substring(1);
    return query.split('-');
}

// Extract the sheet name and search key from the URL
let [sheetName, searchKey] = getURLParameter();

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

    // Mapping of placeholders to column headers
    const placeholderMap = {
        '[LABEL]': '🏷️',
        '[BUSINESS]': '🏢',
        '[ADDRESS]': '📍',
        '[PHONE]': '📞',
        '[EMAIL]': '📧',
        '[TAGLINE]': '📣',
        '[PERIOD]': '📅',
        '[AREA]': '🗺️',
        '[SERVICE1]': '1️⃣',
        '[SERVICE2]': '2️⃣',
        '[SERVICE3]': '3️⃣',
        '[SERVICE4]': '4️⃣',
        '[SERVICE5]': '5️⃣',
        '[SERVICE6]': '6️⃣',
        '[SERVICE7]': '7️⃣',
        '[SERVICE8]': '8️⃣',
        '[SERVICE9]': '9️⃣'
    };

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        if (row[paramIndex].toLowerCase() === searchKey.toLowerCase()) {
            // Step 4: Replace placeholders on the page
            for (const [placeholder, header] of Object.entries(placeholderMap)) {
                const columnIndex = headers.indexOf(header);
                if (columnIndex !== -1) {
                    document.body.innerHTML = document.body.innerHTML.replace(new RegExp(placeholder, 'g'), row[columnIndex]);
                }
            }
            break;
        }
    }
}

findData();