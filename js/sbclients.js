var version = "0.0.81";
console.log("Supabase Client JS Script Version: " + version);

var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
document.head.appendChild(script);

// Fetch data from Supabase
const fetchData = async (supabase, mainDomain, columnPrefix, firstRowDate) => {
    const { data, error } = await supabase
        .from(mainDomain)
        .select(`"📍", "${columnPrefix}🧑🏻", "${columnPrefix}#️⃣", "${columnPrefix}📊", "${columnPrefix}📞", "${columnPrefix}💬", "${columnPrefix}🏷️", "${columnPrefix}🏢"`);
        
    if (error) {
        console.error('Error fetching data:', error);
        return null;
    }

    // If no data is returned or no column with columnPrefix, then only access column which has no columnPrefix at all
    if (!data || data.length === 0 || !data[0].hasOwnProperty(`${columnPrefix}🧑🏻`)) {
        const { data, error } = await supabase
            .from(mainDomain)
            .select('"📍", "🧑🏻", "#️⃣", "📊", "📞", "💬", "🏷️", "🏢"');

        if (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    // Store data in localStorage
    localStorage.setItem('data', JSON.stringify(data));
    localStorage.setItem('timestamp', Date.now());
    localStorage.setItem('version', version);
    localStorage.setItem('firstRowDate', firstRowDate);

    return data;
};

// Get data from cache or fetch new data
const getData = async (supabase, mainDomain, columnPrefix) => {
    const cachedData = localStorage.getItem('data');
    const timestamp = localStorage.getItem('timestamp');
    const cachedVersion = localStorage.getItem('version');
    const cachedFirstRowDate = localStorage.getItem('firstRowDate');
    const { data: firstRowData, error: firstRowError } = await supabase
        .from(mainDomain)
        .select(`"📅"`)
        .limit(1)
        .single();

    if (firstRowError) {
        console.error('Error fetching first row data:', firstRowError);
        return JSON.parse(cachedData); // Return cached data if error occurs while fetching first row data
    }

    const firstRowDate = firstRowData ? firstRowData["📅"] : null;

    if (cachedFirstRowDate) {
        console.log(`Cached 📅: ${cachedFirstRowDate} = 📅: ${firstRowDate}? ${firstRowDate === cachedFirstRowDate}`);
    } else {
        console.log('No cached 📅 found.');
    }

    // If data is not in cache or data is older than one year or version has changed, or 📅 column value has changed, fetch new data
    if (!cachedData || !timestamp || Date.now() - timestamp > 365 * 24 * 60 * 60 * 1000 || version !== cachedVersion || (cachedFirstRowDate && firstRowDate !== cachedFirstRowDate)) {
        console.log('Fetching new data...');
        return await fetchData(supabase, mainDomain, columnPrefix, firstRowDate);
    }

    console.log('Using cached data...');
    // Otherwise, return cached data
    return JSON.parse(cachedData);
};

const replaceFooterAddressWithFetchedData = (addressData) => {
    const footer = document.querySelector('footer');
    const addressRegex = /(?:Jl\.|Jalan|No\.|Komp\.|Komplek|Ruko)[^<,]+[0-9]{5}/gi;
  
    if (footer && footer.innerHTML.match(addressRegex)) {
      footer.innerHTML = footer.innerHTML.replace(addressRegex, addressData);
    }
};

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
    var pageName = pageParts[pageParts.length - 1].replace('.html', '').toLowerCase();

    if (pageName === '') {
        pageName = '(DEFAULT)';
    }

    const pageNameParts = pageName.split('-');
    console.log('pageName:', pageName);
    console.log('pageNameParts:', pageNameParts);
    console.log('Accessing table:', mainDomain);

    // Determine the column prefix based on whether the script is executed from a subdomain
    let columnPrefix = subdomain ? subdomain.toUpperCase() : '';
    console.log('columnPrefix:', columnPrefix);

    // Then pass supabase, mainDomain, and columnPrefix to getData
    const data = await getData(supabase, mainDomain, columnPrefix);
    console.log('Fetched data:', data); // Log the fetched data

    // Check if there's a row with address data and replace the footer address
    if (data && data.length > 0) {
        const addressRow = data.find(row => row.hasOwnProperty(columnPrefix + '🏢'));
        if (addressRow) {
            replaceFooterAddressWithFetchedData(addressRow[columnPrefix + '🏢']);
        }
    }

    // Find the row that matches the pageName
    const row = data.find(item => {
        if (pageName === '(DEFAULT)') {
            return item['📍'] === pageName;
        } else {
            return pageNameParts.some(part => item['📍'] && item['📍'].toLowerCase() === part);
        }
    });

    if (row) {
        // Check if the column with the prefix exists, if not, try with a space after the prefix
        if (!row.hasOwnProperty(columnPrefix + '🧑🏻')) {
        columnPrefix += ' ';
        }
    
        // Check if the column with the prefix exists, if not, try with lowercase prefix
        if (!row.hasOwnProperty(columnPrefix + '🧑🏻')) {
        columnPrefix = subdomain ? subdomain.toLowerCase() : '';
        }
    
        // Log the required data
        console.log(columnPrefix + '🧑🏻: ' + row[columnPrefix + '🧑🏻']);
        console.log(columnPrefix + '#️⃣: ' + row[columnPrefix + '#️⃣']);
        console.log(columnPrefix + '📊: ' + row[columnPrefix + '📊']);
        console.log(columnPrefix + '📞: ' + row[columnPrefix + '📞']);
        console.log(columnPrefix + '💬: ' + row[columnPrefix + '💬']);
        console.log(columnPrefix + '🏷️: ' + row[columnPrefix + '🏷️']);
        console.log(columnPrefix + '🏢: ' + row[columnPrefix + '🏢']);

        // Format the phone number
        const formattedNumber = row[columnPrefix + '#️⃣'].replace(/^62/, '0').replace(/(\d{4})(?=\d)/g, '$1 ');
    
        // Get the HTML elements
        const whatsappFloat = document.querySelector('.whatsapp-floating');
        const whatsappElement = document.querySelector('.whatsapp-floating a');
        const whatsappSpan = whatsappElement.querySelector('span');
        const tlpFloat = document.querySelector('.tlp-floating');
        const tlpElement = document.querySelector('.tlp-floating a');
        const tlpSpan = tlpElement.querySelector('span');

        // Get all text nodes in the document
        var textNodes = [];
        var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        while (node = walk.nextNode()) {
            textNodes.push(node);
        }

        // Define the regexPhone pattern to match the phone number and name format
        var regexPhone = /\d{4} \d{4} \d{4} \((.*?)\)/g;

        // Flag to check if data should be hidden
        var shouldHide = row[columnPrefix + '🧑🏻'] === 'HIDE' || row[columnPrefix + '#️⃣'] === 'HIDE' || row[columnPrefix + '📊'] === 'HIDE' || row[columnPrefix + '📞'] === 'HIDE' || row[columnPrefix + '💬'] === 'HIDE' || row[columnPrefix + '🏷️'] === 'HIDE';

        if (shouldHide) {
            whatsappFloat.style.cssText = 'display: none; visibility: hidden;';
            tlpFloat.style.cssText = 'display: none; visibility: hidden;';
        } else {
            // Update the href and text content of the whatsappElement
            whatsappElement.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'];
            whatsappSpan.textContent = formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')';

            // Update the href and text content of the tlpElement
            tlpElement.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '📞'];
            tlpSpan.textContent = formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')';
        }

        // Get all anchor tags in the document
        var anchorTags = document.querySelectorAll('a');

        // Iterate over each anchor tag
        anchorTags.forEach(function(anchor) {
            // If the href attribute contains the specific URL
            if (anchor.href.includes('what.sapp.my.id')) {
                // If data should be hidden, remove the anchor tag altogether
                if (shouldHide) {
                    anchor.remove();
                } else {
                    // Otherwise, update the href attribute
                    anchor.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'];
                }
            } else if (anchor.href.includes('con.tact.my.id')) {
                // If data should be hidden, remove the anchor tag altogether
                if (shouldHide) {
                    anchor.remove();
                } else {
                    // Otherwise, update the href attribute
                    anchor.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '📞'];
                }
            } else if (anchor.href.includes('mailto:')) {
                // Remove any spaces or %20 in the href attribute
                anchor.href = anchor.href.replace(/\s/g, '').replace(/%20/g, '');
            }
        });

        // Iterate over each text node
        textNodes.forEach(function(node) {
            // If the node's text matches the regexPhone pattern
            if (regexPhone.test(node.nodeValue)) {

                // Check if the parent node contains a font awesome phone icon
                var hasFontAwesomePhoneIcon = node.parentNode && node.parentNode.querySelector && node.parentNode.querySelector('i[class*="fa-phone"], i[class*="fas fa-phone"], i[class*="far fa-phone"], i[class*="fal fa-phone"], i[class*="fad fa-phone"]');

                // If the node has a parent and the parent is not an anchor tag
                if (node.parentNode && node.parentNode.nodeName !== 'A') {
                    // Create a new anchor tag
                    var anchor = document.createElement('a');
                    // Set the href attribute of the anchor tag
                    anchor.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'];
                    // Replace the text node with the new anchor tag
                    node.parentNode.replaceChild(anchor, node);
                    // Set the text content of the anchor tag
                    anchor.textContent = shouldHide ? node.nodeValue.replace(regexPhone, '') : (hasFontAwesomePhoneIcon ? '' : '📞 ') + formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')';

                    // Get the computed style of the anchor tag
                    var style = window.getComputedStyle(anchor);
                    // Get the background color
                    var backgroundColor = style.backgroundColor;
                    // Convert the background color to RGB
                    var rgb = backgroundColor.replace(/[^\d,]/g, '').split(',');
                    // Calculate the brightness
                    var brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
                    // If the brightness is less than 125, set the color of the anchor tag to white
                    if (brightness < 125) {
                        anchor.style.color = 'white';
                    } else {
                        // Otherwise, set the color of the anchor tag to black
                        anchor.style.color = 'black';
                    }
                } else if (node.parentNode) {
                    // Replace the matched text based on the shouldHide flag
                    node.nodeValue = shouldHide ? node.nodeValue.replace(regexPhone, '') : (hasFontAwesomePhoneIcon ? '' : '📞 ') + formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')';
                }
            }
        });
    }
}