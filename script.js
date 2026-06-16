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
// MUSIC PLAYER ENGINE (Wave Update)
// =========================

let isMusicPlaying = false;
let currentTrackIndex = 0;
let musicProgressVal = 0;
let musicInterval;

const playlist = [
    {
        title: "Deep Fried",
        artist: "Aves",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop",
        duration: "02:12"
    },
    {
        title: "Neon Horizon",
        artist: "Synthwave Architect",
        cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=500&auto=format&fit=crop",
        duration: "03:45"
    }
];

function loadTrack(index) {
    const track = playlist[index];

    // Inject Data into the new Mini Header
    const miniHeader = document.getElementById("mini-track-info");
    if (miniHeader) {
        // Formats it like "Deep Fried - Aves"
        miniHeader.innerText = `${track.title} - ${track.artist}`;
    }

    // Reset Progress Elements
    musicProgressVal = 0;
    const slider = document.getElementById("music-slider");

    if (slider) slider.value = 0;
}

function togglePlay() {
    const playIcon = document.getElementById('play-icon');
    const slider = document.getElementById('music-slider');
    const waveFill = document.getElementById('wave-fill');
    const currentTimeEl = document.getElementById('time-current');

    // THE FIX: Always kill the timer first to prevent runaway orphaned intervals
    clearInterval(musicInterval);

    isMusicPlaying = !isMusicPlaying;

    if (isMusicPlaying) {
        // Change SVG to Pause
        if (playIcon) playIcon.innerHTML = '<path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

        musicInterval = setInterval(() => {
            musicProgressVal += 0.5;

            if (musicProgressVal > 100) {
                nextTrack(); // Auto-skip when track is done
            } else {
                // Update the diamond and the green wave width
                if (slider) slider.value = musicProgressVal;
                if (waveFill) waveFill.style.width = musicProgressVal + '%';

                // Update the timer text
                let seconds = Math.floor((musicProgressVal / 100) * 132);
                let m = Math.floor(seconds / 60);
                let s = seconds % 60;
                if (currentTimeEl) currentTimeEl.innerText = `0${m}:${s < 10 ? '0' + s : s}`;
            }
        }, 1000);
    } else {
        // Change SVG back to Play
        if (playIcon) playIcon.innerHTML = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
    }
}

function nextTrack() {
    currentTrackIndex++;
    if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;
    loadTrack(currentTrackIndex);
    if (isMusicPlaying) {
        isMusicPlaying = false;
        togglePlay();
    }
}

function prevTrack() {
    currentTrackIndex--;
    if (currentTrackIndex < 0) currentTrackIndex = playlist.length - 1;
    loadTrack(currentTrackIndex);
    if (isMusicPlaying) {
        isMusicPlaying = false;
        togglePlay();
    }
}

// Allow user to drag the diamond and update the wave width manually!
const sliderEl = document.getElementById('music-slider');
if (sliderEl) {
    sliderEl.addEventListener('input', function (e) {
        musicProgressVal = parseFloat(e.target.value);
        const waveFill = document.getElementById("wave-fill");
        if (waveFill) waveFill.style.width = musicProgressVal + '%';

        // Update mock time while dragging
        const currentTimeEl = document.getElementById('time-current');
        let seconds = Math.floor((musicProgressVal / 100) * 132);
        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        if (currentTimeEl) currentTimeEl.innerText = `0${m}:${s < 10 ? '0' + s : s}`;
    });
}

// Initialize on boot
loadTrack(currentTrackIndex);