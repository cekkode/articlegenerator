function loadPapaParse(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
    script.onload = callback;
    document.head.appendChild(script);
}

var version = '0.0.14';
console.log("US Clients Version: " + version);

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

// Function to replace placeholders within specific elements
function replacePlaceholders(row, placeholderMap) {
    // Select all elements that might contain placeholders
    const elements = document.querySelectorAll('a, title, p, h1, h2, h3, h4, h5, h6');

    elements.forEach(element => {
        let content = element.innerHTML;
        for (const [placeholder, header] of Object.entries(placeholderMap)) {
            if (row[header]) {
                // Replace newlines with <br> for HTML display
                const safeContent = row[header].replace(/\n/g, '<br>');
                // Replace all occurrences of the placeholder with the corresponding data
                content = content.split(placeholder).join(safeContent);
            }
        }
        element.innerHTML = content;
    });
}

// Step 3: Parse the data and find the matching row
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

async function fetchData(sheetName) {
    const gid = sheetGidMap[sheetName.toUpperCase()];
    if (!gid) {
        console.error('Invalid sheet name');
        return null;
    }
    const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTDTTAc6YiatUsUAACaDo5RcnK2M4wKsktznsh16Vc-S5DSjz6hW_WmRRLNZ-l0Z91glgOSZDdGRYZd/pub?gid=${gid}&single=true&output=csv`;
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

async function findData() {
    if (!sheetName || !searchKey) {
        return;
    }

    const cacheKey = `${sheetName}-${searchKey}`;
    let csvData = localStorage.getItem(cacheKey) || getCookie(cacheKey);

    if (!csvData) {
        try {
            csvData = await fetchData(sheetName);
            if (!csvData) return;

            // Store the fetched data in local storage and cookies
            localStorage.setItem(cacheKey, csvData);
            setCookie(cacheKey, csvData, 7); // Store for 7 days
        } catch (error) {
            console.error('Error fetching or processing data:', error);
            return;
        }
    }

    // Use PapaParse to parse the CSV data
    const parsedData = Papa.parse(csvData, { header: true });
    const rows = parsedData.data;

    const paramIndex = parsedData.meta.fields.indexOf('PARAM');

    if (paramIndex === -1) {
        console.error('PARAM column not found');
        return;
    }

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

    for (const row of rows) {
        if (row['PARAM'] && row['PARAM'].toLowerCase() === searchKey.toLowerCase()) {
            replacePlaceholders(row, placeholderMap);
            break;
        }
    }
}

// Load PapaParse and then execute findData
loadPapaParse(findData);