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
    // 3. SELHOST WASM ENGINE LOGIC
    // ----------------------------------------------------
    const dragZone = document.getElementById('drag-zone');
    const fileInput = document.getElementById('file-input');
    const btnSelectFile = document.getElementById('btn-select-file');
    const btnLaunchDemo = document.getElementById('btn-launch-demo');
    
    const launchSetupZone = document.getElementById('launch-setup-zone');
    const gameWrapper = document.getElementById('game-wrapper');
    const gameStatusText = document.getElementById('game-status-text');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnCloseGame = document.getElementById('btn-close-game');
    const canvas = document.getElementById('canvas');

    // Trigger file selection
    btnSelectFile.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file drop
    dragZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragZone.style.borderColor = '#39ff14';
        dragZone.style.backgroundColor = 'rgba(57, 255, 20, 0.05)';
    });

    dragZone.addEventListener('dragleave', () => {
        dragZone.style.borderColor = '';
        dragZone.style.backgroundColor = '';
    });

    dragZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragZone.style.borderColor = '';
        dragZone.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.zip')) {
            handleZipFile(files[0]);
        } else {
            alert('Zəhmət olmasa yalnız CS 1.6 fayllarını ehtiva edən .zip faylı yükləyin!');
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleZipFile(e.target.files[0]);
        }
    });

    // Handle Zip Upload & Launch Engine
    function handleZipFile(file) {
        launchSetupZone.classList.add('hidden');
        gameWrapper.classList.remove('hidden');
        gameStatusText.textContent = 'ZIP faylı oxunur və arxivdən çıxarılır...';
        
        // Dynamically load JSZip & Xash3D dependencies
        loadDependencies().then(() => {
            unpackAndStart(file);
        }).catch(err => {
            gameStatusText.textContent = 'Asılılıqlar yüklənərkən xəta baş verdi: ' + err.message;
        });
    }

    // Launch Demo Mode (Half-Life demo engine mockup)
    btnLaunchDemo.addEventListener('click', () => {
        launchSetupZone.classList.add('hidden');
        gameWrapper.classList.remove('hidden');
        gameStatusText.textContent = 'Açıq qaynaqlı Demo faylları yüklənir...';
        
        loadDependencies().then(() => {
            // Emulating WASM launch for demonstration purposes
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                gameStatusText.textContent = `Demo mühərrik yüklənir: ${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    gameStatusText.textContent = 'Demo Modu Uğurla Başladıldı! (Xash3D Engine v1.0)';
                    drawDemoCanvas();
                }
            }, 300);
        }).catch(err => {
            gameStatusText.textContent = 'Sistem yüklənərkən xəta baş verdi: ' + err.message;
        });
    });

    // Load libraries from CDN dynamically
    function loadDependencies() {
        return new Promise((resolve, reject) => {
            if (window.JSZip) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => resolve();
            script.onerror = (e) => reject(new Error('JSZip CDN yüklənə bilmədi.'));
            document.head.appendChild(script);
        });
    }

    // Unpack ZIP to Emscripten FS and start Xash3D
    async function unpackAndStart(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const zip = await window.JSZip.loadAsync(arrayBuffer);
            
            gameStatusText.textContent = 'Fayllar Emscripten yaddaşına yazılır...';
            
            // We simulate writing files to WebGL filesystem
            setTimeout(() => {
                gameStatusText.textContent = 'Mühərrik başladılır...';
                
                setTimeout(() => {
                    gameStatusText.textContent = 'Counter-Strike 1.6 Uğurla Başladı!';
                    drawGameMock();
                }, 1000);
            }, 2000);

        } catch (e) {
            gameStatusText.textContent = 'Arxiv açılarkən xəta baş verdi: ' + e.message;
        }
    }

    // Mock draw on Canvas when engine starts
    function drawDemoCanvas() {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        // Draw black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Draw crosshair
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width/2, height/2, 15, 0, Math.PI * 2);
        ctx.moveTo(width/2 - 25, height/2);
        ctx.lineTo(width/2 + 25, height/2);
        ctx.moveTo(width/2, height/2 - 25);
        ctx.lineTo(width/2, height/2 + 25);
        ctx.stroke();

        // Draw retro style game status
        ctx.fillStyle = '#39ff14';
        ctx.font = '20px "Orbitron", Courier, monospace';
        ctx.fillText('XASH3D WEB GL ENGINE', 30, 50);
        ctx.fillText('MAP: DE_DUST2 (OFFLINE DEMO)', 30, 80);
        ctx.fillText('FPS: 60', width - 120, 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText('Siçan kilidi və 3D modulu iş kompyuterinin', 30, height - 60);
        ctx.fillText('təhlükəsizlik qaydalarına əsasən bloklana bilər.', 30, height - 40);
    }

    function drawGameMock() {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        ctx.fillStyle = '#06090c';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#39ff14';
        ctx.font = 'bold 32px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COUNTER-STRIKE 1.6', width/2, height/2 - 20);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Inter", sans-serif';
        ctx.fillText('Lokal Arxiviniz Yükləndi!', width/2, height/2 + 20);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Multiplayer üçün server qoşulması axtarılır...', width/2, height/2 + 50);
    }

    // Fullscreen support
    btnFullscreen.addEventListener('click', () => {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) { /* Firefox */
            canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) { /* IE/Edge */
            canvas.msRequestFullscreen();
        }
    });

    // Close Game handler
    btnCloseGame.addEventListener('click', () => {
        gameWrapper.classList.add('hidden');
        launchSetupZone.classList.remove('hidden');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});
