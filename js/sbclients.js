var version = "0.0.99";
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
    // Find the row that matches the pageName and update the UI accordingly
    const pageName = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase() || '(DEFAULT)';
    const pageNameParts = pageName.split('-');
    const row = data.find(item => pageName === '(DEFAULT)' ? item['📍'] === pageName : pageNameParts.some(part => item['📍'] && item['📍'].toLowerCase() === part));

    if (!row) {
        console.log('No matching data found for the page.');
        return;
    }

    // Log the required data
    console.log(columnPrefix + '🧑🏻: ' + row[columnPrefix + '🧑🏻']);
    console.log(columnPrefix + '#️⃣: ' + row[columnPrefix + '#️⃣']);
    console.log(columnPrefix + '📊: ' + row[columnPrefix + '📊']);
    console.log(columnPrefix + '📞: ' + row[columnPrefix + '📞']);
    console.log(columnPrefix + '💬: ' + row[columnPrefix + '💬']);
    console.log(columnPrefix + '🏷️: ' + row[columnPrefix + '🏷️']);
    console.log(columnPrefix + '🏢: ' + row[columnPrefix + '🏢']);

    const replaceFooterAddressWithFetchedData = (addressData) => {
        const footer = document.querySelector('footer');
        const addressRegex = /(?:Jl\.|Jalan|No\.|Komp\.|Komplek|Ruko)[^<,]+[0-9]{5}/gi;
      
        if (footer && footer.innerHTML.match(addressRegex)) {
          footer.innerHTML = footer.innerHTML.replace(addressRegex, addressData);
        }
    };

    const currentHour = new Date().getHours();
    const greeting = currentHour >= 4 && currentHour < 10 ? "pagi" : currentHour >= 10 && currentHour < 15 ? "siang" : currentHour >= 15 && currentHour < 18 ? "sore" : "malam";
    const textParam = encodeURIComponent(`Selamat ${greeting} pak ${row[columnPrefix + '🧑🏻']}, admin ${window.location.hostname}. Saya ingin bertanya tentang "${document.title}" yang anda tawarkan di ${window.location.href}`);

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
            whatsappElement.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'] + '/?text=' + textParam;
            Object.assign(whatsappElement, { target: "_blank", rel: "noopener noreferrer" });
            whatsappSpan.textContent = formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')';
            tlpElement.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '📞'];
            Object.assign(tlpElement, { target: "_blank", rel: "noopener noreferrer" });
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
                    anchor.href = `https://` + row[columnPrefix + '📊'] + `/` + (anchor.href.includes('what.sapp.my.id') ? row[columnPrefix + '💬'] + '/?text=' + textParam : row[columnPrefix + '📞']);
                    Object.assign(newAnchor, { target: "_blank", rel: "noopener noreferrer" });
                }
                updateTextNodeWithinAnchor(anchor, regexPhone, formattedNumber, row[columnPrefix + '🧑🏻']);
            }
        });
    
        // Process other text nodes in the document
        processTextNodes(regexPhone, formattedNumber, row[columnPrefix + '🧑🏻'], shouldHide);
    };
    
    const updateTextNodeWithinAnchor = (anchor, regexPhone, formattedNumber, contactName) => {
        const textNode = Array.from(anchor.childNodes).find(node => node.nodeType === Node.TEXT_NODE && regexPhone.test(node.nodeValue));
        if (textNode) {
            textNode.nodeValue = ' ' + formattedNumber + ' (' + contactName + ')';
            adjustTextColorBasedOnBackground(anchor);
        } else {
            addHrefToTextNodeIfMissing(anchor, regexPhone, formattedNumber, contactName);
        }
    };
    
    const addHrefToTextNodeIfMissing = (anchor, regexPhone, formattedNumber, contactName) => {
        // Assuming we want to add an href to a text node that matches our phone regex but isn't wrapped in an <a> tag
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            if (regexPhone.test(node.nodeValue) && !node.parentNode.href) {
                // Wrap this text node in an anchor element
                const newAnchor = document.createElement('a');
                const newNode = document.createTextNode(' ' + formattedNumber + ' (' + contactName + ')');
                newAnchor.appendChild(newNode);
                newAnchor.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'] + '/?text=' + textParam;
                Object.assign(newAnchor, { target: "_blank", rel: "noopener noreferrer" });
                node.parentNode.replaceChild(newAnchor, node);
            }
        }
    };
    
    const processTextNodes = (regexPhone, formattedNumber, contactName, shouldHide) => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            if (regexPhone.test(node.nodeValue)) {
                if (shouldHide) {
                    node.parentNode.remove();
                } else {
                    const newNode = document.createTextNode(' ' + formattedNumber + ' (' + contactName + ')');
                    node.parentNode.replaceChild(newNode, node);
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