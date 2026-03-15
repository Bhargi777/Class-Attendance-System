// ============================================
// Classroom Attendance System — Main Script
// ============================================

// --- Seating Configuration ---
const leftColumn = [
    [54, 53, 43, 7, 46, 40],
    [34, 48, 18, 39, 25, 49],
    [65, 55, 60, 20, 41, 13],
    [22, 2, 63, 61, 21, 57],
    [null, null, null, 29, 35, 66],
    [31, 9, null, null, null, null]
];

const rightColumn = [
    [null, null, 45, 30, 27, 32],
    [17, 37, 62, 51, 36, 14],
    [10, 28, 38, 5, 8, 56],
    [15, 52, 24, 33, 16, null],
    [4, 1, 47, 64, 23, 6],
    [12, 68, 44, 19, 50, 58]
];

// --- Get all valid student roll numbers ---
const getAllStudentNumbers = () => {
    const nums = [];
    [leftColumn, rightColumn].forEach(col =>
        col.forEach(row =>
            row.forEach(val => { if (val) nums.push(val); })
        )
    );
    return nums;
};
const allStudentNumbers = getAllStudentNumbers();

// --- State ---
const statusMap = {};  // roll -> "absent"
let swap = false;
let highlightedRoll = null;

// --- Date Display ---
function setDateDisplay() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    document.getElementById('dateDisplay').textContent = dateStr;
}

// --- Toast Notification ---
let toastTimeout = null;
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// --- Render Seating Chart ---
function renderSeating() {
    const left = document.getElementById("left-column");
    const right = document.getElementById("right-column");
    left.innerHTML = "";
    right.innerHTML = "";

    const cols = swap ? [rightColumn, leftColumn] : [leftColumn, rightColumn];

    [left, right].forEach((colDiv, idx) => {
        cols[idx].forEach((row) => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "seat-row";

            row.forEach(seatVal => {
                if (seatVal) {
                    const seat = document.createElement("div");
                    seat.className = "seat";

                    const circ = document.createElement("div");
                    circ.className = "seat-circle";
                    circ.textContent = seatVal;
                    circ.setAttribute("data-roll", seatVal);

                    // Apply status classes
                    if (statusMap[seatVal] === "absent") {
                        circ.classList.add("absent");
                    }

                    // Apply highlight
                    if (highlightedRoll === seatVal) {
                        circ.classList.add("highlighted");
                    }

                    circ.onclick = () => handleSeatClick(seatVal);
                    seat.appendChild(circ);
                    rowDiv.appendChild(seat);
                } else {
                    const empty = document.createElement("div");
                    empty.className = "empty-seat";
                    rowDiv.appendChild(empty);
                }
            });

            colDiv.appendChild(rowDiv);
        });
    });
}

// --- Handle Seat Click ---
function handleSeatClick(rollNo) {
    if (statusMap[rollNo] === "absent") {
        delete statusMap[rollNo];
        showToast(`Roll #${rollNo} marked as Present ✓`);
    } else {
        statusMap[rollNo] = "absent";
        showToast(`Roll #${rollNo} marked as Absent ✗`);
    }
    renderSeating();
    updateLists();
    updateStats();
    updateProgress();
}

// --- Update Present/Absent Lists ---
function updateLists() {
    const absentList = Object.entries(statusMap)
        .filter(([, v]) => v === "absent")
        .map(([k]) => +k)
        .sort((a, b) => a - b);

    const presentList = allStudentNumbers
        .filter(n => !statusMap[n])
        .sort((a, b) => a - b);

    const presentDiv = document.getElementById("presentList");
    const absentDiv = document.getElementById("absentList");

    if (presentList.length) {
        presentDiv.textContent = presentList.join(", ");
    } else {
        presentDiv.textContent = "—";
    }

    if (absentList.length) {
        absentDiv.textContent = absentList.join(", ");
    } else {
        absentDiv.textContent = "—";
    }
}

// --- Update Stats Pills ---
function updateStats() {
    const absentCount = Object.values(statusMap).filter(v => v === "absent").length;
    const presentCount = allStudentNumbers.length - absentCount;

    document.getElementById("presentNum").textContent = presentCount;
    document.getElementById("absentNum").textContent = absentCount;
    document.getElementById("totalNum").textContent = allStudentNumbers.length;
}

// --- Update Progress Bar ---
function updateProgress() {
    const absentCount = Object.values(statusMap).filter(v => v === "absent").length;
    const presentCount = allStudentNumbers.length - absentCount;
    const percentage = Math.round((presentCount / allStudentNumbers.length) * 100);

    const bar = document.getElementById("progressBar");
    const text = document.getElementById("progressText");

    bar.style.width = percentage + "%";
    text.textContent = percentage + "% Present";
}

// --- Swap Layout ---
document.getElementById("swapBtn").onclick = function () {
    swap = !swap;
    renderSeating();
    showToast("Layout swapped 🔄");
};

// --- Mark All Present ---
document.getElementById("markAllPresentBtn").onclick = function () {
    Object.keys(statusMap).forEach(key => delete statusMap[key]);
    renderSeating();
    updateLists();
    updateStats();
    updateProgress();
    showToast("All students marked as Present ✓");
};

// --- Mark All Absent ---
document.getElementById("markAllAbsentBtn").onclick = function () {
    allStudentNumbers.forEach(n => { statusMap[n] = "absent"; });
    renderSeating();
    updateLists();
    updateStats();
    updateProgress();
    showToast("All students marked as Absent ✗");
};

// --- Reset ---
document.getElementById("resetBtn").onclick = function () {
    Object.keys(statusMap).forEach(key => delete statusMap[key]);
    highlightedRoll = null;
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";
    renderSeating();
    updateLists();
    updateStats();
    updateProgress();
    showToast("Attendance reset 🔄");
};

// --- Copy Report ---
document.getElementById("exportBtn").onclick = function () {
    const absentList = Object.entries(statusMap)
        .filter(([, v]) => v === "absent")
        .map(([k]) => +k)
        .sort((a, b) => a - b);

    const presentList = allStudentNumbers
        .filter(n => !statusMap[n])
        .sort((a, b) => a - b);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    let report = `📋 ATTENDANCE REPORT\n`;
    report += `📅 Date: ${dateStr}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `✅ Present (${presentList.length}): ${presentList.join(", ") || "None"}\n`;
    report += `❌ Absent (${absentList.length}): ${absentList.join(", ") || "None"}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `📊 Total: ${allStudentNumbers.length} | Present: ${presentList.length} | Absent: ${absentList.length}\n`;
    report += `📈 Attendance: ${Math.round((presentList.length / allStudentNumbers.length) * 100)}%`;

    navigator.clipboard.writeText(report).then(() => {
        showToast("Report copied to clipboard! 📋");
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = report;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showToast("Report copied to clipboard! 📋");
    });
};

// --- Search / Highlight ---
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
const searchClose = document.getElementById("searchClose");

searchToggle.onclick = function () {
    if (searchBar.style.display === "none") {
        searchBar.style.display = "block";
        searchInput.focus();
    } else {
        searchBar.style.display = "none";
        highlightedRoll = null;
        searchInput.value = "";
        renderSeating();
    }
};

searchClose.onclick = function () {
    searchBar.style.display = "none";
    highlightedRoll = null;
    searchInput.value = "";
    renderSeating();
};

searchInput.addEventListener("input", function () {
    const val = parseInt(this.value, 10);
    if (val && allStudentNumbers.includes(val)) {
        highlightedRoll = val;
    } else {
        highlightedRoll = null;
    }
    renderSeating();
});

// --- Keyboard shortcut: Escape to close search ---
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && searchBar.style.display !== "none") {
        searchClose.click();
    }
});

// --- Initialize ---
setDateDisplay();
renderSeating();
updateLists();
updateStats();
updateProgress();
