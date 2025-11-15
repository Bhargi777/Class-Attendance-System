
const leftColumn = [
    [54,53,43,7,46,40],
    [34,48,18,39,25,49],
    [65,55,60,20,41,13],
    [22,2,63,61,21,57],
    [null,null,null,29,35,66],
    [31,9,null,null,null,null]
];

const rightColumn = [
    [null,null,45,30,27,32],
    [17,37,62,51,36,14],
    [10,28,38,5,8,56],
    [15,52,24,33,16,null],
    [4,1,47,64,23,6],
    [12,68,44,19,50,58]
];


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


const statusMap = {}; 


let swap = false; 

function renderSeating() {
    const left = document.getElementById("left-column");
    const right = document.getElementById("right-column");
    left.innerHTML = "";
    right.innerHTML = "";
    const cols = swap ? [rightColumn, leftColumn] : [leftColumn, rightColumn];
    [left, right].forEach((colDiv,idx) => {
        cols[idx].forEach((row, rIdx) => {
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
                    // Set color by status
                    if (statusMap[seatVal]==="absent") circ.classList.add("absent");
                    // else default present: green is via CSS default
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


document.getElementById("absentBtn").onclick = function() {

};

document.getElementById("swapBtn").onclick = function() {
    swap = !swap;
    renderSeating();
};

function handleSeatClick(rollNo) {
    if (statusMap[rollNo]==="absent") {
        delete statusMap[rollNo];
    } else {
        statusMap[rollNo] = "absent";
    }
    renderSeating();
    updateLists();
}


function updateLists() {
    const absentList = Object.entries(statusMap)
        .filter(([,v])=>v==="absent").map(([k])=>+k).sort((a,b)=>a-b);
    const presentList = allStudentNumbers.filter(n=>!statusMap[n]).sort((a,b)=>a-b);
    document.getElementById("presentList").textContent = "Present Students: " + (presentList.length ? presentList.join(", ") : "");
    document.getElementById("absentList").textContent = "Absent Students: " + (absentList.length ? absentList.join(", ") : "");
}


renderSeating();
updateLists();
