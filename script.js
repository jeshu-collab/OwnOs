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