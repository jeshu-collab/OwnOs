// Setting up the top navigation clock system
function refreshClock() {
    var timeBox = document.querySelector("#timeElement");
    if (timeBox) {
        var formatStyle = { hour: '2-digit', minute: '2-digit' };
        timeBox.innerHTML = new Date().toLocaleString('en-US', formatStyle).replace(/,/g, '');
    }
}
setInterval(refreshClock, 1000);
refreshClock();

function refreshTopNavbar() {
    const todayNow = new Date();
    const timeBox = document.getElementById("timeElement");
    if (timeBox) {
        timeBox.innerText = todayNow.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    const dateBtn = document.getElementById("date-trigger");
    if (dateBtn) {
        dateBtn.innerText = todayNow.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
}
refreshTopNavbar();
setInterval(refreshTopNavbar, 1000);

// Managing the window layers and app toggles
let topWindowLayer = 100;

function focusWindow(winElem) {
    topWindowLayer++;
    winElem.style.zIndex = topWindowLayer;
}

function launchOrHideApp(targetAppId) {
    const targetApp = document.getElementById(targetAppId);
    if (!targetApp) return;

    // Checking if the app is already visible on the screen
    if (targetApp.classList.contains("is-open") || targetApp.style.display === 'block') {
        shutDownApp(targetAppId);
    } else {
        // Booting up the app window
        targetApp.style.display = "block";
        focusWindow(targetApp);

        // Applying a slight delay so the CSS pop animation works smoothly
        setTimeout(() => {
            targetApp.classList.add("is-open");
        }, 10);

        // Auto-focusing the terminal input so the user can just type immediately
        if (targetAppId === 'terminal-app') {
            setTimeout(() => {
                const limuxCommandLine = document.getElementById('term-input');
                if (limuxCommandLine) limuxCommandLine.focus();
            }, 100);
        }
    }
}

// Safely closing applications and resetting the terminal history
function shutDownApp(targetAppId) {
    const targetApp = document.getElementById(targetAppId);
    if (!targetApp) return;

    targetApp.classList.remove("is-open");

    // Waiting for the shrink animation to finish fully before hiding
    setTimeout(() => {
        if (!targetApp.classList.contains("is-open")) {
            targetApp.style.display = "none";

            // If the user closed the terminal, wipe the history clean
            if (targetAppId === 'terminal-app') {
                const terminalScreen = document.getElementById("term-output");
                const limuxCommandLine = document.getElementById("term-input");

                if (terminalScreen) {
                    terminalScreen.innerHTML = `
                        <div>Limux OS v1.0.0 (tty1)</div>
                        <div>Kindly type 'help' to check available commands.</div>
                        <br>
                    `;
                }
                if (limuxCommandLine) limuxCommandLine.value = "";
            }
        }
    }, 250);
}

function minimizeAppWindow(targetAppId) {
    const appWin = document.getElementById(targetAppId);
    if (appWin) appWin.style.display = 'none';
}

function expandAppToFull(targetAppId) {
    const appWin = document.getElementById(targetAppId);
    if (!appWin) return;

    if (appWin.classList.contains('maximized')) {
        appWin.classList.remove('maximized');
        appWin.style.width = appWin.dataset.oldWidth;
        appWin.style.height = appWin.dataset.oldHeight;
        appWin.style.top = appWin.dataset.oldTop;
        appWin.style.left = appWin.dataset.oldLeft;
    } else {
        appWin.dataset.oldWidth = appWin.style.width || getComputedStyle(appWin).width;
        appWin.dataset.oldHeight = appWin.style.height || getComputedStyle(appWin).height;
        appWin.dataset.oldTop = appWin.style.top || getComputedStyle(appWin).top;
        appWin.dataset.oldLeft = appWin.style.left || getComputedStyle(appWin).left;

        appWin.classList.add('maximized');
        appWin.style.width = '100vw';
        appWin.style.height = 'calc(100vh - 80px)';
        appWin.style.top = '0';
        appWin.style.left = '0';
        focusWindow(appWin);
    }
}

// Logic to allow dragging windows across the desktop
function enableDragSetup(winElem) {
    let pointerX = 0;
    let pointerY = 0;

    const topHeader = winElem.querySelector(".window-header");
    if (!topHeader) return;

    topHeader.onmousedown = beginDrag;

    function beginDrag(e) {
        e.preventDefault();
        focusWindow(winElem);

        pointerX = e.clientX;
        pointerY = e.clientY;

        document.onmousemove = performDrag;
        document.onmouseup = stopDragEvent;
    }

    function performDrag(e) {
        e.preventDefault();
        let moveX = e.clientX - pointerX;
        let moveY = e.clientY - pointerY;

        pointerX = e.clientX;
        pointerY = e.clientY;

        let calculateTop = winElem.offsetTop + moveY;
        let calculateLeft = winElem.offsetLeft + moveX;

        const screenCeiling = 0;
        if (calculateTop < screenCeiling) {
            calculateTop = screenCeiling;
        }

        winElem.style.left = calculateLeft + "px";
        winElem.style.top = calculateTop + "px";
    }

    function stopDragEvent() {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}

// Applying drag functionality to all windows automatically on boot
document.querySelectorAll(".window").forEach(winElem => {
    enableDragSetup(winElem);
    winElem.addEventListener("mousedown", () => focusWindow(winElem));
});

// Calendar Widget Logic
let currentCalMonth = new Date();

function updateCalendarUI() {
    const activeYear = currentCalMonth.getFullYear();
    const activeMonth = currentCalMonth.getMonth();
    const realDateCheck = new Date();
    const monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const titleHeader = document.getElementById("cal-month-year");
    if (titleHeader) titleHeader.innerText = `${monthLabels[activeMonth]} ${activeYear}`;

    const startingDay = new Date(activeYear, activeMonth, 1).getDay();
    const totalDays = new Date(activeYear, activeMonth + 1, 0).getDate();

    const daysGrid = document.getElementById("cal-days");
    if (!daysGrid) return;
    daysGrid.innerHTML = "";

    for (let i = 0; i < startingDay; i++) {
        const emptyBlock = document.createElement("div");
        emptyBlock.className = "cal-day empty";
        daysGrid.appendChild(emptyBlock);
    }

    for (let i = 1; i <= totalDays; i++) {
        const dateBlock = document.createElement("div");
        dateBlock.className = "cal-day";
        dateBlock.innerText = i;

        if (i === realDateCheck.getDate() && activeMonth === realDateCheck.getMonth() && activeYear === realDateCheck.getFullYear()) {
            dateBlock.classList.add("current");
        }
        daysGrid.appendChild(dateBlock);
    }
}

const backMonthBtn = document.getElementById("prev-month");
const fwdMonthBtn = document.getElementById("next-month");
if (backMonthBtn) backMonthBtn.addEventListener("click", () => { currentCalMonth.setMonth(currentCalMonth.getMonth() - 1); updateCalendarUI(); });
if (fwdMonthBtn) fwdMonthBtn.addEventListener("click", () => { currentCalMonth.setMonth(currentCalMonth.getMonth() + 1); updateCalendarUI(); });
updateCalendarUI();

// Core Terminal Application logic
const limuxCommandLine = document.getElementById("term-input");
const terminalScreen = document.getElementById("term-output");
const terminalWrapper = document.getElementById("term-container");

if (terminalWrapper) {
    terminalWrapper.addEventListener("click", () => {
        if (limuxCommandLine) limuxCommandLine.focus();
    });
}

if (limuxCommandLine) {
    limuxCommandLine.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const userText = limuxCommandLine.value.trim();

            // Displaying the user's typed command in cyan
            appendTerminalText(`<span style="color: #87af5f; font-weight: bold;">jaswanth@limux:~$</span> <span style="color: #34e2e2;">${userText}</span>`);

            executeTerminalAction(userText);
            limuxCommandLine.value = "";

            // Forcing the scrollbar to the bottom ensuring the input box stays visible
            setTimeout(() => {
                if (terminalWrapper) {
                    terminalWrapper.scrollTop = terminalWrapper.scrollHeight + 100;
                }
            }, 50);
        }
    });
}
function appendTerminalText(htmlContent) {
    const row = document.createElement("div");
    row.innerHTML = htmlContent;
    row.style.marginBottom = "4px";
    if (terminalScreen) terminalScreen.appendChild(row);
}

function executeTerminalAction(cmdText) {
    if (cmdText === "") return;

    const userArgs = cmdText.split(" ");
    const rootCommand = userArgs[0].toLowerCase();

    switch (rootCommand) {
        case "help": {
            appendTerminalText("<div style='margin-bottom: 8px; font-weight: bold; color: #eeeeec;'>List of available commands:</div>");
            const commandDirectory = [
                { cmd: "help", desc: "Displays the list of all valid commands" },
                { cmd: "whoami", desc: "Prints the logged-in system user" },
                { cmd: "date", desc: "Checks the current machine date and time" },
                { cmd: "echo", desc: "Outputs your typed text to the screen" },
                { cmd: "clear", desc: "Wipes the terminal history clean" },
                { cmd: "sysinfo", desc: "Shows basic OS architecture details" },
                { cmd: "calc", desc: "Evaluates standard math formulas" },
                { cmd: "fetch", desc: "Renders the Limux ascii logo and stats" },
                { cmd: "hack", desc: "Executes the mainframe bypass script" },
                { cmd: "matrix", desc: "Triggers the digital rain sequence" },
                { cmd: "apt-get", desc: "Package manager tool for developers" }
            ];
            commandDirectory.forEach(item => {
                appendTerminalText(`
                    <div style="display: flex; gap: 15px;">
                        <span style="color: #34e2e2; width: 80px;">${item.cmd}</span>
                        <span style="color: #eeeeec;">- ${item.desc}</span>
                    </div>
                `);
            });
            break;
        }

        case "whoami": appendTerminalText("jaswanth - Primary Developer & System Admin"); break;
        case "date": appendTerminalText(new Date().toString()); break;
        case "echo": appendTerminalText(userArgs.slice(1).join(" ")); break;
        case "clear": if (terminalScreen) terminalScreen.innerHTML = ""; break;
        case "sysinfo": appendTerminalText(`OS: Limux build v1.0<br>Kernel: Web-DOM Integration<br>UI: Custom Frosted Glass<br>System Status: <span style="color:#8ae234">Running Smoothly</span>`); break;

        case "calc": {
            try {
                const equationStr = userArgs.slice(1).join(" ");
                const finalMathResult = eval(equationStr);
                appendTerminalText(`<span style="color:#8ae234">${finalMathResult}</span>`);
            } catch {
                appendTerminalText(`<span style="color:#ef2929">Math error. Kindly try something like: calc 5 + 5</span>`);
            }
            break;
        }

        case "hack":
            if (limuxCommandLine) limuxCommandLine.disabled = true;
            appendTerminalText(`<span style="color:#ef2929">Initiating security bypass protocols...</span>`);
            setTimeout(() => { appendTerminalText(`<span style="color:#34e2e2">Decrypting local file systems... [||||||||||] 100%</span>`); }, 1000);
            setTimeout(() => {
                appendTerminalText(`<span style="color:#8ae234">Mainframe Access Granted. You are in.</span>`);
                if (limuxCommandLine) { limuxCommandLine.disabled = false; limuxCommandLine.focus(); }
            }, 2500);
            break;

        case "fetch": {
            const limuxLogoAscii = `
<span style="color:#34e2e2">  _      _____ __  __ _    _ __  __</span>  <span style="color:#87af5f; font-weight:bold;">jaswanth@limux</span>
<span style="color:#34e2e2"> | |    |_   _|  \\/  | |  | |\\ \\/ /</span>  -------------------
<span style="color:#34e2e2"> | |      | | | \\  / | |  | | \\  / </span>  <span style="color:#8ae234">OS</span>: Limux Web Kernel 1.0
<span style="color:#34e2e2"> | |____ _| |_| |\\/| | |__| | /  \\ </span>  <span style="color:#8ae234">UI</span>: Transparent Glass
<span style="color:#34e2e2"> |______|_____|_|  |_|\\____/ /_/\\_\\</span>  <span style="color:#8ae234">Packages</span>: 4 (Cam, Calc, Term, Notes)
<span style="color:#34e2e2">                                   </span>  <span style="color:#8ae234">Shell</span>: Limux Bash`;
            appendTerminalText(`<pre style="line-height: 1.2; margin: 10px 0;">${limuxLogoAscii}</pre>`);
            break;
        }

        case "apt-get": {
            if (userArgs[1] === "moo") {
                const cowAsciiArt = `
         (__) 
         (oo) 
   /------\\/ 
  / |    ||   
 * /\\---/\\ 
    ~~   ~~   
...."Have you mooed today?"...`;
                appendTerminalText(`<pre style="line-height: 1.2; margin: 0; color: #eeeeec;">${cowAsciiArt}</pre>`);
            } else {
                appendTerminalText(`<span style="color:#ef2929">Terminal Error: Invalid operation ${userArgs[1] || ""}</span>`);
            }
            break;
        }

        case "sudo":
            if (userArgs[1] === "rm" && userArgs[2] === "-rf" && userArgs[3] === "/") {
                appendTerminalText(`<span style="color:#ef2929">DANGER: Removing root file system...</span>`);
                setTimeout(() => appendTerminalText(`<span style="color:#ef2929">Just joking! This is running in a browser.</span>`), 1500);
            } else {
                appendTerminalText(`jaswanth is not in the sudoers file. <span style="color:#ef2929">This incident will be reported.</span>`);
            }
            break;

        case "matrix":
            if (document.getElementById("digital-rain-canvas")) {
                appendTerminalText(`<span style="color:#ef2929">The Matrix is already running in the background. Press ESC to stop it.</span>`);
                break;
            }
            appendTerminalText(`<span style="color:#8ae234">Entering the Matrix... Kindly press ESC to disconnect.</span>`);
            setTimeout(initializeMatrixRain, 800);
            break;

        default:
            appendTerminalText(`<span style="color:#ef2929">bash: ${rootCommand}: command not recognized in Limux</span>`);
            break;
    }
}

function initializeMatrixRain() {
    if (document.getElementById("digital-rain-canvas")) return;

    const rainCanvas = document.createElement("canvas");
    rainCanvas.id = "digital-rain-canvas";
    rainCanvas.style.position = "fixed";
    rainCanvas.style.top = "0";
    rainCanvas.style.left = "0";
    rainCanvas.style.width = "100vw";
    rainCanvas.style.height = "100vh";
    rainCanvas.style.zIndex = "999999";
    rainCanvas.style.pointerEvents = "none";
    document.body.appendChild(rainCanvas);

    const canvasCtx = rainCanvas.getContext("2d");
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;

    const rainChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
    const charSize = 16;
    const screenCols = rainCanvas.width / charSize;
    const rainDrops = Array(Math.floor(screenCols)).fill(1);

    const renderLoop = setInterval(() => {
        canvasCtx.fillStyle = "rgba(0, 0, 0, 0.05)";
        canvasCtx.fillRect(0, 0, rainCanvas.width, rainCanvas.height);
        canvasCtx.fillStyle = "#0F0";
        canvasCtx.font = charSize + "px monospace";

        for (let i = 0; i < rainDrops.length; i++) {
            const letter = rainChars.charAt(Math.floor(Math.random() * rainChars.length));
            canvasCtx.fillText(letter, i * charSize, rainDrops[i] * charSize);
            if (rainDrops[i] * charSize > rainCanvas.height && Math.random() > 0.975) rainDrops[i] = 0;
            rainDrops[i]++;
        }
    }, 33);

    const checkEscKey = (ev) => {
        if (ev.key === "Escape") {
            clearInterval(renderLoop);
            rainCanvas.remove();
            document.removeEventListener("keydown", checkEscKey);

            if (terminalScreen && terminalWrapper) {
                const shutdownMsg = document.createElement("div");
                shutdownMsg.innerHTML = `<span style="color:#34e2e2">Successfully disconnected from the Matrix.</span>`;
                shutdownMsg.style.marginBottom = "4px";
                terminalScreen.appendChild(shutdownMsg);
                terminalWrapper.scrollTop = terminalWrapper.scrollHeight;
            }
        }
    };
    document.addEventListener("keydown", checkEscKey);
}

// Custom Calculator Module
let currentMathValue = '0';
const screenDisplay = document.getElementById('calc-display');

function calcInput(digitVal) {
    if (!screenDisplay) return;

    if (digitVal === 'C') {
        currentMathValue = '0';
    } else if (digitVal === '=') {
        try {
            let processedResult = String(new Function('return ' + currentMathValue)());
            if (processedResult.includes('.') && processedResult.length > 10) {
                processedResult = parseFloat(processedResult).toFixed(6).replace(/\.?0+$/, '');
            }
            currentMathValue = processedResult;
        } catch (err) {
            currentMathValue = 'Error';
        }
    } else {
        if (currentMathValue === '0' || currentMathValue === 'Error') {
            if (['+', '-', '*', '/'].includes(digitVal)) currentMathValue += digitVal;
            else currentMathValue = digitVal;
        } else {
            currentMathValue += digitVal;
        }
    }

    if (currentMathValue.length > 12) screenDisplay.style.fontSize = '18px';
    else screenDisplay.style.fontSize = '28px';

    let prettyDisplay = currentMathValue.replace(/\*/g, '×').replace(/\//g, '÷');
    screenDisplay.innerText = prettyDisplay;
}

// Built-in Music Player Logic
let audioIsRunning = false;
let activeSongIndex = 0;
const nativeAudioPlayer = new Audio();
const localSongPlaylist = [
    { title: "Track 1 Name", artist: "Artist 1", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop", src: "./songs/song1.mp3", duration: "03:00" }
];

function loadTrack(targetIdx) {
    const currentTrack = localSongPlaylist[targetIdx];
    if (!currentTrack) return;
    const labelTitle = document.getElementById("music-title");
    const labelArtist = document.getElementById("music-artist");
    const labelTotalTime = document.getElementById("time-total");
    const albumArtwork = document.getElementById("music-cover");

    if (labelTotalTime) labelTotalTime.innerText = currentTrack.duration;
    if (labelTitle) labelTitle.innerText = "Loading...";
    if (labelArtist) labelArtist.innerText = "...";

    nativeAudioPlayer.src = currentTrack.src;
    nativeAudioPlayer.load();

    if (window.jsmediatags) {
        fetch(currentTrack.src)
            .then(res => res.blob())
            .then(audioBlob => {
                window.jsmediatags.read(audioBlob, {
                    onSuccess: function (metadata) {
                        if (metadata.tags.title && labelTitle) labelTitle.innerText = metadata.tags.title;
                        else if (labelTitle) labelTitle.innerText = currentTrack.src.split('/').pop().split('.')[0];

                        if (metadata.tags.artist && labelArtist) labelArtist.innerText = metadata.tags.artist;
                        else if (labelArtist) labelArtist.innerText = "Unknown Artist";

                        const coverPic = metadata.tags.picture;
                        if (coverPic && albumArtwork) {
                            let encodedString = "";
                            for (let idx = 0; idx < coverPic.data.length; idx++) encodedString += String.fromCharCode(coverPic.data[idx]);
                            albumArtwork.src = `data:${coverPic.format};base64,${window.btoa(encodedString)}`;
                        } else if (albumArtwork) albumArtwork.src = currentTrack.cover;
                    },
                    onError: function () {
                        if (labelTitle) labelTitle.innerText = currentTrack.title;
                        if (labelArtist) labelArtist.innerText = currentTrack.artist;
                        if (albumArtwork) albumArtwork.src = currentTrack.cover;
                    }
                });
            }).catch(() => {
                if (labelTitle) labelTitle.innerText = currentTrack.title;
                if (albumArtwork) albumArtwork.src = currentTrack.cover;
            });
    }

    const progressTrack = document.getElementById("music-slider");
    const labelCurrentTime = document.getElementById("time-current");
    if (progressTrack) { progressTrack.value = 0; progressTrack.style.background = `rgba(255, 255, 255, 0.15)`; }
    if (labelCurrentTime) labelCurrentTime.innerText = "00:00";
}

function triggerSafePlay() {
    let checkPromise = nativeAudioPlayer.play();
    if (checkPromise !== undefined) {
        checkPromise.then(_ => {
            audioIsRunning = true;
            const playSvg = document.getElementById('play-icon');
            if (playSvg) playSvg.innerHTML = '<path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        }).catch(err => {
            audioIsRunning = false;
            const playSvg = document.getElementById('play-icon');
            if (playSvg) playSvg.innerHTML = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
        });
    }
}

function togglePlay() {
    if (nativeAudioPlayer.paused) triggerSafePlay();
    else {
        nativeAudioPlayer.pause();
        audioIsRunning = false;
        const playSvg = document.getElementById('play-icon');
        if (playSvg) playSvg.innerHTML = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
    }
}

function nextTrack() {
    activeSongIndex++;
    if (activeSongIndex >= localSongPlaylist.length) activeSongIndex = 0;
    loadTrack(activeSongIndex);
    if (audioIsRunning) setTimeout(() => { triggerSafePlay(); }, 50);
}

function prevTrack() {
    activeSongIndex--;
    if (activeSongIndex < 0) activeSongIndex = localSongPlaylist.length - 1;
    loadTrack(activeSongIndex);
    if (audioIsRunning) setTimeout(() => { triggerSafePlay(); }, 50);
}

function toggleMusicWidget() {
    const mainWidget = document.getElementById('top-music-widget');
    if (mainWidget) mainWidget.classList.toggle('closed');
}

nativeAudioPlayer.addEventListener('timeupdate', () => {
    if (!isNaN(nativeAudioPlayer.duration)) {
        const percentageDone = (nativeAudioPlayer.currentTime / nativeAudioPlayer.duration) * 100;
        const progressTrack = document.getElementById('music-slider');
        const labelCurrentTime = document.getElementById("time-current");

        if (progressTrack) {
            progressTrack.value = percentageDone;
            progressTrack.style.background = `linear-gradient(to right, #d1bfe3 ${percentageDone}%, rgba(255, 255, 255, 0.15) ${percentageDone}%)`;
        }

        let runMins = Math.floor(nativeAudioPlayer.currentTime / 60);
        let runSecs = Math.floor(nativeAudioPlayer.currentTime % 60);
        if (labelCurrentTime) labelCurrentTime.innerText = `0${runMins}:${runSecs < 10 ? '0' + runSecs : runSecs}`;
    }
});

nativeAudioPlayer.addEventListener('ended', () => nextTrack());

const visualSlider = document.getElementById('music-slider');
if (visualSlider) {
    visualSlider.addEventListener('input', function (ev) {
        if (!isNaN(nativeAudioPlayer.duration)) nativeAudioPlayer.currentTime = (ev.target.value / 100) * nativeAudioPlayer.duration;
    });
}
if (localSongPlaylist.length > 0) loadTrack(activeSongIndex);

// Notes Application Logic (Local Storage saving)
let userSavedNotes = JSON.parse(localStorage.getItem('limux_system_notes')) || [];
let currentlyOpenNote = null;

const sidebarNotesList = document.getElementById('notes-list');
const inputNoteTitle = document.getElementById('note-title-input');
const inputNoteBody = document.getElementById('note-body-input');
const btnCreateNew = document.getElementById('new-note-btn');
const btnSaveNote = document.getElementById('save-note-btn');
const btnDeleteNote = document.getElementById('delete-note-btn');

function trashCurrentNote() {
    if (!currentlyOpenNote) return;
    userSavedNotes = userSavedNotes.filter(n => n.id !== currentlyOpenNote);
    pushNotesToDrive();
    if (userSavedNotes.length > 0) populateNoteEditor(userSavedNotes[0].id);
    else generateBlankNote();
}
if (btnDeleteNote) btnDeleteNote.addEventListener('click', trashCurrentNote);

function forceSaveAndReset() {
    recordTypingData();
    const prevText = btnSaveNote.innerText;
    btnSaveNote.innerText = "Saved!";
    btnSaveNote.style.background = "rgba(39, 201, 63, 0.2)";
    btnSaveNote.style.color = "#46da5c";
    btnSaveNote.style.borderColor = "rgba(39, 201, 63, 0.4)";
    setTimeout(() => {
        btnSaveNote.innerText = prevText;
        btnSaveNote.style.background = "";
        btnSaveNote.style.color = "";
        btnSaveNote.style.borderColor = "";
        generateBlankNote();
    }, 600);
}
if (btnSaveNote) btnSaveNote.addEventListener('click', forceSaveAndReset);

function pushNotesToDrive() {
    localStorage.setItem('limux_system_notes', JSON.stringify(userSavedNotes));
    paintSidebarList();
}

function paintSidebarList() {
    if (!sidebarNotesList) return;
    sidebarNotesList.innerHTML = '';
    userSavedNotes.forEach(n => {
        const wrapDiv = document.createElement('div');
        wrapDiv.className = `note-item ${n.id === currentlyOpenNote ? 'active' : ''}`;
        wrapDiv.onclick = () => populateNoteEditor(n.id);
        wrapDiv.innerHTML = `<h4>${n.title || 'Untitled Note'}</h4><p>${n.body || ''}</p>`;
        sidebarNotesList.appendChild(wrapDiv);
    });
}

function generateBlankNote() {
    const blankSlate = { id: Date.now().toString(), title: '', body: '', timestamp: Date.now() };
    userSavedNotes.unshift(blankSlate);
    currentlyOpenNote = blankSlate.id;
    if (inputNoteTitle) inputNoteTitle.value = '';
    if (inputNoteBody) inputNoteBody.value = '';
    if (inputNoteTitle) inputNoteTitle.focus();
    pushNotesToDrive();
}

function populateNoteEditor(targetId) {
    currentlyOpenNote = targetId;
    const matchingNote = userSavedNotes.find(n => n.id === targetId);
    if (matchingNote) {
        if (inputNoteTitle) inputNoteTitle.value = matchingNote.title;
        if (inputNoteBody) inputNoteBody.value = matchingNote.body;
    }
    paintSidebarList();
}

function recordTypingData() {
    if (!currentlyOpenNote) return;
    const matchingNote = userSavedNotes.find(n => n.id === currentlyOpenNote);
    if (matchingNote) {
        matchingNote.title = inputNoteTitle ? inputNoteTitle.value : '';
        matchingNote.body = inputNoteBody ? inputNoteBody.value : '';
        matchingNote.timestamp = Date.now();
        pushNotesToDrive();
    }
}

if (inputNoteTitle) inputNoteTitle.addEventListener('input', recordTypingData);
if (inputNoteBody) inputNoteBody.addEventListener('input', recordTypingData);
if (btnCreateNew) btnCreateNew.addEventListener('click', generateBlankNote);

if (userSavedNotes.length > 0) populateNoteEditor(userSavedNotes[0].id);
else generateBlankNote();

// Webcam Hardware Integration
let liveCameraFeed = null;

async function initializeWebcam() {
    const camVideoOutput = document.getElementById('camera-feed');
    if (!camVideoOutput) return;
    try {
        liveCameraFeed = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
        camVideoOutput.srcObject = liveCameraFeed;
        camVideoOutput.play();
    } catch (error) {
        console.error("Webcam hardware blocked or not found:", error);
        alert("Kindly grant permissions to access your webcam.");
    }
}

async function handleCameraToggle() {
    const camWin = document.getElementById('camera-app');
    launchOrHideApp('camera-app');
    if (!camWin) return;
    setTimeout(async () => {
        if (camWin.style.display !== 'none') await initializeWebcam();
        else if (liveCameraFeed) {
            liveCameraFeed.getTracks().forEach(track => track.stop());
            liveCameraFeed = null;
        }
    }, 50);
}

function closeCameraApp() {
    shutDownApp('camera-app');
    if (liveCameraFeed) {
        liveCameraFeed.getTracks().forEach(track => track.stop());
        liveCameraFeed = null;
    }
}

function takePhoto() {
    const camVideoOutput = document.getElementById('camera-feed');
    const photoCanvas = document.getElementById('camera-canvas');
    const shutterFlash = document.getElementById('camera-flash');
    if (!liveCameraFeed || !camVideoOutput || !photoCanvas || !shutterFlash) return;

    shutterFlash.classList.add('flash');
    setTimeout(() => shutterFlash.classList.remove('flash'), 50);

    photoCanvas.width = camVideoOutput.videoWidth;
    photoCanvas.height = camVideoOutput.videoHeight;
    const captureCtx = photoCanvas.getContext('2d');
    captureCtx.translate(photoCanvas.width, 0);
    captureCtx.scale(-1, 1);
    captureCtx.drawImage(camVideoOutput, 0, 0, photoCanvas.width, photoCanvas.height);

    const generatedImgUrl = photoCanvas.toDataURL('image/png');
    const saveTrigger = document.createElement('a');
    saveTrigger.href = generatedImgUrl;
    saveTrigger.download = `Limux_Capture_${Date.now()}.png`;
    document.body.appendChild(saveTrigger);
    saveTrigger.click();
    document.body.removeChild(saveTrigger);
}