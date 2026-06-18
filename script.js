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

// --- 1. LOAD TRACK FUNCTION ---
function loadTrack(index) {
    const track = playlist[index];

    // Grab the UI elements
    const titleEl = document.getElementById("music-title");
    const artistEl = document.getElementById("music-artist");
    const totalTimeEl = document.getElementById("time-total");
    const coverEl = document.getElementById("music-cover");

    // Instantly set the duration and a temporary loading state for the text
    if (totalTimeEl) totalTimeEl.innerText = track.duration;
    if (titleEl) titleEl.innerText = "Loading...";
    if (artistEl) artistEl.innerText = "...";

    // Load the actual audio file
    currentAudio.src = track.src;
    currentAudio.load();

    // Crack open the MP3 to get both the Image AND the Text Data
    if (window.jsmediatags) {
        fetch(track.src)
            .then(response => response.blob())
            .then(blob => {
                window.jsmediatags.read(blob, {
                    onSuccess: function (tag) {
                        // DYNAMIC TEXT
                        if (tag.tags.title) {
                            if (titleEl) titleEl.innerText = tag.tags.title;
                        } else {
                            let fileName = track.src.split('/').pop().split('.')[0];
                            if (titleEl) titleEl.innerText = fileName;
                        }

                        if (tag.tags.artist) {
                            if (artistEl) artistEl.innerText = tag.tags.artist;
                        } else {
                            if (artistEl) artistEl.innerText = "Unknown Artist";
                        }

                        // COVER ART
                        const picture = tag.tags.picture;
                        if (picture) {
                            let base64String = "";
                            for (let i = 0; i < picture.data.length; i++) {
                                base64String += String.fromCharCode(picture.data[i]);
                            }
                            const imageUrl = `data:${picture.format};base64,${window.btoa(base64String)}`;
                            if (coverEl) coverEl.src = imageUrl;
                        } else {
                            if (coverEl) coverEl.src = track.cover;
                        }
                    },
                    onError: function (error) {
                        console.log('No tags found.', error);
                        if (titleEl) titleEl.innerText = track.title;
                        if (artistEl) artistEl.innerText = track.artist;
                        if (coverEl) coverEl.src = track.cover;
                    }
                });
            })
            .catch(error => {
                console.log('Could not fetch the MP3 blob:', error);
                if (titleEl) titleEl.innerText = track.title;
                if (coverEl) coverEl.src = track.cover;
            });
    }

    // Reset Progress UI
    const slider = document.getElementById("music-slider");
    const currentTimeEl = document.getElementById("time-current");

    if (slider) {
        slider.value = 0;
        slider.style.background = `rgba(255, 255, 255, 0.15)`; // Reset to grey
    }
    if (currentTimeEl) currentTimeEl.innerText = "00:00";
} // <-- This brace closes the loadTrack function properly now!


// --- 2. PLAYBACK CONTROLS ---

function playSafe() {
    let playPromise = currentAudio.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
            isMusicPlaying = true;
            const playIcon = document.getElementById('play-icon');
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
        if (playIcon) playIcon.innerHTML = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
    }
}

function nextTrack() {
    currentTrackIndex++;
    if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;
    loadTrack(currentTrackIndex);

    if (isMusicPlaying) {
        setTimeout(() => { playSafe(); }, 50);
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

// --- 3. WIDGET CONTROLS ---
function toggleMusicWidget() {
    const widget = document.getElementById('top-music-widget');
    if (widget) widget.classList.toggle('closed');
}


// --- 4. EVENT LISTENERS ---

// Automatically update the straight slider as the song plays
currentAudio.addEventListener('timeupdate', () => {
    if (!isNaN(currentAudio.duration)) {
        const progressPercent = (currentAudio.currentTime / currentAudio.duration) * 100;

        const slider = document.getElementById('music-slider');
        const currentTimeEl = document.getElementById("time-current");

        if (slider) {
            slider.value = progressPercent;
            // Dynamically colors the slider line pastel purple
            slider.style.background = `linear-gradient(to right, #d1bfe3 ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%)`;
        }

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

// --- 5. INITIALIZATION ---
// Initialize on boot
loadTrack(currentTrackIndex);



// =========================
// LOCAL STORAGE NOTES ENGINE
// =========================

// 1. Pull existing notes from the browser, or create an empty array if none exist
let notesArray = JSON.parse(localStorage.getItem('limux_system_notes')) || [];
let activeNoteId = null;

const notesListEl = document.getElementById('notes-list');
const noteTitleInput = document.getElementById('note-title-input');
const noteBodyInput = document.getElementById('note-body-input');
const newNoteBtn = document.getElementById('new-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const deleteNoteBtn = document.getElementById('delete-note-btn');

// NEW: Delete Note Flow
function deleteCurrentNote() {
    // If there is no active note, do nothing
    if (!activeNoteId) return;

    // 1. Filter out the currently active note from the array
    notesArray = notesArray.filter(note => note.id !== activeNoteId);

    // 2. Save the newly updated (smaller) array to the hard drive
    saveNotesToStorage();

    // 3. UX Polish: Load the next available note, or create a blank one if empty
    if (notesArray.length > 0) {
        loadNoteIntoEditor(notesArray[0].id);
    } else {
        createNewNote();
    }
}

// Attach the click event
if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', deleteCurrentNote);

// NEW: Save and Transition Flow
function saveAndNewNote() {
    // 1. Force a final save just in case
    handleTyping();

    // 2. Visual Feedback (Flashes Green)
    const originalText = saveNoteBtn.innerText;
    saveNoteBtn.innerText = "Saved!";
    saveNoteBtn.style.background = "rgba(39, 201, 63, 0.2)";
    saveNoteBtn.style.color = "#46da5c";
    saveNoteBtn.style.borderColor = "rgba(39, 201, 63, 0.4)";

    // 3. Wait a split second, then transition to a new note
    setTimeout(() => {
        // Reset button styles
        saveNoteBtn.innerText = originalText;
        saveNoteBtn.style.background = "";
        saveNoteBtn.style.color = "";
        saveNoteBtn.style.borderColor = "";

        // Generate the blank slate
        createNewNote();
    }, 600); // 600ms delay for the animation
}

// Attach the click event
if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveAndNewNote);
// 2. Core Save Function
function saveNotesToStorage() {
    // Convert the Javascript array to a JSON string and store it
    localStorage.setItem('limux_system_notes', JSON.stringify(notesArray));
    renderNotesList();
}

// 3. Render the sidebar list
function renderNotesList() {
    if (!notesListEl) return;
    notesListEl.innerHTML = '';

    notesArray.forEach(note => {
        const div = document.createElement('div');
        // Add the 'active' class if this is the note currently being edited
        div.className = `note-item ${note.id === activeNoteId ? 'active' : ''}`;
        div.onclick = () => loadNoteIntoEditor(note.id);

        div.innerHTML = `
            <h4>${note.title || 'Untitled Note'}</h4>
            <p>${note.body || ''}</p>
        `;
        notesListEl.appendChild(div);
    });
}

// 4. Create a fresh note
function createNewNote() {
    const newNote = {
        id: Date.now().toString(), // Unique ID based on exact millisecond
        title: '',
        body: '',
        timestamp: Date.now()
    };

    notesArray.unshift(newNote); // Put the new note at the top of the list
    activeNoteId = newNote.id;

    noteTitleInput.value = '';
    noteBodyInput.value = '';
    noteTitleInput.focus(); // Snap the cursor to the title

    saveNotesToStorage();
}

// 5. Load a specific note into the right-side editor
function loadNoteIntoEditor(id) {
    activeNoteId = id;
    const note = notesArray.find(n => n.id === id);
    if (note) {
        noteTitleInput.value = note.title;
        noteBodyInput.value = note.body;
    }
    renderNotesList(); // Re-render to move the purple active highlight
}

// 6. The Auto-Save trigger (fires every time a key is pressed)
function handleTyping() {
    if (!activeNoteId) return;

    const note = notesArray.find(n => n.id === activeNoteId);
    if (note) {
        note.title = noteTitleInput.value;
        note.body = noteBodyInput.value;
        note.timestamp = Date.now();
        saveNotesToStorage(); // Instantly save to hard drive
    }
}

// 7. Event Listeners
if (noteTitleInput) noteTitleInput.addEventListener('input', handleTyping);
if (noteBodyInput) noteBodyInput.addEventListener('input', handleTyping);
if (newNoteBtn) newNoteBtn.addEventListener('click', createNewNote);

// 8. Initialization (When the OS boots)
if (notesArray.length > 0) {
    // If they have saved notes, load the most recent one
    loadNoteIntoEditor(notesArray[0].id);
} else {
    // If it's a brand new user, open a blank slate
    createNewNote();
}

// =========================
// HARDWARE CAMERA ENGINE
// =========================

let cameraStream = null;

// 1. Boot up the hardware
async function bootCamera() {
    const videoEl = document.getElementById('camera-feed');
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false
        });
        videoEl.srcObject = cameraStream;
        videoEl.play();
    } catch (err) {
        console.error("Camera access denied or missing:", err);
        alert("Could not access the camera. Please ensure permissions are granted.");
    }
}

// 2. Smart Launcher for the Dock Icon
// 2. Smart Launcher for the Dock Icon
async function handleCameraToggle() {
    const cameraWindow = document.getElementById('camera-app');

    // 1. Let your Limux OS window manager handle the visual pop-up perfectly
    toggleApp('camera-app');

    // 2. Give the OS a split-second to update the HTML, then check its state
    setTimeout(async () => {
        // If your OS just opened the window, boot the hardware
        if (cameraWindow.style.display !== 'none') {
            await bootCamera();
        } else {
            // If your OS just closed the window, kill the hardware
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraStream = null;
            }
        }
    }, 50);
}

// 3. Safely close UI and hardware (Triggered by the red X)
function closeCameraApp() {
    // 1. Let your Limux OS handle the close animation safely
    closeApp('camera-app');

    // 2. Kill the physical webcam light
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

// 4. Capture the frame and download it
function takePhoto() {
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('camera-canvas');
    const flash = document.getElementById('camera-flash');

    if (!cameraStream) return;

    // Trigger flash
    flash.classList.add('flash');
    setTimeout(() => flash.classList.remove('flash'), 50);

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    // Mirror image so it saves correctly
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Download file
    const imageUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = `Limux_Capture_${Date.now()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}