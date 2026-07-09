document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. TABS NAVIGATION LOGIC
    // ----------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Set active button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show active content
            tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });



    // ----------------------------------------------------
    // 3. MULTIPLAYER SETTINGS LOGIC (WASM)
    // ----------------------------------------------------
    const btnStartMultiplayer = document.getElementById('btn-start-multiplayer');
    const multiplayerIpInput = document.getElementById('multiplayer-ip-input');

    btnStartMultiplayer.addEventListener('click', () => {
        let ip = multiplayerIpInput.value.trim();
        if (!ip) {
            alert('Zəhmət olmasa, server IP adresini daxil edin.');
            return;
        }

        // Clean up IP input: strip protocols and trailing slashes
        ip = ip.replace(/^(https?:\/\/|wss?:\/\/)/i, '');
        ip = ip.replace(/\/+$/, '');

        const gameUrl = `./engine/index.html?ip=${encodeURIComponent(ip)}`;
        
        // Open in new tab
        window.open(gameUrl, '_blank');
    });

});
