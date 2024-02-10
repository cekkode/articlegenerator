var version = "0.0.94";
console.log("Supabase Client JS Script Version: " + version);

var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
document.head.appendChild(script);

const fetchData = async (supabase, mainDomain, columnPrefix) => {
    let selectColumns = `"📍", "${columnPrefix}🧑🏻", "${columnPrefix}#️⃣", "${columnPrefix}📊", "${columnPrefix}📞", "${columnPrefix}💬", "${columnPrefix}🏷️", "${columnPrefix}🏢"`;
    const { data, error } = await supabase.from(mainDomain).select(selectColumns);

    if (error) {
        console.error('Error fetching data:', error);
        return null;
    }

    if (!data || data.length === 0 || !data[0].hasOwnProperty(`${columnPrefix}🧑🏻`)) {
        selectColumns = '"📍", "🧑🏻", "#️⃣", "📊", "📞", "💬", "🏷️", "🏢"';
        const fallbackResult = await supabase.from(mainDomain).select(selectColumns);
        if (fallbackResult.error) {
            console.error('Error fetching fallback data:', fallbackResult.error);
            return null;
        }
        return fallbackResult.data;
    }

    return data;
};

const getData = async (supabase, mainDomain, columnPrefix) => {
    const cache = {
        data: localStorage.getItem('data'),
        timestamp: localStorage.getItem('timestamp'),
        version: localStorage.getItem('version'),
        firstRowDate: localStorage.getItem('firstRowDate')
    };

    const { data: firstRowData, error: firstRowError } = await supabase.from(mainDomain).select(`"📅"`).limit(1).single();

    if (firstRowError) {
        console.error('Error fetching first row data:', firstRowError);
        return cache.data ? JSON.parse(cache.data) : null;
    }

    const firstRowDate = firstRowData ? firstRowData["📅"] : null;
    console.log(`Cached 📅: ${cache.firstRowDate} = 📅: ${firstRowDate}? ${firstRowDate === cache.firstRowDate}`);

    if (!cache.data || !cache.timestamp || Date.now() - cache.timestamp > 365 * 24 * 60 * 60 * 1000 || version !== cache.version || (cache.firstRowDate && firstRowDate !== cache.firstRowDate)) {
        console.log('Fetching new data...');
        const newData = await fetchData(supabase, mainDomain, columnPrefix);
        if (newData) {
            localStorage.setItem('data', JSON.stringify(newData));
            localStorage.setItem('timestamp', Date.now());
            localStorage.setItem('version', version);
            localStorage.setItem('firstRowDate', firstRowDate);
        }
        return newData;
    }

    console.log('Using cached data...');
    return JSON.parse(cache.data);
};

const updateUIWithFetchedData = (data, columnPrefix) => {
    const replaceFooterAddressWithFetchedData = (addressData) => {
        const footer = document.querySelector('footer');
        const addressRegex = /(?:Jl\.|Jalan|No\.|Komp\.|Komplek|Ruko)[^<,]+[0-9]{5}/gi;
      
        if (footer && footer.innerHTML.match(addressRegex)) {
          footer.innerHTML = footer.innerHTML.replace(addressRegex, addressData);
        }
    };

    const updateContactInfo = (row) => {
        const formattedNumber = row[columnPrefix + '#️⃣'].replace(/^62/, '0').replace(/(\d{4})(?=\d)/g, '$1 ');
        const whatsappFloat = document.querySelector('.whatsapp-floating');
        const whatsappElement = document.querySelector('.whatsapp-floating a');
        const whatsappSpan = whatsappElement.querySelector('span');
        const tlpFloat = document.querySelector('.tlp-floating');
        const tlpElement = document.querySelector('.tlp-floating a');
        const tlpSpan = tlpElement.querySelector('span');

        if (row[columnPrefix + '🧑🏻'] === 'HIDE' || row[columnPrefix + '#️⃣'] === 'HIDE') {
            whatsappFloat.style.display = 'none';
            tlpFloat.style.display = 'none';
        } else {
            whatsappElement.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'];
            whatsappSpan.textContent = formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')';
            tlpElement.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '📞'];
            tlpSpan.textContent = formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')';
        }
    };

    const updateAnchorsAndTextNodes = (row) => {
        const formattedNumber = row[columnPrefix + '#️⃣'].replace(/^62/, '0').replace(/(\d{4})(?=\d)/g, '$1 ');
        const regexPhone = /\d{4} \d{4} \d{4} \((.*?)\)/g;
        const shouldHide = Object.values(row).some(value => value === 'HIDE');
    
        // Handle anchor tags, including mailto: links and specific URLs
        document.querySelectorAll('a').forEach(anchor => {
            if (anchor.href.includes('mailto:')) {
                anchor.href = anchor.href.replace(/\s/g, '').replace(/%20/g, '');
            } else if (shouldHide) {
                anchor.remove();
            } else {
                const updateHref = anchor.href.includes('what.sapp.my.id') || anchor.href.includes('con.tact.my.id');
                if (updateHref) {
                    anchor.href = `https://` + row[columnPrefix + '📊'] + `/` + (anchor.href.includes('what.sapp.my.id') ? row[columnPrefix + '💬'] : row[columnPrefix + '📞']);
                }
                updateTextNodeWithinAnchor(anchor, regexPhone, formattedNumber, row[columnPrefix + '🧑🏻']);
            }
        });
    
        // Process other text nodes in the document
        processTextNodes(regexPhone, formattedNumber, row[columnPrefix + '🧑🏻'], shouldHide);
    };
    
    const updateTextNodeWithinAnchor = (anchor, regexPhone, formattedNumber, contactName) => {
        // Check if the anchor contains a FA phone icon
        const hasFontAwesomePhoneIcon = anchor.querySelector('i[class*="fa-phone"]');
        if (!hasFontAwesomePhoneIcon) {
            // If no FA icon, prepend the phone emoji to the formatted number
            formattedNumber = '📞 ' + formattedNumber;
        }
        // Update the anchor's text content if it matches the phone pattern
        if (regexPhone.test(anchor.textContent)) {
            anchor.textContent = formattedNumber + ' (' + contactName + ')';
            adjustTextColorBasedOnBackground(anchor);
        }
    };
    
    const processTextNodes = (regexPhone, formattedNumber, contactName, shouldHide, row, columnPrefix) => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            // Skip nodes within whatsapp-btn and tlp-btn elements
            if (node.parentNode.closest('.whatsapp-floating, .tlp-floating')) continue;
    
            if (regexPhone.test(node.nodeValue)) {
                if (shouldHide) {
                    node.parentNode.remove();
                } else {
                    // Wrap the text node in a new anchor tag
                    const anchor = document.createElement('a');
                    anchor.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'];
                    anchor.textContent = '📞 ' + formattedNumber + ' (' + contactName + ')';
                    node.parentNode.replaceChild(anchor, node);
                    adjustTextColorBasedOnBackground(anchor);
                }
            }
        }
    };
    
    const adjustTextColorBasedOnBackground = (element) => {
        const style = window.getComputedStyle(element);
        const backgroundColor = style.backgroundColor;
        const rgb = backgroundColor.replace(/[^\d,]/g, '').split(',');
        const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
        element.style.color = brightness < 125 ? 'white' : 'black';
    };

    // Find the row that matches the pageName and update the UI accordingly
    const pageName = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase() || '(DEFAULT)';
    const pageNameParts = pageName.split('-');
    const row = data.find(item => pageName === '(DEFAULT)' ? item['📍'] === pageName : pageNameParts.some(part => item['📍'] && item['📍'].toLowerCase() === part));

    if (row) {
        // Log the required data
        console.log(columnPrefix + '🧑🏻: ' + row[columnPrefix + '🧑🏻']);
        console.log(columnPrefix + '#️⃣: ' + row[columnPrefix + '#️⃣']);
        console.log(columnPrefix + '📊: ' + row[columnPrefix + '📊']);
        console.log(columnPrefix + '📞: ' + row[columnPrefix + '📞']);
        console.log(columnPrefix + '💬: ' + row[columnPrefix + '💬']);
        console.log(columnPrefix + '🏷️: ' + row[columnPrefix + '🏷️']);
        console.log(columnPrefix + '🏢: ' + row[columnPrefix + '🏢']);

        replaceFooterAddressWithFetchedData(row[columnPrefix + '🏢']);
        updateContactInfo(row);
        updateAnchorsAndTextNodes(row);
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

    // Original logic for determining mainDomain and subdomain
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

    const data = await getData(supabase, mainDomain, columnPrefix);
    console.log('Fetched data:', data);

    if (data && data.length > 0) {
        updateUIWithFetchedData(data, columnPrefix);
    }
};