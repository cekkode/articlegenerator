document.addEventListener('DOMContentLoaded', function() {
    // Find all forms on the page
    const version = '1.0.0'; console.log("Form Sender Version: " + version);
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Find WhatsApp link
            const whatsappLink = Array.from(document.querySelectorAll('a[href*="klik."], a[href*="link."], a[href*="whatsapp."], a[href*="what."]')).find(link => link.href);
            
            if (!whatsappLink) {
                console.error('WhatsApp link not found');
                return;
            }
            
            // Collect form data based on labels
            const formData = {};
            const formElements = form.querySelectorAll('input, select, textarea');
            
            formElements.forEach(element => {
                // Skip hidden or non-displayed elements
                if (element.type === 'hidden' || getComputedStyle(element).display === 'none') {
                    return;
                }
                
                let label = '';
                let value = element.value.trim();
                
                // Try to find label
                const labelElement = form.querySelector(`label[for="${element.id}"]`);
                if (labelElement) {
                    // Remove any asterisks and trim
                    label = labelElement.textContent.replace('*', '').trim();
                }
                
                // If no label found, try using placeholder as fallback
                if (!label && element.placeholder) {
                    label = element.placeholder;
                }
                
                // Handle special cases
                if (element.classList.contains('wpforms-field-name-first') && element.value) {
                    const lastNameInput = form.querySelector('.wpforms-field-name-last');
                    const lastName = lastNameInput ? lastNameInput.value.trim() : '';
                    label = 'Nama';
                    value = `${element.value.trim()} ${lastName}`.trim();
                } else if (element.classList.contains('wpforms-field-name-last')) {
                    // Skip last name as it's handled with first name
                    return;
                }
                
                // Only add if we have both label and value
                if (label && value) {
                    // Add units if they exist in the label
                    if (label.toLowerCase().includes('tinggi') && !value.toLowerCase().includes('cm')) {
                        value += ' cm';
                    } else if (label.toLowerCase().includes('berat') && !value.toLowerCase().includes('kg')) {
                        value += ' kg';
                    }
                    
                    formData[label] = value;
                }
            });
            
            // Format message
            let message = '*Form Pendaftaran Online*\n\n';
            for (const [key, value] of Object.entries(formData)) {
                message += `*${key}:* ${value}\n`;
            }
            
            // Create WhatsApp URL with encoded message
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = new URL(whatsappLink.href);
            whatsappUrl.searchParams.set('text', encodedMessage);
            
            // Redirect to WhatsApp
            window.location.href = whatsappUrl.toString();
        });
    });
});