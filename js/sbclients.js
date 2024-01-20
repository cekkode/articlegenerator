var version = "0.0.48";
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
    var pageName = pageParts[pageParts.length - 1].replace('.html', '').toLowerCase();

    if (pageName === '') {
        pageName = '(DEFAULT)';
    }

    const pageNameParts = pageName.split('-');
    console.log('pageName:', pageName);
    console.log('pageNameParts:', pageNameParts);

    var storedVersion = localStorage.getItem('version');

    console.log('Accessing table:', mainDomain);
    const { data, error } = await supabase
        .from(mainDomain)
        .select('*');
        console.log('Fetched data:', data); // Log the fetched data

    // Find the row that matches the pageName
    const row = data.find(item => {
        if (pageName === '(DEFAULT)') {
        return item['📍'] === pageName;
        } else {
        return pageNameParts.some(part => item['📍'].toLowerCase() === part);
        }
    });

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
        console.log(columnPrefix + '🧑🏻: ' + row[columnPrefix + '🧑🏻']);
        console.log(columnPrefix + '#️⃣: ' + row[columnPrefix + '#️⃣']);
        console.log(columnPrefix + '📊: ' + row[columnPrefix + '📊']);
        console.log(columnPrefix + '📞: ' + row[columnPrefix + '📞']);
        console.log(columnPrefix + '💬: ' + row[columnPrefix + '💬']);
        console.log(columnPrefix + '🏷️: ' + row[columnPrefix + '🏷️']);

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

        // Define the regex pattern to match the phone number and name format
        var regex = /\d{4} \d{4} \d{4} \((.*?)\)/g;

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

        // Iterate over each text node
        textNodes.forEach(function(node) {
            // If the node's text matches the regex pattern
            if (regex.test(node.nodeValue)) {
                // Replace the matched text based on the shouldHide flag
                node.nodeValue = shouldHide ? node.nodeValue.replace(regex, '') : node.nodeValue.replace(regex, formattedNumber + ' (' + row[columnPrefix + '🧑🏻'] + ')');
            }
            // If the node's parent is an anchor tag
            if (node.parentNode.nodeName === 'A') {
                // If data should be hidden, remove the href attribute
                if (shouldHide) {
                    node.parentNode.removeAttribute('href');
                } else {
                    // Otherwise, update the href attribute
                    node.parentNode.href = `https://` + row[columnPrefix + '📊'] + `/` + row[columnPrefix + '💬'];
                }
            }
        });
    }
}