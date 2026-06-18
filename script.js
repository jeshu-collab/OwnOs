// =========================
// CLOCK SYSTEM & TOP BAR
// =========================
function updateTime() {
    var timeElement = document.querySelector("#timeElement");
    if (timeElement) {
        var options = { hour: '2-digit', minute: '2-digit' };
        timeElement.innerHTML = new Date().toLocaleString('en-US', options).replace(/,/g, '');
    }
}
setInterval(updateTime, 1000);
updateTime();

function updateTopBar() {
    const now = new Date();
    const timeElement = document.getElementById("timeElement");
    if (timeElement) {
        timeElement.innerText = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    const dateTrigger = document.getElementById("date-trigger");
    if (dateTrigger) {
        dateTrigger.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
}
updateTopBar();
setInterval(updateTopBar, 1000);

// =========================
// OS WINDOW MANAGER (MERGED)
// =========================
let highestZIndex = 100;

function bringToFront(windowElement) {
    highestZIndex++;
    windowElement.style.zIndex = highestZIndex;
}

function toggleApp(appId) {
    const app = document.getElementById(appId);
    if (!app) return;

    // If it's already open, run the close sequence
    if (app.classList.contains("is-open") || app.style.display === 'block') {
        closeApp(appId);
    } else {
        // Open the app
        app.style.display = "block";
        bringToFront(app);

        // Trigger animation class
        setTimeout(() => {
            app.classList.add("is-open");
        }, 10);

        // If it's the terminal, automatically focus the typing cursor!
        if (appId === 'terminal-app') {
            setTimeout(() => {
                const termInput = document.getElementById('term-input');
                if (termInput) termInput.focus();
            }, 100);
        }
    }
}

// 2. Close App (Upgraded with Terminal Reset)
function closeApp(appId) {
    const app = document.getElementById(appId);
    if (!app) return;

    app.classList.remove("is-open");

    // Wait for CSS shrink animation to finish before hiding
    setTimeout(() => {
        if (!app.classList.contains("is-open")) {
            app.style.display = "none";

            // --- NEW: Reset Terminal on Close ---
            if (appId === 'terminal-app') {
                const termOutput = document.getElementById("term-output");
                const termInput = document.getElementById("term-input");

                // Wipes the history and restores the boot text
                if (termOutput) {
                    termOutput.innerHTML = `
                        <div>Limux OS v1.0.0 (tty1)</div>
                        <div>Type 'help' to see available commands.</div>
                        <br>
                    `;
                }
                // Clears whatever you were typing
                if (termInput) termInput.value = "";
            }
            // ------------------------------------
        }
    }, 250);
}

function minimizeApp(appId) {
    const appWindow = document.getElementById(appId);
    if (appWindow) appWindow.style.display = 'none';
}

function maximizeApp(appId) {
    const appWindow = document.getElementById(appId);
    if (!appWindow) return;

    if (appWindow.classList.contains('maximized')) {
        appWindow.classList.remove('maximized');
        appWindow.style.width = appWindow.dataset.prevWidth;
        appWindow.style.height = appWindow.dataset.prevHeight;
        appWindow.style.top = appWindow.dataset.prevTop;
        appWindow.style.left = appWindow.dataset.prevLeft;
    } else {
        appWindow.dataset.prevWidth = appWindow.style.width || getComputedStyle(appWindow).width;
        appWindow.dataset.prevHeight = appWindow.style.height || getComputedStyle(appWindow).height;
        appWindow.dataset.prevTop = appWindow.style.top || getComputedStyle(appWindow).top;
        appWindow.dataset.prevLeft = appWindow.style.left || getComputedStyle(appWindow).left;

        appWindow.classList.add('maximized');
        appWindow.style.width = '100vw';
        appWindow.style.height = 'calc(100vh - 80px)';
        appWindow.style.top = '0';
        appWindow.style.left = '0';
        bringToFront(appWindow);
    }
}

// =========================
// DRAGGABLE WINDOWS
// =========================
function makeDraggable(windowElement) {
    let mouseX = 0;
    let mouseY = 0;

    const header = windowElement.querySelector(".window-header");
    if (!header) return;

    header.onmousedown = startDrag;

    function startDrag(event) {
        event.preventDefault();
        bringToFront(windowElement);

        mouseX = event.clientX;
        mouseY = event.clientY;

        document.onmousemove = drag;
        document.onmouseup = stopDrag;
    }

    function drag(event) {
        event.preventDefault();
        let dx = event.clientX - mouseX;
        let dy = event.clientY - mouseY;

        mouseX = event.clientX;
        mouseY = event.clientY;

        let newTop = windowElement.offsetTop + dy;
        let newLeft = windowElement.offsetLeft + dx;

        const topBoundary = 0;
        if (newTop < topBoundary) {
            newTop = topBoundary;
        }

        windowElement.style.left = newLeft + "px";
        windowElement.style.top = newTop + "px";
    }

    function stopDrag() {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}

// Auto Setup All Windows
document.querySelectorAll(".window").forEach(windowElement => {
    makeDraggable(windowElement);
    windowElement.addEventListener("mousedown", () => bringToFront(windowElement));
});

// =========================
// CALENDAR WIDGET ENGINE
// =========================
let navDate = new Date();

function renderCalendar() {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();
    const realToday = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const monthHeader = document.getElementById("cal-month-year");
    if (monthHeader) monthHeader.innerText = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysContainer = document.getElementById("cal-days");
    if (!daysContainer) return;
    daysContainer.innerHTML = "";

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "cal-day empty";
        daysContainer.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "cal-day";
        dayDiv.innerText = i;

        if (i === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear()) {
            dayDiv.classList.add("current");
        }
        daysContainer.appendChild(dayDiv);
    }
}

const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");
if (prevBtn) prevBtn.addEventListener("click", () => { navDate.setMonth(navDate.getMonth() - 1); renderCalendar(); });
if (nextBtn) nextBtn.addEventListener("click", () => { navDate.setMonth(navDate.getMonth() + 1); renderCalendar(); });
renderCalendar();

// =========================
// TERMINAL APP ENGINE
// =========================
const termInput = document.getElementById("term-input");
const termOutput = document.getElementById("term-output");
const termContainer = document.getElementById("term-container");

if (termContainer) {
    termContainer.addEventListener("click", () => {
        if (termInput) termInput.focus();
    });
}

if (termInput) {
    termInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            const command = termInput.value.trim();

            // 1. Print the command the user just typed
            printLine(`<span style="color: #87af5f; font-weight: bold;">jaswanth@limux:~$</span> <span style="color: #34e2e2;">${command}</span>`);

            // 2. Process the command
            processCommand(command);

            // 3. Clear the input box
            termInput.value = "";

            // 4. FIX: Wait 10ms for the DOM to render the new text, then force scroll!
            setTimeout(() => {
                if (termContainer) termContainer.scrollTop = termContainer.scrollHeight;
                termInput.scrollIntoView({ block: "end" });
            }, 10);
        }
    });
}

function printLine(html) {
    const newLine = document.createElement("div");
    newLine.innerHTML = html;
    newLine.style.marginBottom = "4px";
    if (termOutput) termOutput.appendChild(newLine);
}

function processCommand(cmd) {
    if (cmd === "") return;

    const args = cmd.split(" ");
    const baseCmd = args[0].toLowerCase();

    switch (baseCmd) {
        case "help": {
            printLine("<div style='margin-bottom: 8px; font-weight: bold; color: #eeeeec;'>Available commands:</div>");
            const commandsList = [
                { cmd: "help", desc: "Show this message" },
                { cmd: "whoami", desc: "Display current user" },
                { cmd: "date", desc: "Show current system date/time" },
                { cmd: "echo", desc: "Print text to the terminal" },
                { cmd: "clear", desc: "Clear the terminal output" },
                { cmd: "sysinfo", desc: "Display system information" },
                { cmd: "calc", desc: "Evaluate mathematical expressions" },
                { cmd: "fetch", desc: "Display OS logo and stats" },
                { cmd: "hack", desc: "Initiate mainframe infiltration" },
                { cmd: "matrix", desc: "Enter the digital rain" },
                { cmd: "apt-get", desc: "Advanced package tool" }
            ];
            commandsList.forEach(c => {
                printLine(`
                    <div style="display: flex; gap: 15px;">
                        <span style="color: #34e2e2; width: 80px;">${c.cmd}</span>
                        <span style="color: #eeeeec;">- ${c.desc}</span>
                    </div>
                `);
            });
            break;
        }

        case "whoami": printLine("jaswanth - System Admin & Developer"); break;
        case "date": printLine(new Date().toString()); break;
        case "echo": printLine(args.slice(1).join(" ")); break;
        case "clear": if (termOutput) termOutput.innerHTML = ""; break;
        case "sysinfo": printLine(`OS: Limux v1.0<br>Kernel: Web-Based DOM<br>UI: Transparent Glass<br>Status: <span style="color:#8ae234">Stable</span>`); break;

        case "calc": {
            try {
                const mathExpression = args.slice(1).join(" ");
                const result = eval(mathExpression);
                printLine(`<span style="color:#8ae234">${result}</span>`);
            } catch {
                printLine(`<span style="color:#ef2929">Invalid expression. Try: calc 5 + 5</span>`);
            }
            break;
        }

        case "hack":
            if (termInput) termInput.disabled = true;
            printLine(`<span style="color:#ef2929">Bypassing security protocols...</span>`);
            setTimeout(() => { printLine(`<span style="color:#34e2e2">Extracting encrypted files... [||||||||||] 100%</span>`); }, 1000);
            setTimeout(() => {
                printLine(`<span style="color:#8ae234">Access Granted. Payload deployed.</span>`);
                if (termInput) { termInput.disabled = false; termInput.focus(); }
            }, 2500);
            break;

        case "fetch": {
            const asciiArt = `
<span style="color:#34e2e2">  _      _____ __  __ _    _ __  __</span>  <span style="color:#87af5f; font-weight:bold;">jaswanth@limux</span>
<span style="color:#34e2e2"> | |    |_   _|  \\/  | |  | |\\ \\/ /</span>  -------------------
<span style="color:#34e2e2"> | |      | | | \\  / | |  | | \\  / </span>  <span style="color:#8ae234">OS</span>: Limux Web Kernel 1.0
<span style="color:#34e2e2"> | |____ _| |_| |\\/| | |__| | /  \\ </span>  <span style="color:#8ae234">UI</span>: Transparent Glass
<span style="color:#34e2e2"> |______|_____|_|  |_|\\____/ /_/\\_\\</span>  <span style="color:#8ae234">Packages</span>: 4 (Cam, Calc, Term, Notes)
<span style="color:#34e2e2">                                   </span>  <span style="color:#8ae234">Shell</span>: Limux Bash`;
            printLine(`<pre style="line-height: 1.2; margin: 10px 0;">${asciiArt}</pre>`);
            break;
        }

        case "apt-get": {
            if (args[1] === "moo") {
                const cow = `
         (__) 
         (oo) 
   /------\\/ 
  / |    ||   
 * /\\---/\\ 
    ~~   ~~   
...."Have you mooed today?"...`;
                printLine(`<pre style="line-height: 1.2; margin: 0; color: #eeeeec;">${cow}</pre>`);
            } else {
                printLine(`<span style="color:#ef2929">E: Invalid operation ${args[1] || ""}</span>`);
            }
            break;
        }

        case "sudo":
            if (args[1] === "rm" && args[2] === "-rf" && args[3] === "/") {
                printLine(`<span style="color:#ef2929">CRITICAL WARNING: Attempting to delete root file system...</span>`);
                setTimeout(() => printLine(`<span style="color:#ef2929">Just kidding. This is a web browser. Nice try though!</span>`), 1500);
            } else {
                printLine(`jaswanth is not in the sudoers file. <span style="color:#ef2929">This incident will be reported.</span>`);
            }
            break;

        case "matrix":
            if (document.getElementById("matrix-canvas")) {
                printLine(`<span style="color:#ef2929">Matrix is already running. Press ESC to exit.</span>`);
                break;
            }
            printLine(`<span style="color:#8ae234">Initializing the Matrix... Press ESC to jack out.</span>`);
            setTimeout(startMatrix, 800);
            break;

        default:
            printLine(`<span style="color:#ef2929">bash: ${baseCmd}: command not found</span>`);
            break;
    }
}

function startMatrix() {
    if (document.getElementById("matrix-canvas")) return;

    const canvas = document.createElement("canvas");
    canvas.id = "matrix-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.zIndex = "999999";
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const interval = setInterval(() => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = letters.charAt(Math.floor(Math.random() * letters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }, 33);

    const escListener = (e) => {
        if (e.key === "Escape") {
            clearInterval(interval);
            canvas.remove();
            document.removeEventListener("keydown", escListener);

            if (termOutput && termContainer) {
                const newLine = document.createElement("div");
                newLine.innerHTML = `<span style="color:#34e2e2">Disconnected from the Matrix.</span>`;
                newLine.style.marginBottom = "4px";
                termOutput.appendChild(newLine);
                termContainer.scrollTop = termContainer.scrollHeight;
            }
        }
    };
    document.addEventListener("keydown", escListener);
}

// =========================
// CALCULATOR APP ENGINE
// =========================
let calcCurrentVal = '0';
const calcDisplay = document.getElementById('calc-display');

function calcInput(val) {
    if (!calcDisplay) return;

    if (val === 'C') {
        calcCurrentVal = '0';
    } else if (val === '=') {
        try {
            let result = String(new Function('return ' + calcCurrentVal)());
            if (result.includes('.') && result.length > 10) {
                result = parseFloat(result).toFixed(6).replace(/\.?0+$/, '');
            }
            calcCurrentVal = result;
        } catch (e) {
            calcCurrentVal = 'Error';
        }
    } else {
        if (calcCurrentVal === '0' || calcCurrentVal === 'Error') {
            if (['+', '-', '*', '/'].includes(val)) calcCurrentVal += val;
            else calcCurrentVal = val;
        } else {
            calcCurrentVal += val;
        }
    }

    if (calcCurrentVal.length > 12) calcDisplay.style.fontSize = '18px';
    else calcDisplay.style.fontSize = '28px';

    let displayString = calcCurrentVal.replace(/\*/g, '×').replace(/\//g, '÷');
    calcDisplay.innerText = displayString;
}

// =========================
// AUDIO ENGINE (Local)
// =========================
let isMusicPlaying = false;
let currentTrackIndex = 0;
const currentAudio = new Audio();
const playlist = [
    { title: "Track 1 Name", artist: "Artist 1", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop", src: "./songs/song1.mp3", duration: "03:00" }
]; // Truncated to 1 track for code cleanliness, add the rest back as needed!

function loadTrack(index) {
    const track = playlist[index];
    if (!track) return;
    const titleEl = document.getElementById("music-title");
    const artistEl = document.getElementById("music-artist");
    const totalTimeEl = document.getElementById("time-total");
    const coverEl = document.getElementById("music-cover");

    if (totalTimeEl) totalTimeEl.innerText = track.duration;
    if (titleEl) titleEl.innerText = "Loading...";
    if (artistEl) artistEl.innerText = "...";

    currentAudio.src = track.src;
    currentAudio.load();

    if (window.jsmediatags) {
        fetch(track.src)
            .then(response => response.blob())
            .then(blob => {
                window.jsmediatags.read(blob, {
                    onSuccess: function (tag) {
                        if (tag.tags.title && titleEl) titleEl.innerText = tag.tags.title;
                        else if (titleEl) titleEl.innerText = track.src.split('/').pop().split('.')[0];

                        if (tag.tags.artist && artistEl) artistEl.innerText = tag.tags.artist;
                        else if (artistEl) artistEl.innerText = "Unknown Artist";

                        const picture = tag.tags.picture;
                        if (picture && coverEl) {
                            let base64String = "";
                            for (let i = 0; i < picture.data.length; i++) base64String += String.fromCharCode(picture.data[i]);
                            coverEl.src = `data:${picture.format};base64,${window.btoa(base64String)}`;
                        } else if (coverEl) coverEl.src = track.cover;
                    },
                    onError: function () {
                        if (titleEl) titleEl.innerText = track.title;
                        if (artistEl) artistEl.innerText = track.artist;
                        if (coverEl) coverEl.src = track.cover;
                    }
                });
            }).catch(() => {
                if (titleEl) titleEl.innerText = track.title;
                if (coverEl) coverEl.src = track.cover;
            });
    }

    const slider = document.getElementById("music-slider");
    const currentTimeEl = document.getElementById("time-current");
    if (slider) { slider.value = 0; slider.style.background = `rgba(255, 255, 255, 0.15)`; }
    if (currentTimeEl) currentTimeEl.innerText = "00:00";
}

function playSafe() {
    let playPromise = currentAudio.play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            isMusicPlaying = true;
            const playIcon = document.getElementById('play-icon');
            if (playIcon) playIcon.innerHTML = '<path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        }).catch(error => {
            isMusicPlaying = false;
            const playIcon = document.getElementById('play-icon');
            if (playIcon) playIcon.innerHTML = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
        });
    }
}

function togglePlay() {
    if (currentAudio.paused) playSafe();
    else {
        currentAudio.pause();
        isMusicPlaying = false;
        const playIcon = document.getElementById('play-icon');
        if (playIcon) playIcon.innerHTML = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
    }
}

function nextTrack() {
    currentTrackIndex++;
    if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;
    loadTrack(currentTrackIndex);
    if (isMusicPlaying) setTimeout(() => { playSafe(); }, 50);
}

function prevTrack() {
    currentTrackIndex--;
    if (currentTrackIndex < 0) currentTrackIndex = playlist.length - 1;
    loadTrack(currentTrackIndex);
    if (isMusicPlaying) setTimeout(() => { playSafe(); }, 50);
}

function toggleMusicWidget() {
    const widget = document.getElementById('top-music-widget');
    if (widget) widget.classList.toggle('closed');
}

currentAudio.addEventListener('timeupdate', () => {
    if (!isNaN(currentAudio.duration)) {
        const progressPercent = (currentAudio.currentTime / currentAudio.duration) * 100;
        const slider = document.getElementById('music-slider');
        const currentTimeEl = document.getElementById("time-current");

        if (slider) {
            slider.value = progressPercent;
            slider.style.background = `linear-gradient(to right, #d1bfe3 ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%)`;
        }

        let currentMins = Math.floor(currentAudio.currentTime / 60);
        let currentSecs = Math.floor(currentAudio.currentTime % 60);
        if (currentTimeEl) currentTimeEl.innerText = `0${currentMins}:${currentSecs < 10 ? '0' + currentSecs : currentSecs}`;
    }
});

currentAudio.addEventListener('ended', () => nextTrack());

const sliderEl = document.getElementById('music-slider');
if (sliderEl) {
    sliderEl.addEventListener('input', function (e) {
        if (!isNaN(currentAudio.duration)) currentAudio.currentTime = (e.target.value / 100) * currentAudio.duration;
    });
}
if (playlist.length > 0) loadTrack(currentTrackIndex);

// =========================
// LOCAL STORAGE NOTES ENGINE
// =========================
let notesArray = JSON.parse(localStorage.getItem('limux_system_notes')) || [];
let activeNoteId = null;

const notesListEl = document.getElementById('notes-list');
const noteTitleInput = document.getElementById('note-title-input');
const noteBodyInput = document.getElementById('note-body-input');
const newNoteBtn = document.getElementById('new-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const deleteNoteBtn = document.getElementById('delete-note-btn');

function deleteCurrentNote() {
    if (!activeNoteId) return;
    notesArray = notesArray.filter(note => note.id !== activeNoteId);
    saveNotesToStorage();
    if (notesArray.length > 0) loadNoteIntoEditor(notesArray[0].id);
    else createNewNote();
}
if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', deleteCurrentNote);

function saveAndNewNote() {
    handleTyping();
    const originalText = saveNoteBtn.innerText;
    saveNoteBtn.innerText = "Saved!";
    saveNoteBtn.style.background = "rgba(39, 201, 63, 0.2)";
    saveNoteBtn.style.color = "#46da5c";
    saveNoteBtn.style.borderColor = "rgba(39, 201, 63, 0.4)";
    setTimeout(() => {
        saveNoteBtn.innerText = originalText;
        saveNoteBtn.style.background = "";
        saveNoteBtn.style.color = "";
        saveNoteBtn.style.borderColor = "";
        createNewNote();
    }, 600);
}
if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveAndNewNote);

function saveNotesToStorage() {
    localStorage.setItem('limux_system_notes', JSON.stringify(notesArray));
    renderNotesList();
}

function renderNotesList() {
    if (!notesListEl) return;
    notesListEl.innerHTML = '';
    notesArray.forEach(note => {
        const div = document.createElement('div');
        div.className = `note-item ${note.id === activeNoteId ? 'active' : ''}`;
        div.onclick = () => loadNoteIntoEditor(note.id);
        div.innerHTML = `<h4>${note.title || 'Untitled Note'}</h4><p>${note.body || ''}</p>`;
        notesListEl.appendChild(div);
    });
}

function createNewNote() {
    const newNote = { id: Date.now().toString(), title: '', body: '', timestamp: Date.now() };
    notesArray.unshift(newNote);
    activeNoteId = newNote.id;
    if (noteTitleInput) noteTitleInput.value = '';
    if (noteBodyInput) noteBodyInput.value = '';
    if (noteTitleInput) noteTitleInput.focus();
    saveNotesToStorage();
}

function loadNoteIntoEditor(id) {
    activeNoteId = id;
    const note = notesArray.find(n => n.id === id);
    if (note) {
        if (noteTitleInput) noteTitleInput.value = note.title;
        if (noteBodyInput) noteBodyInput.value = note.body;
    }
    renderNotesList();
}

function handleTyping() {
    if (!activeNoteId) return;
    const note = notesArray.find(n => n.id === activeNoteId);
    if (note) {
        note.title = noteTitleInput ? noteTitleInput.value : '';
        note.body = noteBodyInput ? noteBodyInput.value : '';
        note.timestamp = Date.now();
        saveNotesToStorage();
    }
}

if (noteTitleInput) noteTitleInput.addEventListener('input', handleTyping);
if (noteBodyInput) noteBodyInput.addEventListener('input', handleTyping);
if (newNoteBtn) newNoteBtn.addEventListener('click', createNewNote);

if (notesArray.length > 0) loadNoteIntoEditor(notesArray[0].id);
else createNewNote();

// =========================
// HARDWARE CAMERA ENGINE
// =========================
let cameraStream = null;

async function bootCamera() {
    const videoEl = document.getElementById('camera-feed');
    if (!videoEl) return;
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
        videoEl.srcObject = cameraStream;
        videoEl.play();
    } catch (err) {
        console.error("Camera access denied or missing:", err);
        alert("Could not access the camera. Please ensure permissions are granted.");
    }
}

async function handleCameraToggle() {
    const cameraWindow = document.getElementById('camera-app');
    toggleApp('camera-app');
    if (!cameraWindow) return;
    setTimeout(async () => {
        if (cameraWindow.style.display !== 'none') await bootCamera();
        else if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
    }, 50);
}

function closeCameraApp() {
    closeApp('camera-app');
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function takePhoto() {
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('camera-canvas');
    const flash = document.getElementById('camera-flash');
    if (!cameraStream || !video || !canvas || !flash) return;

    flash.classList.add('flash');
    setTimeout(() => flash.classList.remove('flash'), 50);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = `Limux_Capture_${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}