// =========================
// CLOCK SYSTEM (From Part 2)
// =========================
function updateTime() {
    // If you don't have the top-bar anymore, you can remove this or keep it running silently
    var timeElement = document.querySelector("#timeElement");
    if (timeElement) {
        var options = { hour: '2-digit', minute: '2-digit' };
        timeElement.innerHTML = new Date().toLocaleString('en-US', options).replace(/,/g, '');
    }
}
setInterval(updateTime, 1000);
updateTime();

// =========================
// Z-INDEX SYSTEM (Part 4)
// =========================
let highestZIndex = 1;

function bringToFront(windowElement) {
    highestZIndex++;
    windowElement.style.zIndex = highestZIndex;
}

// =========================
// OPEN / CLOSE APP (ANIMATED)
// =========================
function toggleApp(id) {
    const app = document.getElementById(id);
    if (!app) return;

    // If it's already open, run the close sequence
    if (app.classList.contains("is-open")) {
        closeApp(id);
    } else {
        // 1. Make it physically exist on screen (but invisible because opacity is 0)
        app.style.display = "flex";
        bringToFront(app);

        // 2. Wait 10 milliseconds, then trigger the spring pop-up animation
        setTimeout(() => {
            app.classList.add("is-open");
        }, 10);
    }
}

function closeApp(id) {
    const app = document.getElementById(id);
    if (!app) return;

    // 1. Remove the open class to trigger the shrink/fade-out animation
    app.classList.remove("is-open");

    // 2. Wait exactly 250ms for the CSS animation to finish before removing it from the layout
    setTimeout(() => {
        // Failsafe: only hide it if the user didn't instantly try to reopen it
        if (!app.classList.contains("is-open")) {
            app.style.display = "none";
        }
    }, 250);
}
// =========================
// DRAGGABLE WINDOWS (With Boundary Math)
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

        // BOUNDARY COLLISION MATH: Prevent window from going above the screen
        const topBoundary = 0; // Set to 40 if you add a top-bar back
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

// =========================
// AUTO SETUP ALL WINDOWS
// =========================
document.querySelectorAll(".window").forEach(windowElement => {
    makeDraggable(windowElement);

    // Bring window to front when clicked anywhere inside it
    windowElement.addEventListener("mousedown", () => bringToFront(windowElement));
});

// =========================
// CALENDAR WIDGET ENGINE
// =========================
// =========================
// CALENDAR WIDGET ENGINE
// =========================
let navDate = new Date(); // Tracks the month you are currently looking at

function renderCalendar() {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();

    // We keep a separate variable for "today" so the pink highlight stays accurate
    const realToday = new Date();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthHeader = document.getElementById("cal-month-year");
    if (monthHeader) {
        monthHeader.innerText = `${monthNames[month]} ${year}`;
    }

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysContainer = document.getElementById("cal-days");
    if (!daysContainer) return;

    daysContainer.innerHTML = "";

    // Empty slots
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "cal-day empty";
        daysContainer.appendChild(emptyDiv);
    }

    // Numbered days
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "cal-day";
        dayDiv.innerText = i;

        // Only highlight if it's the real current day, month, AND year
        if (i === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear()) {
            dayDiv.classList.add("current");
        }

        daysContainer.appendChild(dayDiv);
    }
}

// Attach click events to the navigation arrows
document.getElementById("prev-month").addEventListener("click", () => {
    navDate.setMonth(navDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
    navDate.setMonth(navDate.getMonth() + 1);
    renderCalendar();
});

// Run once on load
renderCalendar();

// =========================
// TERMINAL APP ENGINE
// =========================

const termInput = document.getElementById("term-input");
const termOutput = document.getElementById("term-output");
const termContainer = document.getElementById("term-container");

// If the user clicks anywhere in the terminal, refocus the typing cursor
if (termContainer) {
    termContainer.addEventListener("click", () => {
        termInput.focus();
    });
}

if (termInput) {
    termInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            const command = termInput.value.trim();

            // 1. Print the command the user just typed
            printLine(`<span style="color: #87af5f; font-weight: bold;">jaswanth@limux:~$</span> ${command}`);

            // 2. Process the command
            processCommand(command);

            // 3. Clear the input box and scroll to the bottom
            termInput.value = "";
            termContainer.scrollTop = termContainer.scrollHeight;
        }
    });
}

// Function to print a new line to the terminal
function printLine(html) {
    const newLine = document.createElement("div");
    newLine.innerHTML = html;
    newLine.style.marginBottom = "4px";
    termOutput.appendChild(newLine);
}

// Function that handles the actual logic of the commands
function processCommand(cmd) {
    if (cmd === "") return; // Do nothing if they just press enter

    const args = cmd.split(" ");
    const baseCmd = args[0].toLowerCase();

    switch (baseCmd) {
        case "help":
            printLine("Available commands:");
            printLine("  <span style='color:#58a6ff'>help</span>    - Show this message");
            printLine("  <span style='color:#58a6ff'>whoami</span>  - Display current user");
            printLine("  <span style='color:#58a6ff'>date</span>    - Show current system date/time");
            printLine("  <span style='color:#58a6ff'>echo</span>    - Print text to the terminal");
            printLine("  <span style='color:#58a6ff'>clear</span>   - Clear the terminal output");
            break;

        case "whoami":
            printLine("jaswanth - System Admin & Developer");
            break;

        case "date":
            printLine(new Date().toString());
            break;

        case "echo":
            // Print everything after the word "echo"
            const textToEcho = args.slice(1).join(" ");
            printLine(textToEcho);
            break;

        case "clear":
            termOutput.innerHTML = "";
            break;

        case "sudo":
            printLine("nice try. this incident will be reported.");
            break;

        default:
            printLine(`bash: ${baseCmd}: command not found`);
            break;
    }
}

// =========================
// CALCULATOR APP ENGINE
// =========================

let calcCurrentVal = '0';
const calcDisplay = document.getElementById('calc-display');

function calcInput(val) {
    if (!calcDisplay) return;

    // Handle Clear
    if (val === 'C') {
        calcCurrentVal = '0';
    }
    // Handle Equals (Evaluate Math)
    else if (val === '=') {
        try {
            // new Function is a safer, cleaner alternative to eval()
            let result = String(new Function('return ' + calcCurrentVal)());

            // Clean up long decimals (e.g., 0.1 + 0.2 math bugs)
            if (result.includes('.') && result.length > 10) {
                result = parseFloat(result).toFixed(6).replace(/\.?0+$/, '');
            }
            calcCurrentVal = result;
        } catch (e) {
            calcCurrentVal = 'Error';
        }
    }
    // Handle typing numbers and operators
    else {
        // If display is just 0 or Error, replace it (unless it's an operator like + or -)
        if (calcCurrentVal === '0' || calcCurrentVal === 'Error') {
            if (['+', '-', '*', '/'].includes(val)) {
                calcCurrentVal += val;
            } else {
                calcCurrentVal = val;
            }
        } else {
            calcCurrentVal += val;
        }
    }

    // Shrink text dynamically if the equation gets too long
    if (calcCurrentVal.length > 12) {
        calcDisplay.style.fontSize = '18px';
    } else {
        calcDisplay.style.fontSize = '28px';
    }

    // Replace the raw coding operators (* and /) with pretty math symbols for the screen
    let displayString = calcCurrentVal.replace(/\*/g, '×').replace(/\//g, '÷');
    calcDisplay.innerText = displayString;
}

// =========================
// TOP BAR CLOCK & DATE ENGINE
// =========================
function updateTopBar() {
    const now = new Date();

    // 1. Update the Centered Time (e.g., "10:30 AM")
    const timeElement = document.getElementById("timeElement");
    if (timeElement) {
        timeElement.innerText = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    // 2. Update the Right-Side Hover Button (e.g., "Tue, Jun 16")
    const dateTrigger = document.getElementById("date-trigger");
    if (dateTrigger) {
        dateTrigger.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
}

// Run immediately and update every 1 second
updateTopBar();
setInterval(updateTopBar, 1000);

// =========================
// REAL HTML5 AUDIO ENGINE (Local Only)
// =========================

let isMusicPlaying = false;
let currentTrackIndex = 0;

// Initialize the native Audio object
const currentAudio = new Audio();

// Your 9-Track Local Playlist
const playlist = [
    {
        title: "Track 1 Name",
        artist: "Artist 1",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop",
        src: "./songs/song1.mp3",
        duration: "03:00"
    },
    {
        title: "Track 2 Name",
        artist: "Artist 2",
        cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=500&auto=format&fit=crop",
        src: "./songs/song2.mp3",
        duration: "03:00"
    },
    {
        title: "Track 3 Name",
        artist: "Artist 3",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop",
        src: "./songs/song3.mp3",
        duration: "03:00"
    },
    {
        title: "Track 4 Name",
        artist: "Artist 4",
        cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=500&auto=format&fit=crop",
        src: "./songs/song4.mp3",
        duration: "03:00"
    },
    {
        title: "Track 5 Name",
        artist: "Artist 5",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop",
        src: "./songs/song5.mp3",
        duration: "03:00"
    },
    {
        title: "Track 6 Name",
        artist: "Artist 6",
        cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=500&auto=format&fit=crop",
        src: "./songs/song6.mp3",
        duration: "03:00"
    },
    {
        title: "Track 7 Name",
        artist: "Artist 7",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop",
        src: "./songs/song7.mp3",
        duration: "03:00"
    },
    {
        title: "Track 8 Name",
        artist: "Artist 8",
        cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=500&auto=format&fit=crop",
        src: "./songs/song8.mp3",
        duration: "03:00"
    },
    {
        title: "Track 9 Name",
        artist: "Artist 9",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop",
        src: "./songs/song9.mp3",
        duration: "03:00"
    }
];

function loadTrack(index) {
    const track = playlist[index];

    // Inject Text Data
    const titleEl = document.getElementById("music-title");
    const artistEl = document.getElementById("music-artist");
    const totalTimeEl = document.getElementById("time-total");

    if (titleEl) titleEl.innerText = track.title;
    if (artistEl) artistEl.innerText = track.artist;
    if (totalTimeEl) totalTimeEl.innerText = track.duration;

    // Load the actual audio file
    currentAudio.src = track.src;
    currentAudio.load();

    // THE FIX: Instantly update the cover art to the array image so it never freezes
    const coverEl = document.getElementById("music-cover");
    if (coverEl) coverEl.src = track.cover;

    // Try to find an embedded MP3 cover in the background without lagging the app
    if (window.jsmediatags) {
        window.jsmediatags.read(track.src, {
            onSuccess: function (tag) {
                const picture = tag.tags.picture;
                if (picture) {
                    let base64String = "";
                    for (let i = 0; i < picture.data.length; i++) {
                        base64String += String.fromCharCode(picture.data[i]);
                    }
                    const imageUrl = `data:${picture.format};base64,${window.btoa(base64String)}`;
                    if (coverEl) coverEl.src = imageUrl; // Overwrite if a real cover is found
                }
            },
            onError: function (error) {
                console.log('Using default cover art.');
            }
        });
    }

    // Reset Progress UI
    const slider = document.getElementById("music-slider");
    const waveFill = document.getElementById("wave-fill");
    const currentTimeEl = document.getElementById("time-current");

    if (slider) slider.value = 0;
    if (waveFill) waveFill.style.width = "0%";
    if (currentTimeEl) currentTimeEl.innerText = "00:00";
}

// THE FIX: Bulletproof function to handle audio promises
function playSafe() {
    let playPromise = currentAudio.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
            isMusicPlaying = true;
            const playIcon = document.getElementById('play-icon');
            // THE FIX: Solid, visible Pause SVG
            if (playIcon) playIcon.innerHTML = '<path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        }).catch(error => {
            console.log("Playback interrupted or file missing:", error);
            isMusicPlaying = false;
            const playIcon = document.getElementById('play-icon');
            if (playIcon) playIcon.innerHTML = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
        });
    }
}

function togglePlay() {
    if (currentAudio.paused) {
        playSafe();
    } else {
        currentAudio.pause();
        isMusicPlaying = false;
        const playIcon = document.getElementById('play-icon');
        // Revert to Play SVG
        if (playIcon) playIcon.innerHTML = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
    }
}

function nextTrack() {
    currentTrackIndex++;
    if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;
    loadTrack(currentTrackIndex);

    if (isMusicPlaying) {
        setTimeout(() => { playSafe(); }, 50); // Small delay lets the browser fetch the new file
    }
}

function prevTrack() {
    currentTrackIndex--;
    if (currentTrackIndex < 0) currentTrackIndex = playlist.length - 1;
    loadTrack(currentTrackIndex);

    if (isMusicPlaying) {
        setTimeout(() => { playSafe(); }, 50);
    }
}

// Automatically update the slider as the real song plays
currentAudio.addEventListener('timeupdate', () => {
    if (!isNaN(currentAudio.duration)) {
        const progressPercent = (currentAudio.currentTime / currentAudio.duration) * 100;

        const slider = document.getElementById('music-slider');
        const waveFill = document.getElementById("wave-fill");
        const currentTimeEl = document.getElementById("time-current");

        if (slider) slider.value = progressPercent;
        if (waveFill) waveFill.style.width = progressPercent + '%';

        // Format real timestamps (e.g., 01:24)
        let currentMins = Math.floor(currentAudio.currentTime / 60);
        let currentSecs = Math.floor(currentAudio.currentTime % 60);
        if (currentTimeEl) {
            currentTimeEl.innerText = `0${currentMins}:${currentSecs < 10 ? '0' + currentSecs : currentSecs}`;
        }
    }
});

// Auto-play the next song when the current one finishes
currentAudio.addEventListener('ended', () => {
    nextTrack();
});

// Allow user to click/drag the slider to skip around in the song
const sliderEl = document.getElementById('music-slider');
if (sliderEl) {
    sliderEl.addEventListener('input', function (e) {
        if (!isNaN(currentAudio.duration)) {
            const seekTime = (e.target.value / 100) * currentAudio.duration;
            currentAudio.currentTime = seekTime;
        }
    });
}

// Initialize on boot
loadTrack(currentTrackIndex);