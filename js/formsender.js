document.addEventListener('DOMContentLoaded', function() {
    // Find all forms on the page
    const version = '1.0.2'; console.log("Form Sender Version: " + version);
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Check form validity
            if (!this.checkValidity()) {
                return;
            }
            
            // Find WhatsApp link (excluding those with phone emoji in URL)
            const whatsappLinks = Array.from(
                document.querySelectorAll('a[href*="klik."], a[href*="link."], a[href*="whatsapp."], a[href*="what."]')
            ).filter(link => !link.href.includes('📞') && !decodeURIComponent(link.href).includes('📞'));
            
            const whatsappLink = whatsappLinks.find(link => link.href);
            
            if (!whatsappLink) {
                console.error('Valid WhatsApp link not found');
                return;
            }
            
            // Collect form data based on labels
            const formData = {};
            const formElements = form.querySelectorAll('input, select, textarea');
            let hasAllRequired = true;
            
            formElements.forEach(element => {
                if (element.type === 'hidden' || getComputedStyle(element).display === 'none') {
                    return;
                }
                
                let label = '';
                let value = element.value.trim();
                
                if (element.required && !value) {
                    hasAllRequired = false;
                    return;
                }
                
                const labelElement = form.querySelector(`label[for="${element.id}"]`);
                if (labelElement) {
                    label = labelElement.textContent.replace('*', '').trim();
                }
                
                if (!label && element.placeholder) {
                    label = element.placeholder;
                }
                
                if (element.classList.contains('wpforms-field-name-first') && element.value) {
                    const lastNameInput = form.querySelector('.wpforms-field-name-last');
                    const lastName = lastNameInput ? lastNameInput.value.trim() : '';
                    label = 'Nama';
                    value = `${element.value.trim()} ${lastName}`.trim();
                } else if (element.classList.contains('wpforms-field-name-last')) {
                    return;
                }
                
                if (label && value) {
                    if (label.toLowerCase().includes('tinggi') && !value.toLowerCase().includes('cm')) {
                        value += ' cm';
                    } else if (label.toLowerCase().includes('berat') && !value.toLowerCase().includes('kg')) {
                        value += ' kg';
                    }
                    
                    formData[label] = value;
                }
            });
            
            if (!hasAllRequired) {
                return;
            }
            
            // Format message
            let message = '*Form Pendaftaran Online*\n\n';
            for (const [key, value] of Object.entries(formData)) {
                message += `*${key}:* ${value}\n`;
            }
            
            // Create WhatsApp URL with encoded message
            // Use the base URL without any existing parameters
            const baseUrl = whatsappLink.href.split('?')[0];
            const whatsappUrl = new URL(baseUrl);
            
            // Only encode the message once
            whatsappUrl.searchParams.set('text', message);
            
            // Open WhatsApp link in new tab
            window.open(whatsappUrl.toString(), '_blank');
        });
    });
});