var version = '0.0.6';
console.log("US Clients Version: "+version);

// Step 1: Extract the URL parameter
function getURLParameter() {
    const query = window.location.search.substring(1);
    return query ? query.split('-') : [];
}

// Extract the sheet name and search key from the URL
let [sheetName, searchKey] = getURLParameter();

// Mapping of sheet names to their respective gid values
const sheetGidMap = {
    'AL': '604141272',
    'AK': '1934406001',
    'AZ': '383221352',
    'AR': '520460863',
    'CA': '1033875458',
    'CO': '759754201',
    'FL': '1270348399'
};

// Step 2: Fetch the data from the appropriate Google Sheets CSV URL
async function fetchData(sheetName) {
    const gid = sheetGidMap[sheetName.toUpperCase()];
    if (!gid) {
        console.error('Invalid sheet name');
        return null;
    }
    const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTDTTAc6YiatUsUAACaDo5RcnK2M4wKsktznsh16Vc-S5DSjz6hW_WmRRLNZ-l0Z91glgOSZDdGRYZd/pub?gid=${gid}&single=true&output=csv`;
    const response = await fetch(url);
    const data = await response.text();
    console.log('Fetched CSV Data:', data); // Log the fetched data
    return data;
}

// Step 3: Parse the data and find the matching row
async function findData() {
    if (!sheetName || !searchKey) {
        // If no valid parameter is provided, do nothing
        return;
    }

    try {
        const csvData = await fetchData(sheetName);
        if (!csvData) return;

        const rows = csvData.split('\n');
        const headers = rows[0].split(',');
        const paramIndex = headers.indexOf('PARAM');

        if (paramIndex === -1) {
            // If the PARAM column is not found, exit the function
            console.error('PARAM column not found');
            return;
        }

        // Mapping of placeholders to column headers
        const placeholderMap = {
            '[LABEL]': '🏷️',
            '[BUSINESS]': '🏢',
            '[ADDRESS]': '📍',
            '[PHONE]': '📞',
            '[EMAIL]': '📧',
            '[SLOGAN]': '📣',
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
            if (row[paramIndex] && row[paramIndex].toLowerCase() === searchKey.toLowerCase()) {
                console.log('Matching Row:', row); // Log the matching row
                // Step 4: Replace placeholders on the page
                for (const [placeholder, header] of Object.entries(placeholderMap)) {
                    const columnIndex = headers.indexOf(header);
                    if (columnIndex !== -1 && row[columnIndex]) {
                        document.body.innerHTML = document.body.innerHTML.replace(new RegExp(placeholder, 'g'), row[columnIndex]);
                    }
                }
                break;
            }
        }
    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
}

findData();