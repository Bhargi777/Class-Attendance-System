// Seating layout
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

// Collect all roll numbers
const allStudents = [];
[leftColumn, rightColumn].forEach(c =>
    c.forEach(r => r.forEach(v => { if (v) allStudents.push(v); }))
);

// State — restore from localStorage if available
const absent = {};
let swapped = false;

function loadState() {
    try {
        const saved = localStorage.getItem('attendance_absent');
        if (saved) {
            const arr = JSON.parse(saved);
            arr.forEach(n => { absent[n] = 1; });
        }
        swapped = localStorage.getItem('attendance_swapped') === '1';
    } catch (e) { /* ignore */ }
}

function saveState() {
    try {
        const arr = Object.keys(absent).map(Number);
        localStorage.setItem('attendance_absent', JSON.stringify(arr));
        localStorage.setItem('attendance_swapped', swapped ? '1' : '0');
    } catch (e) { /* ignore */ }
}

// Date
(function () {
    const d = new Date();
    const s = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    document.getElementById('dateDisplay').textContent = s;
})();

// Toast
let _t;
function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_t);
    _t = setTimeout(() => el.classList.remove('show'), 2200);
}

// Render
function render() {
    const L = document.getElementById('left-column');
    const R = document.getElementById('right-column');
    L.innerHTML = '';
    R.innerHTML = '';
    const cols = swapped ? [rightColumn, leftColumn] : [leftColumn, rightColumn];

    [L, R].forEach((div, i) => {
        cols[i].forEach(row => {
            const rd = document.createElement('div');
            rd.className = 'seat-row';
            row.forEach(v => {
                if (v) {
                    const s = document.createElement('div');
                    s.className = 'seat';
                    const c = document.createElement('div');
                    c.className = 'seat-circle';
                    if (absent[v]) c.classList.add('absent');
                    c.textContent = v;
                    c.tabIndex = 0;
                    c.setAttribute('role', 'button');
                    c.setAttribute('aria-label', 'Roll ' + v + (absent[v] ? ' absent' : ' present'));
                    c.onclick = () => toggle(v);
                    c.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(v); } };
                    s.appendChild(c);
                    rd.appendChild(s);
                } else {
                    const e = document.createElement('div');
                    e.className = 'empty-seat';
                    rd.appendChild(e);
                }
            });
            div.appendChild(rd);
        });
    });
}

// Toggle
function toggle(roll) {
    if (absent[roll]) {
        delete absent[roll];
        toast('Roll ' + roll + ' → present');
    } else {
        absent[roll] = 1;
        toast('Roll ' + roll + ' → absent');
    }
    saveState();
    refresh();
}

// Refresh everything
function refresh() {
    render();
    const aList = Object.keys(absent).map(Number).sort((a, b) => a - b);
    const pList = allStudents.filter(n => !absent[n]).sort((a, b) => a - b);

    document.getElementById('presentList').textContent = pList.length ? pList.join(', ') : '—';
    document.getElementById('absentList').textContent = aList.length ? aList.join(', ') : '—';
    document.getElementById('presentNum').textContent = pList.length;
    document.getElementById('absentNum').textContent = aList.length;
    document.getElementById('totalNum').textContent = allStudents.length;

    const pct = Math.round((pList.length / allStudents.length) * 100);
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressText').textContent = pct + '%';
}

// Swap
document.getElementById('swapBtn').onclick = function () {
    swapped = !swapped;
    saveState();
    render();
    toast('Sides swapped');
};

// Export
document.getElementById('exportBtn').onclick = function () {
    const aList = Object.keys(absent).map(Number).sort((a, b) => a - b);
    const pList = allStudents.filter(n => !absent[n]).sort((a, b) => a - b);
    const d = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    let txt = 'Attendance — ' + d + '\n';
    txt += 'Present (' + pList.length + '): ' + (pList.join(', ') || 'None') + '\n';
    txt += 'Absent  (' + aList.length + '): ' + (aList.join(', ') || 'None') + '\n';
    txt += 'Total: ' + allStudents.length + ' | ' + Math.round((pList.length / allStudents.length) * 100) + '% attendance';

    navigator.clipboard.writeText(txt).then(() => toast('Copied!')).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast('Copied!');
    });
};

// New day — clear everything
document.getElementById('newDayBtn').onclick = function () {
    Object.keys(absent).forEach(k => delete absent[k]);
    try {
        localStorage.removeItem('attendance_absent');
    } catch (e) { /* ignore */ }
    saveState();
    refresh();
    toast('Fresh start');
};

// Init
loadState();
refresh();
