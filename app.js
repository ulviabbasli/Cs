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
    // 2. LOBBY GENERATOR LOGIC
    // ----------------------------------------------------
    const nicknameInput = document.getElementById('nickname');
    const mapCards = document.querySelectorAll('.map-card');
    const btnCreatePlayCs = document.getElementById('btn-create-playcs');
    const btnCreateCsOnline = document.getElementById('btn-create-csonline');
    
    const outputCard = document.getElementById('output-card');
    const resultArea = document.getElementById('result-area');
    const generatedUrlInput = document.getElementById('generated-url');
    const btnJoin = document.getElementById('btn-join');
    const btnCopy = document.getElementById('btn-copy');

    let selectedMap = 'de_dust2';

    // Map selection cards
    mapCards.forEach(card => {
        card.addEventListener('click', () => {
            mapCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            const radio = card.querySelector('input[type="radio"]');
            radio.checked = true;
            selectedMap = radio.value;
        });
    });

    // Generate Lobby Link for Play-CS.com
    btnCreatePlayCs.addEventListener('click', () => {
        const nick = nicknameInput.value.trim() || 'Player';
        
        // Hide initial placeholder
        const placeholder = outputCard.querySelector('.status-placeholder');
        if (placeholder) placeholder.classList.add('hidden');

        // Formulate url for play-cs
        // play-cs.com allows direct server connecting or quick play.
        // We'll give them the direct play link with instructions.
        const playUrl = `https://play-cs.com/en/servers`;
        
        generatedUrlInput.value = playUrl;
        btnJoin.href = playUrl;
        
        // Update results display
        resultArea.querySelector('.success-badge').textContent = 'PLAY-CS.COM HAZIRDIR';
        resultArea.querySelector('.success-badge').style.borderColor = '#39ff14';
        resultArea.querySelector('.success-badge').style.color = '#39ff14';
        resultArea.querySelector('.desc').innerHTML = `
            <strong>Play-CS.com</strong> platforması seçildi. 
            <br><br>
            <strong>Növbəti addımlar:</strong>
            <ol style="margin-left: 20px; margin-top: 10px; text-align: left; font-size: 0.85rem; color: #64748b;">
                <li>Aşağıdakı <strong>"Oyuna Qoşul"</strong> düyməsinə sıxaraq sayta daxil olun.</li>
                <li>Orada istədiyiniz boş serveri seçin və ya <strong>"Create Server"</strong> sıxaraq otaq qurun.</li>
                <li>Otağın linkini iş yoldaşlarınıza göndərərək eyni oyuna qoşulun.</li>
            </ol>
        `;

        resultArea.classList.remove('hidden');
    });

    // Generate Lobby Link for CS-Online.club
    btnCreateCsOnline.addEventListener('click', () => {
        const nick = nicknameInput.value.trim() || 'Player';
        
        // Hide initial placeholder
        const placeholder = outputCard.querySelector('.status-placeholder');
        if (placeholder) placeholder.classList.add('hidden');

        // Formulate url for CS-Online.club
        const playUrl = `https://cs-online.club/en/servers`;
        
        generatedUrlInput.value = playUrl;
        btnJoin.href = playUrl;
        
        // Update results display
        resultArea.querySelector('.success-badge').textContent = 'CS-ONLINE.CLUB HAZIRDIR';
        resultArea.querySelector('.success-badge').style.borderColor = '#00e5ff';
        resultArea.querySelector('.success-badge').style.color = '#00e5ff';
        resultArea.querySelector('.desc').innerHTML = `
            <strong>CS-Online.club</strong> platforması seçildi.
            <br><br>
            <strong>Növbəti addımlar:</strong>
            <ol style="margin-left: 20px; margin-top: 10px; text-align: left; font-size: 0.85rem; color: #64748b;">
                <li>Aşağıdakı <strong>"Oyuna Qoşul"</strong> düyməsinə sıxaraq sayta daxil olun.</li>
                <li>Xəritə olaraq <strong>${selectedMap}</strong> seçin.</li>
                <li><strong>"Create Game"</strong> düyməsini sıxın və yaranan otaq linkini iş yoldaşlarınıza kopyalayıb göndərin.</li>
            </ol>
        `;

        resultArea.classList.remove('hidden');
    });

    // Copy Link functionality
    btnCopy.addEventListener('click', () => {
        generatedUrlInput.select();
        document.execCommand('copy');
        
        const originalText = btnCopy.textContent;
        btnCopy.textContent = 'Kopyalandı!';
        btnCopy.style.backgroundColor = '#39ff14';
        btnCopy.style.color = '#06090c';

        setTimeout(() => {
            btnCopy.textContent = originalText;
            btnCopy.style.backgroundColor = '';
            btnCopy.style.color = '';
        }, 2000);
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
        const ip = multiplayerIpInput.value.trim();
        if (!ip) {
            alert('Zəhmət olmasa, server IP adresini daxil edin.');
            return;
        }

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
