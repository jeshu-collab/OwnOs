// =========================
// CLOCK SYSTEM (From Part 2)
// =========================
function updateTime() {
    // If you don't have the top-bar anymore, you can remove this or keep it running silently
    var timeElement = document.querySelector("#timeElement");
    if (timeElement) {
        var options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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
// OPEN / CLOSE APP (Part 4)
// =========================
function toggleApp(id) {
    const app = document.getElementById(id);
    if (!app) return; // Failsafe if app doesn't exist yet

    if (app.style.display === "flex") {
        app.style.display = "none";
    } else {
        app.style.display = "flex";
        bringToFront(app);
    }
}

function closeApp(id) {
    document.getElementById(id).style.display = "none";
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