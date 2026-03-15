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

// State
let allStudents = [];
const absent = {};
let swapped = false;

// Initialization
function initData() {
    allStudents = [];
    [leftColumn, rightColumn].forEach(col => {
        col.forEach(row => {
            row.forEach(val => {
                if (val !== null) allStudents.push(val);
            });
        });
    });
}

function loadState() {
    try {
        const saved = localStorage.getItem('attendance_absent');
        if (saved) {
            const arr = JSON.parse(saved);
            arr.forEach(n => { absent[n] = 1; });
        }
        swapped = localStorage.getItem('attendance_swapped') === '1';
    } catch (e) { console.error('Load failed', e); }
}

function saveState() {
    try {
        const arr = Object.keys(absent).map(Number);
        localStorage.setItem('attendance_absent', JSON.stringify(arr));
        localStorage.setItem('attendance_swapped', swapped ? '1' : '0');
    } catch (e) { console.error('Save failed', e); }
}

// UI Updates
function setDate() {
    const d = new Date();
    const s = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const el = document.getElementById('dateDisplay');
    if (el) el.textContent = s;
}

let _t;
function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_t);
    _t = setTimeout(() => el.classList.remove('show'), 2200);
}

function render() {
    const L = document.getElementById('left-column');
    const R = document.getElementById('right-column');
    if (!L || !R) return;
    
    L.innerHTML = '';
    R.innerHTML = '';
    const cols = swapped ? [rightColumn, leftColumn] : [leftColumn, rightColumn];

    [L, R].forEach((div, i) => {
        cols[i].forEach(row => {
            const rd = document.createElement('div');
            rd.className = 'seat-row';
            row.forEach(v => {
                if (v !== null) {
                    const s = document.createElement('div');
                    s.className = 'seat';
                    const c = document.createElement('div');
                    c.className = 'seat-circle';
                    if (absent[v]) c.classList.add('absent');
                    c.textContent = v;
                    c.tabIndex = 0;
                    c.setAttribute('role', 'button');
                    c.setAttribute('aria-label', `Roll ${v} ${absent[v] ? 'absent' : 'present'}`);
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

function toggle(roll) {
    if (absent[roll]) {
        delete absent[roll];
        toast(`Roll ${roll} → present`);
    } else {
        absent[roll] = 1;
        toast(`Roll ${roll} → absent`);
    }
    saveState();
    refresh();
}

function refresh() {
    render();
    const aList = Object.keys(absent).map(Number).sort((a, b) => a - b);
    const pList = allStudents.filter(n => !absent[n]).sort((a, b) => a - b);

    const elPresent = document.getElementById('presentList');
    const elAbsent = document.getElementById('absentList');
    const elPNum = document.getElementById('presentNum');
    const elANum = document.getElementById('absentNum');
    const elTNum = document.getElementById('totalNum');
    const elBar = document.getElementById('progressBar');
    const elPct = document.getElementById('progressText');

    if (elPresent) elPresent.textContent = pList.length ? pList.join(', ') : '—';
    if (elAbsent) elAbsent.textContent = aList.length ? aList.join(', ') : '—';
    if (elPNum) elPNum.textContent = pList.length;
    if (elANum) elANum.textContent = aList.length;
    if (elTNum) elTNum.textContent = allStudents.length;

    const pct = allStudents.length ? Math.round((pList.length / allStudents.length) * 100) : 0;
    if (elBar) elBar.style.width = `${pct}%`;
    if (elPct) elPct.textContent = `${pct}%`;
}

// Event Bindings
function bindEvents() {
    const btnSwap = document.getElementById('swapBtn');
    const btnExport = document.getElementById('exportBtn');
    const btnCopyPresent = document.getElementById('copyPresentBtn');
    const btnCopyAbsent = document.getElementById('copyAbsentBtn');
    const btnNewDay = document.getElementById('newDayBtn');

    if (btnSwap) btnSwap.onclick = () => {
        swapped = !swapped;
        saveState();
        render();
        toast('Sides swapped');
    };

    if (btnExport) btnExport.onclick = () => {
        const aList = Object.keys(absent).map(Number).sort((a, b) => a - b);
        const pList = allStudents.filter(n => !absent[n]).sort((a, b) => a - b);
        const d = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        
        let txt = `Attendance — ${d}\n`;
        txt += `Present (${pList.length}): ${pList.join(', ') || 'None'}\n`;
        txt += `Absent  (${aList.length}): ${aList.join(', ') || 'None'}\n`;
        txt += `Total: ${allStudents.length} | ${Math.round((pList.length / allStudents.length) * 100)}% attendance`;

        navigator.clipboard.writeText(txt).then(() => toast('Report copied!'));
    };

    if (btnCopyPresent) btnCopyPresent.onclick = () => {
        const pList = allStudents.filter(n => !absent[n]).sort((a, b) => a - b);
        const txt = pList.join(', ');
        if (!txt) return toast('No students present');
        navigator.clipboard.writeText(txt).then(() => toast('Present list copied!'));
    };

    if (btnCopyAbsent) btnCopyAbsent.onclick = () => {
        const aList = Object.keys(absent).map(Number).sort((a, b) => a - b);
        const txt = aList.join(', ');
        if (!txt) return toast('No students absent');
        navigator.clipboard.writeText(txt).then(() => toast('Absent list copied!'));
    };

    if (btnNewDay) btnNewDay.onclick = () => {
        Object.keys(absent).forEach(k => delete absent[k]);
        localStorage.removeItem('attendance_absent');
        saveState();
        refresh();
        toast('Fresh start');
    };
}

// App start
document.addEventListener('DOMContentLoaded', () => {
    initData();
    loadState();
    setDate();
    bindEvents();
    refresh();
});
