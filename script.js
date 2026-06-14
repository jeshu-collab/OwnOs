// --- 1. CLOCK LOGIC ---
function updateTime() {
    var options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    var currentTime = new Date().toLocaleString('en-US', options).replace(/,/g, '');
    document.querySelector("#timeElement").innerHTML = currentTime;
}
setInterval(updateTime, 1000);
updateTime();

// --- 2. OPEN & CLOSE LOGIC ---
const widget = document.getElementById("widget");

document.getElementById("openBtn").onclick = function () {
    widget.style.display = "flex";
};

document.getElementById("closeBtn").onclick = function () {
    widget.style.display = "none";
};

// --- 3. BOUNDARY-AWARE DRAGGING LOGIC ---
makeDraggable(document.getElementById("widget"));

function makeDraggable(element) {
    let previousMouseX = 0;
    let previousMouseY = 0;
    let deltaX = 0;
    let deltaY = 0;

    let header = document.getElementById(element.id + "header");

    if (header) {
        header.onmousedown = startDragging;
    } else {
        element.onmousedown = startDragging;
    }

    function startDragging(event) {
        event.preventDefault();
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
        document.onmousemove = dragElement;
        document.onmouseup = stopDragging;
    }

    function dragElement(event) {
        event.preventDefault();

        deltaX = event.clientX - previousMouseX;
        deltaY = event.clientY - previousMouseY;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;

        // Calculate where the window WANTS to go
        let newTop = element.offsetTop + deltaY;
        let newLeft = element.offsetLeft + deltaX;

        // --- THE BOUNDARY COLLISION MATH ---
        // 1. Find the top bar element
        const topBar = document.querySelector('.top-bar');

        // 2. Get its exact height (it will be 40px based on our CSS)
        const topBoundary = topBar ? topBar.offsetHeight : 0;

        // 3. If the window tries to go higher than the boundary, lock it to the boundary
        if (newTop < topBoundary) {
            newTop = topBoundary;
        }

        // Apply the approved coordinates to the window
        element.style.left = newLeft + "px";
        element.style.top = newTop + "px";
    }

    function stopDragging() {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}