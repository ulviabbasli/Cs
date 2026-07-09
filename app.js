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
    const gameIframe = document.getElementById('game-iframe');
    const gameIframeTitle = document.getElementById('game-iframe-title');
    const gameOpenTab = document.getElementById('game-open-tab');

    btnStartMultiplayer.addEventListener('click', () => {
        let ip = multiplayerIpInput.value.trim();
        if (!ip) {
            alert('Zəhmət olmasa, server IP adresini daxil edin.');
            return;
        }

        // Clean up IP input: strip protocols and trailing slashes
        ip = ip.replace(/^(https?:\/\/|wss?:\/\/)/i, '');
        ip = ip.replace(/\/+$/, '');

        const iframeUrl = `./engine/index.html?ip=${encodeURIComponent(ip)}`;
        
        // Load in iframe
        gameIframe.src = iframeUrl;
        
        // Update header info
        gameIframeTitle.textContent = `WebXash3D Mühərriki - Çoxnəfərli Oyun (Multiplayer Server: ${ip})`;
        gameIframeTitle.style.color = '#39ff14';
        
        // Update new tab link
        gameOpenTab.href = iframeUrl;

        alert(`Oyun ${ip} serverinə bağlanmaq üçün hazırlanır. Başlat düyməsini sıxın!`);
    });

});
