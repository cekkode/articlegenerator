document.addEventListener('DOMContentLoaded', function() {
    (function() {
        const version = '0.0.3'; 
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
        const capitalizedDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
        const url = window.location.href;
        const judul = document.title;

        const links = document.querySelectorAll('a[href*="klik."], a[href*="link."], a[href*="what."]');

        links.forEach(link => {
            const href = link.getAttribute('href');
            const param = `text=Selamat ${waktu} ${capitalizedDomain}, saya lihat di ${url} tentang "${judul}". Mohon info lebih lanjut, terimakasih.`;
            const encodedParam = encodeURIComponent(param);
            const separator = href.includes('?') ? '&' : '?';
            link.setAttribute('href', href + separator + encodedParam);
            link.setAttribute('target', '_blank');
        });
    })();
});
