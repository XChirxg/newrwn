// Newrwn Shared Utility Library
// Handles: Layout building, URL/Session state, settings gear popup modal, PeerJS Remote Control, TTS, and Theme.

window.Newrwn = {
    // Current state
    topic: 'Sample Topic',
    content: null,
    purpose: 'Learning and understanding',
    toolSlug: '',
    
    // Remote control
    peer: null,
    conn: null,
    remoteId: null,
    isController: false,
    
    // TTS
    synth: window.speechSynthesis,
    activeUtterance: null,

    // Initialize the page
    init(toolSlug) {
        this.toolSlug = toolSlug;
        this.applyTheme();
        
        // Parse state
        this.loadState();
        
        // Check if we are in remote controller mode
        const params = new URLSearchParams(window.location.search);
        if (params.get('remote') === 'controller') {
            this.isController = true;
            this.initControllerMode(params.get('peerId'));
            return;
        }
        
        // Render UI panels
        this.renderHeader();
        this.renderSettingsModal();
        
        // Initialize remote control host
        this.initHostMode();
        
        // Return loaded data to the tool
        return {
            topic: this.topic,
            content: this.content,
            purpose: this.purpose
        };
    },
    
    // Load data from SessionStorage or URL fallback
    loadState() {
        const params = new URLSearchParams(window.location.search);
        
        this.topic = sessionStorage.getItem('activeTopic') || params.get('topic') || 'Photosynthesis';
        this.purpose = sessionStorage.getItem('activePurpose') || params.get('purpose') || 'Core biological processes';
        
        let rawContent = sessionStorage.getItem('activeContent');
        if (rawContent) {
            try {
                this.content = JSON.parse(rawContent);
            } catch (e) {
                console.error("Session storage parse failed", e);
            }
        }
        
        if (!this.content && params.get('content')) {
            try {
                this.content = JSON.parse(decodeURIComponent(params.get('content')));
            } catch (e) {
                console.error("URL content parse failed", e);
            }
        }
        
        if (!this.content) {
            this.content = this.getDefaultSampleData(this.toolSlug);
        }
    },
    
    // Fallback data
    getDefaultSampleData(tool) {
        if (tool === 'quiz') {
            return [
                {
                    question: "Which cell organelle is the site of photosynthesis?",
                    options: ["Mitochondria", "Chloroplast", "Ribosome", "Nucleus"],
                    answer: 1,
                    explanation: "Photosynthesis occurs inside the chloroplasts of plant cells, which contain chlorophyll."
                },
                {
                    question: "What is the primary product of photosynthesis?",
                    options: ["Oxygen", "Carbon Dioxide", "Glucose", "Water"],
                    answer: 2,
                    explanation: "Glucose is the simple sugar plants produce as food, while oxygen is released as a byproduct."
                }
            ];
        }
        return [
            { term: "Light Reactions", title: "Light Reactions", date: "Stage 1", label: "Phase 1", definition: "Light-dependent phase converting solar energy into chemical energy.", description: "Light-dependent phase converting solar energy into chemical energy.", bullets: ["Occurs in thylakoids", "Splits water to release oxygen", "Generates ATP and NADPH"] },
            { term: "Calvin Cycle", title: "Calvin Cycle", date: "Stage 2", label: "Phase 2", definition: "Light-independent phase fixing carbon dioxide into sugars.", description: "Light-independent phase fixing carbon dioxide into sugars.", bullets: ["Occurs in stroma", "Uses carbon dioxide", "Consumes ATP and NADPH to create glucose"] }
        ];
    },

    // Apply dark/light theme classes
    applyTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    },

    // Toggle theme from settings
    setTheme(theme) {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        const darkBtn = document.getElementById('toolThemeDarkBtn');
        const lightBtn = document.getElementById('toolThemeLightBtn');
        if (darkBtn && lightBtn) {
            darkBtn.classList.toggle('active', theme === 'dark');
            lightBtn.classList.toggle('active', theme === 'light');
        }
    },

    // Build the Top Nav Header dynamically (SUPER CLEAN: only Home and Gear settings icon)
    renderHeader() {
        const header = document.createElement('header');
        header.className = 'tool-top-nav glass';
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.left = '0';
        header.style.right = '0';
        header.style.height = '52px';
        
        header.innerHTML = `
            <div class="tool-left-actions">
                <a href="../index.html" class="btn btn-icon" title="Go Home" style="width:30px; height:30px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </a>
                <div class="tool-title-group">
                    <div class="tool-page-title" id="navToolTitle" style="font-size:14px;">${this.getToolName(this.toolSlug)}</div>
                    <div class="tool-topic-subtitle" id="navTopicSubtitle" style="font-size:10.5px;">${this.topic}</div>
                </div>
            </div>
            <div class="tool-right-actions">
                <button class="btn btn-icon" onclick="Newrwn.openToolSettings()" title="Settings" style="width:30px; height:30px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
            </div>
        `;
        document.body.insertBefore(header, document.body.firstChild);
    },

    // Render consolidated Settings Modal containing all actions
    renderSettingsModal() {
        const overlay = document.createElement('div');
        overlay.id = 'toolSettingsModal';
        overlay.className = 'modal-overlay';
        
        overlay.innerHTML = `
            <div class="modal-card glass" style="max-width:440px;">
                <div class="modal-header-bar" style="padding:12px 16px;">
                    <h2 style="font-size:16px;">Session Settings</h2>
                    <button class="btn btn-icon" onclick="Newrwn.closeToolSettings()" style="width:28px; height:28px;">✕</button>
                </div>
                <div class="modal-body" style="display:flex; flex-direction:column; gap:16px; padding:16px;">
                    
                    <!-- 1. Text to Speech -->
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                        <div>
                            <h3 style="font-size:14px; margin-bottom:2px;">Text-to-Speech (TTS)</h3>
                            <p style="font-size:11px; color:var(--text-muted);">Read active content aloud.</p>
                        </div>
                        <button class="btn btn-primary" onclick="Newrwn.speakActiveContent()" style="padding:6px 12px; font-size:12px; gap:6px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                            <span>Speak Now</span>
                        </button>
                    </div>

                    <!-- 2. JSON Data editing and Exporting -->
                    <div style="border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                        <h3 style="font-size:14px; margin-bottom:6px;">Study Data Management</h3>
                        <div style="display:flex; gap:8px;">
                            <button class="btn" onclick="Newrwn.openEditPanel()" style="flex:1; padding:6px; font-size:12px; gap:6px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                <span>Edit JSON</span>
                            </button>
                            <button class="btn" onclick="Newrwn.exportJSON()" style="flex:1; padding:6px; font-size:12px; gap:6px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                <span>Download JSON</span>
                            </button>
                        </div>
                        
                        <!-- Inline editor area, hidden by default -->
                        <div id="inlineEditorArea" style="display:none; margin-top:10px;">
                            <textarea class="form-control" id="toolTextArea" style="min-height: 140px; font-family: var(--font-mono); font-size:10.5px; margin-bottom:6px;"></textarea>
                            <div id="toolEditError" style="color: var(--danger); font-size:11px; margin-bottom:6px;"></div>
                            <button class="btn btn-primary" onclick="Newrwn.saveEditedContent()" style="width:100%; font-size:12px; padding:6px;">Apply Changes</button>
                        </div>
                    </div>

                    <!-- Tool Specific Settings Injection -->
                    <div id="toolSpecificSettingsWrap" style="border-bottom:1px solid var(--border-color); padding-bottom:10px; display:none;">
                        <h3 style="font-size:14px; margin-bottom:8px;">Tool Configurations</h3>
                        <div id="toolSpecificSettingsArea"></div>
                    </div>

                    <!-- 3. Theme Toggle -->
                    <div style="border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                        <h3 style="font-size:14px; margin-bottom:6px;">App Theme</h3>
                        <div style="display:flex; gap:8px;">
                            <button class="btn" id="toolThemeDarkBtn" onclick="Newrwn.setTheme('dark')" style="flex:1; padding:6px; font-size:12px;">Dark Mode</button>
                            <button class="btn" id="toolThemeLightBtn" onclick="Newrwn.setTheme('light')" style="flex:1; padding:6px; font-size:12px;">Light Mode</button>
                        </div>
                    </div>
-
                    <!-- 4. P2P Remote Pairing Control -->
                    <div style="border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                        <h3 style="font-size:14px; margin-bottom:4px;">Remote Controller</h3>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                            <div class="qr-code-wrap" id="toolQrcode" style="padding:6px; background:#fff; border-radius:var(--radius-sm);"></div>
                            <div id="toolRemoteStatus" style="font-family: var(--font-mono); font-size:11px; color:var(--accent);">
                                Generating pairing code...
                            </div>
                        </div>
                    </div>

                    <!-- 5. About newrwn -->
                    <div style="text-align:center; padding-top:4px;">
                        <h3 style="font-size:13px; margin-bottom:4px; color:var(--text-main); font-family:var(--font-heading);">About newrwn</h3>
                        <p style="font-size:11px; color:var(--text-muted); line-height:1.4;">
                            newrwn is a serverless study engine designed to turn dry study notes into interactive visual playgrounds. It runs entirely locally in your browser.
                        </p>
                    </div>

                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Setup initial theme highlight
        const theme = localStorage.getItem('theme') || 'dark';
        this.setTheme(theme);
    },

    getToolName(slug) {
        const names = {
            'flashcards': 'Flashcards',
            'ppt': 'Presentation Slides',
            'quiz': 'MCQ Quiz'
        };
        return names[slug] || 'Interactive Tool';
    },

    exportJSON() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.content, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${this.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${this.toolSlug}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    openToolSettings() {
        document.getElementById('toolSettingsModal').classList.add('active');
        // Redraw/regenerate QR code if peer is active
        if (this.peer && this.peer.open) {
            this.setupQRCode('newrwn-host-' + localStorage.getItem('remotePairingHash'));
        }
        
        // Inject tool specific settings if available
        const wrap = document.getElementById('toolSpecificSettingsWrap');
        const area = document.getElementById('toolSpecificSettingsArea');
        if (wrap && area && typeof window.getToolSettingsHtml === 'function') {
            area.innerHTML = window.getToolSettingsHtml();
            wrap.style.display = 'block';
            
            // Sync values from active state to modal elements
            if (typeof window.syncToolSettingsToModal === 'function') {
                window.syncToolSettingsToModal();
            }
        } else if (wrap) {
            wrap.style.display = 'none';
        }
    },
    closeToolSettings() {
        document.getElementById('toolSettingsModal').classList.remove('active');
        document.getElementById('inlineEditorArea').style.display = 'none';
    },

    openEditPanel() {
        const area = document.getElementById('inlineEditorArea');
        if (area.style.display === 'block') {
            area.style.display = 'none';
        } else {
            area.style.display = 'block';
            document.getElementById('toolTextArea').value = JSON.stringify(this.content, null, 2);
            document.getElementById('toolEditError').textContent = '';
        }
    },

    saveEditedContent() {
        const txt = document.getElementById('toolTextArea').value;
        try {
            const parsed = JSON.parse(txt);
            this.content = parsed;
            sessionStorage.setItem('activeContent', JSON.stringify(parsed));
            document.getElementById('inlineEditorArea').style.display = 'none';
            this.closeToolSettings();
            
            // Reload visual tool content
            if (window.loadToolData) {
                window.loadToolData(this.topic, this.content, this.purpose);
            } else {
                window.location.reload();
            }
        } catch (e) {
            document.getElementById('toolEditError').textContent = 'Invalid JSON: ' + e.message;
        }
    },

    speakText(text) {
        if (!this.synth) return;
        this.synth.cancel();
        const cleaned = text.replace(/[*#`_✦•]/g, '').trim();
        this.activeUtterance = new SpeechSynthesisUtterance(cleaned);
        this.activeUtterance.rate = 1.0;
        this.synth.speak(this.activeUtterance);
    },

    speakActiveContent() {
        if (window.speakCurrentItem) {
            window.speakCurrentItem();
        } else {
            this.speakText(this.topic + ". " + this.purpose);
        }
    },

    // ================= PEERJS REMOTE CONTROL HOST MODE =================
    initHostMode() {
        let hash = localStorage.getItem('remotePairingHash');
        if (!hash) {
            hash = Math.floor(100000 + Math.random() * 900000).toString();
            localStorage.setItem('remotePairingHash', hash);
        }
        
        const hostPeerId = 'newrwn-host-' + hash;
        this.peer = new Peer(hostPeerId);
        
        this.peer.on('open', (id) => {
            this.setupQRCode(hostPeerId);
        });

        this.peer.on('connection', (conn) => {
            this.conn = conn;
            const statusEl = document.getElementById('toolRemoteStatus');
            if (statusEl) {
                statusEl.innerHTML = "<span style='color:var(--success);'>Remote Connected!</span>";
            }
            setTimeout(() => {
                this.closeToolSettings();
            }, 1000);
            
            this.conn.on('data', (data) => {
                if (data && data.action) {
                    this.executeRemoteCommand(data.action);
                }
            });
        });
        
        this.peer.on('error', (err) => {
            console.warn('PeerJS connection warning:', err);
            const statusEl = document.getElementById('toolRemoteStatus');
            if (statusEl) {
                statusEl.innerHTML = "<span style='color:var(--warning);'>P2P standby</span>";
            }
        });
    },

    setupQRCode(hostId) {
        const qrEl = document.getElementById('toolQrcode');
        if (!qrEl) return;
        qrEl.innerHTML = '';
        
        const controllerUrl = window.location.origin + window.location.pathname + `?remote=controller&peerId=${hostId}`;
        
        new QRCode(qrEl, {
            text: controllerUrl,
            width: 100,
            height: 100,
            colorDark: "#09090b",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        const statusEl = document.getElementById('toolRemoteStatus');
        if (statusEl) {
            statusEl.textContent = `Pair ID: ${hostId.split('-').pop()}`;
        }
    },

    executeRemoteCommand(action) {
        if (action === 'next' && window.navigateNext) window.navigateNext();
        if (action === 'prev' && window.navigatePrev) window.navigatePrev();
        if (action === 'flip' && window.navigateFlip) window.navigateFlip();
        if (action === 'tts') this.speakActiveContent();
    },

    // ================= PEERJS REMOTE CONTROL CONTROLLER MODE =================
    initControllerMode(hostPeerId) {
        document.body.innerHTML = `
            <div class="tool-page" style="display:flex; justify-content:center; align-items:center; background:#09090b;">
                <div class="remote-control-panel glass">
                    <h2 style="font-size:20px; margin-bottom:4px;">Remote Pad</h2>
                    <p style="font-size:11px; color:var(--accent); margin-bottom:20px;" id="connLabel">Pairing with screen...</p>
                    
                    <div class="remote-pad">
                        <button class="btn remote-btn up" onclick="Newrwn.sendRemote('tts')" title="TTS" style="font-size:13px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                        </button>
                        <button class="btn remote-btn left" onclick="Newrwn.sendRemote('prev')" title="Previous" style="font-size:14px;">
                            &lt;
                        </button>
                        <button class="btn remote-btn center" onclick="Newrwn.sendRemote('flip')" title="Action/Flip" style="font-size:14px;">
                            ⟳
                        </button>
                        <button class="btn remote-btn right" onclick="Newrwn.sendRemote('next')" title="Next" style="font-size:14px;">
                            &gt;
                        </button>
                        <button class="btn remote-btn down" onclick="window.location.reload()" title="Refresh Connection" style="font-size:14px;">
                            ⟲
                        </button>
                    </div>
                    
                    <button class="btn" onclick="Newrwn.exitController()" style="width:100%; font-size:12px; padding:8px;">Disconnect Remote</button>
                </div>
            </div>
        `;

        this.peer = new Peer();
        this.peer.on('open', (id) => {
            this.conn = this.peer.connect(hostPeerId);
            
            this.conn.on('open', () => {
                document.getElementById('connLabel').innerHTML = "<span style='color:var(--success); font-weight:700;'>Connected to Screen</span>";
            });
            
            this.conn.on('close', () => {
                document.getElementById('connLabel').innerHTML = "<span style='color:var(--danger);'>Disconnected</span>";
            });
        });
        
        this.peer.on('error', (err) => {
            console.error('Remote controller pairing failed', err);
            document.getElementById('connLabel').innerHTML = "<span style='color:var(--danger);'>Link failed. Refresh screen.</span>";
        });
    },

    sendRemote(action) {
        if (this.conn && this.conn.open) {
            this.conn.send({ action: action });
            if (navigator.vibrate) navigator.vibrate(30);
        }
    },

    exitController() {
        if (this.peer) this.peer.destroy();
        window.location.href = '../index.html';
    }
};
