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

    const instructionsTab = document.getElementById('instructions-tab');
    if (instructionsTab) {
        instructionsTab.innerHTML = `
            <div class="card glass">
                <h2><span class="icon">🖥️</span> VPS ile stabil multiplayer server</h2>
                <p>GitHub Pages yalniz browser klientidir. Real CS 1.6 server VPS-de isleyir ve browser klient WSS/WebSocket ile ona qosulur.</p>

                <div class="steps-timeline" style="margin-top: 20px;">
                    <div class="step-item">
                        <div class="step-num">1</div>
                        <div class="step-details">
                            <h3>VPS ve domain hazirla</h3>
                            <p>Bir Ubuntu/Debian VPS gotur, domeni VPS IP-sine yonelt ve firewall-da <strong>80/tcp</strong>, <strong>443/tcp</strong> portlarini ac. Native CS klientler de qoslacaqsa <strong>27015/udp</strong> ac.</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">2</div>
                        <div class="step-details">
                            <h3>Server stack-i baslat</h3>
                            <pre><code>git clone https://github.com/ulviabbasli/Cs.git
cd Cs/server
cp .env.example .env
nano .env
docker compose up -d --build</code></pre>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">3</div>
                        <div class="step-details">
                            <h3>.env faylini doldur</h3>
                            <pre><code>DOMAIN=cs.example.com
ACME_EMAIL=you@example.com
SERVER_NAME=Office CS 1.6
RCON_PASSWORD=change-this</code></pre>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">4</div>
                        <div class="step-details">
                            <h3>Yoxla</h3>
                            <pre><code>curl https://cs.example.com/health
docker compose logs -f</code></pre>
                            <p>Health cavabi <code>{"ok":true}</code> qaytarirsa bridge isleyir.</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-num">5</div>
                        <div class="step-details">
                            <h3>Browserden qosul</h3>
                            <p>Bu sehifede multiplayer qutusuna yalniz domeni yaz: <code>cs.example.com</code>. Klient avtomatik <code>wss://cs.example.com/websocket</code> formatinda qosulur.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card glass margin-top-20">
                <h2><span class="icon">ℹ️</span> Vacib qeydler</h2>
                <div class="faq-list">
                    <details class="faq-item" open>
                        <summary>Qara ekran niye olur?</summary>
                        <p>Browser ZIP fayli natamam olanda engine acilir, amma oyun render etmir. ZIP-de <code>cstrike/maps</code>, <code>models</code>, <code>sound</code>, <code>sprites</code> ve <code>valve/pak0.pak</code> kimi resurslar olmalidir.</p>
                    </details>
                    <details class="faq-item">
                        <summary>Is komputerinde ne qurulur?</summary>
                        <p>Hech ne. Is komputerinde yalniz browser acilir. Server ve bridge VPS-de isleyir.</p>
                    </details>
                    <details class="faq-item">
                        <summary>Bu her yerde istifade oluna biler?</summary>
                        <p>Yalniz icaze verilen is muhitinde. Sirket qaydalarini ve firewall siyaseti pozulmamali, oyun fayllari ise qanuni menbeli olmalidir.</p>
                    </details>
                </div>
            </div>
        `;
    }



    // ----------------------------------------------------
    // 3. MULTIPLAYER SETTINGS LOGIC (WASM)
    // ----------------------------------------------------
    const btnStartMultiplayer = document.getElementById('btn-start-multiplayer');
    const multiplayerIpInput = document.getElementById('multiplayer-ip-input');

    const queryServer = new URLSearchParams(window.location.search).get('server');
    const savedServer = window.localStorage.getItem('cs_web_server');
    if (multiplayerIpInput && (queryServer || savedServer)) {
        multiplayerIpInput.value = queryServer || savedServer;
    }

    btnStartMultiplayer.addEventListener('click', () => {
        let ip = multiplayerIpInput.value.trim();
        if (!ip) {
            alert('Zəhmət olmasa, server IP adresini daxil edin.');
            return;
        }

        // Clean up IP input: strip protocols and trailing slashes
        ip = ip.replace(/^(https?:\/\/|wss?:\/\/)/i, '');
        ip = ip.replace(/\/websocket\/?$/i, '');
        ip = ip.replace(/\/+$/, '');
        window.localStorage.setItem('cs_web_server', ip);

        const gameUrl = `./engine/index.html?ip=${encodeURIComponent(ip)}`;
        
        // Open in new tab
        window.open(gameUrl, '_blank');
    });

});
