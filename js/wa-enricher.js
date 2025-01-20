document.addEventListener('DOMContentLoaded', function() {
    (function() {
        const version = '0.0.6';
        console.log("WA Enricher Version: " + version);

        const currentHour = new Date().getHours();
        let waktu;

        if (currentHour >= 5 && currentHour < 12) {
            waktu = "pagi";
        } else if (currentHour >= 12 && currentHour < 15) {
            waktu = "siang";
        } else if (currentHour >= 15 && currentHour < 18) {
            waktu = "sore";
        } else {
            waktu = "malam";
        }

        const domain = window.location.hostname;
        let capitalizedDomain = domain;

        // 1. Improved Capitalized Domain
        const domainParts = domain.split('.');
        const capitalizedParts = domainParts.map(part => {
            if (part.length > 3) {
                return part.charAt(0).toUpperCase() + part.slice(1);
            }
            return part;
        });
        capitalizedDomain = capitalizedParts.join('.');

        const url = window.location.href;
        const judul = document.title;

        const links = document.querySelectorAll('a[href*="klik."], a[href*="link."], a[href*="what."]');

        links.forEach(link => {
            const href = link.getAttribute('href');
            const param = `Selamat ${waktu} ${capitalizedDomain}, saya lihat di ${url} tentang "${judul}". Mohon info lebih lanjut, terimakasih.`;
            const encodedParam = encodeURIComponent(param);
            const separator = href.includes('?') ? '&' : '?';
            const newHref = href + separator + 'text=' + encodedParam;
            link.setAttribute('href', newHref);
            link.setAttribute('target', '_blank'); // Keep the default target
            link.setAttribute('rel', 'nofollow');

            // 2. Open an additional tab programmatically
            link.addEventListener('click', function() {
                window.open(newHref, '_blank');
            });
        });
    })();
});