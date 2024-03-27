var version = "0.0.160";
console.log("Supabase Client JS Script Version: " + version);

var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
document.head.appendChild(script);

const fetchData = async (supabase, mainDomain, columnPrefix) => {
    let selectColumns = `"📍", "${columnPrefix}🧑🏻", "${columnPrefix}#️⃣", "${columnPrefix}📊", "${columnPrefix}📞", "${columnPrefix}💬", "${columnPrefix}🏷️", "${columnPrefix}🏢"`;

    try {
        const { data, error } = await supabase.from(mainDomain).select(selectColumns);

        if (error) {
            console.log(`Error fetching data from table ${mainDomain}:`, error);
        } else if (!data || data.length === 0 || !data[0].hasOwnProperty(`${columnPrefix}🧑🏻`)) {
            selectColumns = '"📍", "🧑🏻", "#️⃣", "📊", "📞", "💬", "🏷️", "🏢"';
            const fallbackResult = await supabase.from(mainDomain).select(selectColumns);
            if (fallbackResult.error) {
                console.log(`Error fetching fallback data from table ${mainDomain}:`, fallbackResult.error);
            } else {
                return fallbackResult.data;
            }
        } else {
            return data;
        }
    } catch (error) {
        console.log(`Table ${mainDomain} does not exist in Supabase.`);
    }

    return null;
};

const getCacheData = async (supabase, mainDomain, columnPrefix) => {
    const cache = {
        data: localStorage.getItem('data'),
        timestamp: localStorage.getItem('timestamp'),
        version: localStorage.getItem('version'),
        firstRowDate: localStorage.getItem('firstRowDate')
    };

    const { data: firstRowData, error: firstRowError } = await supabase.from(mainDomain).select(`"📅"`).eq('ID', '0').single();

    if (firstRowError) {
        console.error('Error fetching first row data:', firstRowError);
        return cache.data ? JSON.parse(cache.data) : null;
    }

    const firstRowDate = firstRowData ? firstRowData["📅"] : null;
    console.log(`Cached 📅: ${cache.firstRowDate} = 📅: ${firstRowDate}? ${firstRowDate === cache.firstRowDate}`);

    // Check if firstRowData exists and is not empty
    if (!firstRowData || Object.keys(firstRowData).length === 0) {
        console.error('First row data is missing or empty.');
        return cache.data ? JSON.parse(cache.data) : null;
    }

    if (!cache.data || !cache.timestamp || Date.now() - cache.timestamp > 365 * 24 * 60 * 60 * 1000 || (cache.firstRowDate && firstRowDate !== cache.firstRowDate)) {
        console.log('Fetching new data from Supabase...');
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

const promptUserInfo = () => {
    const userName = prompt("Please enter your full name:");
    const userCompany = prompt("Please enter your company name (optional):");
    return { userName, userCompany };
};

const updateUI = (data, columnPrefix, anchor = null, params = {}) => {
    const currentHour = new Date().getHours();
    const greeting = currentHour >= 4 && currentHour < 10 ? "pagi" : currentHour >= 10 && currentHour < 15 ? "siang" : currentHour >= 15 && currentHour < 18 ? "sore" : "malam";

    // Find the row that matches the pageName and update the UI accordingly
    const pageName = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase() || '(DEFAULT)';
    const pageNameParts = pageName.split('-');
    
    const row = data.find(item => pageName === '(DEFAULT)' ? item['📍'] === pageName : pageNameParts.some(part => item['📍'] && item['📍'].toLowerCase() === part));
    if (!row) {
        console.log('No matching data found for the page.');
        return;
    }

    const contactName = row[columnPrefix + '🧑🏻'];
    const formattedNumber = row[columnPrefix + '#️⃣'].replace(/^62/, '0').replace(/(\d{4})(?=\d)/g, '$1 ');
    const regexPhoneName = /\d{4} \d{4} \d{4} \((.*?)\)/g;
    const regexOnlyPhone = /\b\d{4} \d{4} \d{4}\b(?! \([^)]*\))/g;

    const textParam = `Selamat ${greeting} pak ${row[columnPrefix + '🧑🏻']}, ${window.location.hostname}. Saya ${params && params.userInfo ? `. ${params.userInfo}` : ''}, ingin bertanya tentang "${document.title}" yang anda tawarkan di ${window.location.href}`;

    const replaceAddress = (addressData) => {
        const elements = [
            document.querySelector('footer'),
            document.querySelector('header'),
            ...document.querySelectorAll('.bannersewa'),
            ...document.querySelectorAll('.elementor-widget-container') // Include elements with class 'elementor-widget-container'
        ];
        const addressRegex = /(?:Jl\.|No\.|Komp\.|Komplek|Ruko)\s+[^<,]+(?:[-/]\d+)*\d{5}(?:\)|(?=\s|$))?/gi;

        elements.forEach(element => {
            if (element && element.innerHTML.match(addressRegex)) {
                element.innerHTML = element.innerHTML.replace(addressRegex, addressData);
            }
        });
    };
    replaceAddress(row[columnPrefix + '🏢']);

    const replaceOnlyPhone = (formattedNumber, regexOnlyPhone) => {
        const elements = [
            ...document.querySelectorAll('.elementor-widget-container'),
            ...document.querySelectorAll('.elementor-container')
        ];
        elements.forEach(element => {
            if (element && element.innerHTML.match(regexOnlyPhone)) {
                element.innerHTML = element.innerHTML.replace(regexOnlyPhone, formattedNumber);
            }
        });
    };
    replaceOnlyPhone(formattedNumber, regexOnlyPhone);

    if (anchor) {
        addHrefToTextNodeIfMissing(anchor, regexPhoneName, formattedNumber, contactName, textParam);
        updateTextNodeWithinAnchor(anchor, regexPhoneName, formattedNumber, contactName, row, columnPrefix, textParam);
    }

    const adjustTextColorBasedOnBackground = (element) => {
        if (document.body.contains(element)) {
            let targetElement = element;
            let backgroundColor = 'rgba(0, 0, 0, 0)'; // Default to fully transparent
            while (targetElement && backgroundColor === 'rgba(0, 0, 0, 0)' && targetElement !== document.body) {
                const style = window.getComputedStyle(targetElement);
                if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    backgroundColor = style.backgroundColor;
                }
                targetElement = targetElement.parentElement;
            }
            const rgb = backgroundColor.replace(/[^\d,]/g, '').split(',');
            const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
            element.style.color = brightness < 125 ? 'white' : 'black';
        } else {
            console.warn('Element is not in the DOM.');
        }
    };

    const addHrefToTextNodeIfMissing = (anchor, regexPhoneName, formattedNumber, contactName, textParam) => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            // Check if the text node matches the regex
            if (regexPhoneName.test(node.nodeValue)) {
                let parentNode = node.parentNode;
                let hasHrefAncestor = false;
                // Traverse up the DOM tree to check for an ancestor with an href
                while (parentNode) {
                    if (parentNode.nodeName === 'A' && parentNode.hasAttribute('href')) {
                        hasHrefAncestor = true;
                        break;
                    }
                    parentNode = parentNode.parentNode;
                }
                // If no ancestor with href is found, wrap the text node in a new anchor element
                if (!hasHrefAncestor) {
                    const newAnchor = document.createElement('a');
                    const newNode = document.createTextNode(' ' + formattedNumber + ' (' + contactName + ')');
                    newAnchor.appendChild(newNode);
                    newAnchor.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'] + '/?text=' + textParam;
                    Object.assign(newAnchor, { target: "_blank", rel: "noopener noreferrer" });
                    node.parentNode.replaceChild(newAnchor, node);
                    
                    // Adjust text color based on background color
                    adjustTextColorBasedOnBackground(newAnchor);
                }
            }
        }
    };
    addHrefToTextNodeIfMissing(anchor, regexPhoneName, formattedNumber, contactName, textParam);

    const updateTextNodeWithinAnchor = (anchor, regexPhoneName, formattedNumber, contactName, row, columnPrefix, textParam) => {
        if (anchor && anchor.childNodes) {
            const textNodes = [...anchor.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && regexPhoneName.test(node.nodeValue));
    
            textNodes.forEach(node => {
                const hasFontAwesomePhoneIcon = anchor.parentNode && (
                    anchor.parentNode.querySelector && anchor.parentNode.querySelector('i[class*="fa-phone"], i[class*="fas fa-phone"], i[class*="far fa-phone"], i[class*="fal fa-phone"], i[class*="fad fa-phone"]') ||
                    anchor.parentNode.nextElementSibling && anchor.parentNode.nextElementSibling.querySelector && anchor.parentNode.nextElementSibling.querySelector('i[class*="fa-phone"], i[class*="fas fa-phone"], i[class*="far fa-phone"], i[class*="fal fa-phone"], i[class*="fad fa-phone"]')
                );
    
                if (node.parentNode && node.parentNode.nodeName !== 'A') {
                    const newAnchor = document.createElement('a');
                    newAnchor.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'] + '/?text=' + textParam;
                    node.parentNode.replaceChild(newAnchor, node);
                    newAnchor.textContent = hasFontAwesomePhoneIcon ? ` ${formattedNumber} (${contactName})` : `📞 ${formattedNumber} (${contactName})`;
                } else {
                    const newNodeValue = hasFontAwesomePhoneIcon ? ` ${formattedNumber} (${contactName})` : `📞 ${formattedNumber} (${contactName})`;
                    const newNode = document.createTextNode(newNodeValue);
                    anchor.replaceChild(newNode, node);
                }
            });
        } else {
            console.error('Anchor element is undefined or does not contain child nodes.');
        }
    };
    updateTextNodeWithinAnchor(anchor, regexPhoneName, formattedNumber, contactName, row, columnPrefix, textParam);    
    
    const processTextNodes = (regexPhoneName, formattedNumber, contactName, shouldHide) => {
        const matchedNodes = [];

        // Find all text nodes that match the regex
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            if (regexPhoneName.test(node.nodeValue)) {
                matchedNodes.push(node);
            }
        }
      
        // Process each matched node
        matchedNodes.forEach(node => {
            // Log the text content and its parent element
            console.log('Text filtered by regexPhoneName:', node.nodeValue);
            console.log('Parent element:', node.parentNode);
          
            const parentNode = node.parentNode; // Define parentNode here
          
            if (shouldHide) {
                parentNode.remove(); // Use parentNode instead of node.parentNode
            } else {
                // For non-anchor elements, directly replace text content
                node.nodeValue = ` ${formattedNumber} (${contactName})`;
            }
        });
    };

    /*const updateAnchorHref = (anchor, baseUrl, params) => {
        anchor.href = baseUrl + params;
        Object.assign(anchor, { target: "_blank", rel: "noopener noreferrer" });
    };*/

    const updateAnchorHref = (anchor, baseUrl, params) => {
        if (baseUrl.includes('💬')) {
            const { userName, userCompany } = promptUserInfo();
            const userInfo = `Nama: ${userName}${userCompany ? `, Perusahaan: ${userCompany}` : ''}`;
            const updatedParams = `${params}&userInfo=${encodeURIComponent(userInfo)}`;
            anchor.href = `${baseUrl}${updatedParams}`;
        } else {
            anchor.href = baseUrl + params;
        }
        Object.assign(anchor, { target: "_blank", rel: "noopener noreferrer" });
    };
    
    const updateFloatContact = (row, textParam, formattedNumber) => {
        const updateAnchor = (element, baseUrl, params, text) => {
            updateAnchorHref(element, baseUrl, params);
            element.querySelector('span').textContent = text;
        };
    
        const whatsappFloat = document.querySelector('.whatsapp-floating');
        const whatsappElement = document.querySelector('.whatsapp-floating a');
        const tlpFloat = document.querySelector('.tlp-floating');
        const tlpElement = document.querySelector('.tlp-floating a');
    
        if (row[columnPrefix + '🧑🏻'] === 'HIDE' || row[columnPrefix + '#️⃣'] === 'HIDE') {
            whatsappFloat.style.display = 'none';
            tlpFloat.style.display = 'none';
        } else {
            updateAnchor(whatsappElement, 'https://' + row[columnPrefix + '📊'] + '/' + row[columnPrefix + '💬'] + '/?text=', textParam, formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')');
            updateAnchor(tlpElement, 'https://' + row[columnPrefix + '📊'] + '/' + row[columnPrefix + '📞'], '', formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')');
        }
    };
    
    const updatePageContact = (row, textParam, formattedNumber, regexPhoneName, adjustTextColorBasedOnBackground) => {
        const shouldHide = Object.values(row).some(value => value === 'HIDE');
        
        document.querySelectorAll('a').forEach(anchor => {
            if (anchor.href.includes('mailto:')) {
                anchor.href = anchor.href.replace(/\s/g, '').replace(/%20/g, '');
            } else if (!shouldHide) {
                const updateHref = anchor.href.includes('what.sapp.my.id') || anchor.href.includes('con.tact.my.id');
                if (updateHref) {
                    const href = `https://${row[columnPrefix + '📊']}/${anchor.href.includes('what.sapp.my.id') ? row[columnPrefix + '💬'] + '/?text=' + textParam : row[columnPrefix + '📞']}`;
                    updateAnchorHref(anchor, href, '');
                }
                updateTextNodeWithinAnchor(anchor, regexPhoneName, formattedNumber, row[columnPrefix + '🧑🏻']);
            } else {
                anchor.remove();
            }
        });
    
        processTextNodes(regexPhoneName, formattedNumber, contactName, shouldHide);
    };
    
    updateFloatContact(row, textParam, formattedNumber);
    updatePageContact(row, textParam, formattedNumber, regexPhoneName, adjustTextColorBasedOnBackground);    

    // Log the required data
    console.log(columnPrefix + '🧑🏻: ' + row[columnPrefix + '🧑🏻']);
    console.log(columnPrefix + '#️⃣: ' + row[columnPrefix + '#️⃣']);
    console.log(columnPrefix + '📊: ' + row[columnPrefix + '📊']);
    console.log(columnPrefix + '📞: ' + row[columnPrefix + '📞']);
    console.log(columnPrefix + '💬: ' + row[columnPrefix + '💬']);
    console.log(columnPrefix + '🏷️: ' + row[columnPrefix + '🏷️']);
    console.log(columnPrefix + '🏢: ' + row[columnPrefix + '🏢']);
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

    const data = await getCacheData(supabase, mainDomain, columnPrefix);
    console.log('Fetched data:', data);

    if (data && data.length > 0) {
        updateUI(data, columnPrefix, null, {});
    }
};