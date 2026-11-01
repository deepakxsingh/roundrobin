
// ==========================================
// 1. DOM ELEMENTS
// ==========================================

const taskIdInput = document.getElementById("taskId");
const burstTimeInput = document.getElementById("burstTime");
const quantumInput = document.getElementById("timeQuantum");

const addTaskBtn = document.getElementById("addTaskBtn");
const runBtn = document.getElementById("runBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");

const taskList = document.getElementById("taskList");
const timeline = document.getElementById("timeline");
const statistics = document.getElementById("statistics");

const currentStatus = document.getElementById("currentStatus");
const currentTimeDisplay = document.getElementById("currentTime");

const circularQueue = document.getElementById("circularQueue");
// ==========================================
// 2. SIMULATION DATA
// ==========================================

let tasks = [];

let simulationQueue = [];
let executionHistory = [];
let results = [];

let currentTime = 0;
let quantum = 3;

let timer = null;
let isRunning = false;
let simulationStarted = false;
let simulationFinished = false;


// ==========================================
// 3. ADD TASK
// ==========================================

addTaskBtn.addEventListener("click", () => {

    const id = Number(taskIdInput.value);
    const burstTime = Number(burstTimeInput.value);

    if (!Number.isInteger(id) || !Number.isInteger(burstTime) ||
        id <= 0 || burstTime <= 0) {

        alert("Enter valid positive integer values.");
        return;
    }

    if (tasks.some(task => task.id === id)) {
        alert("Task ID already exists.");
        return;
    }

    // Stop and clear previous simulation
    resetSimulation();

    tasks.push({
        id: id,
        burstTime: burstTime
    });

    renderTasks();

    taskIdInput.value = "";
    burstTimeInput.value = "";

});


// ==========================================
// 4. DELETE TASK
// ==========================================

function deleteTask(id) {

    resetSimulation();

    tasks = tasks.filter(task => task.id !== id);

    renderTasks();
}


// ==========================================
// 5. DISPLAY TASKS
// ==========================================

function renderTasks() {

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = "<p>No tasks added yet.</p>";
        return;
    }

    tasks.forEach(task => {

        const div = document.createElement("div");
        div.className = "task-item";

        const details = document.createElement("span");

        details.textContent =
            `Task T${task.id} | Burst Time: ${task.burstTime} ms`;

        const deleteBtn = document.createElement("button");

        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => {
            deleteTask(task.id);
        });

        div.appendChild(details);
        div.appendChild(deleteBtn);

        taskList.appendChild(div);

    });
    if (!simulationStarted) {
    simulationQueue = tasks.map(task => ({
        id: task.id,
        burstTime: task.burstTime,
        remainingTime: task.burstTime
    }));

    renderQueue();
}
}


// ==========================================
// 6. START SIMULATION
// ==========================================

function startSimulation() {

    if (tasks.length === 0) {
        alert("Please add at least one task.");
        return;
    }

    quantum = Number(quantumInput.value);

    if (!Number.isInteger(quantum) || quantum <= 0) {
        alert("Enter a valid time quantum.");
        return;
    }

    resetSimulation();

    // Create a fresh copy of the tasks
    simulationQueue = tasks.map(task => ({
        id: task.id,
        burstTime: task.burstTime,
        remainingTime: task.burstTime
    }));

    simulationStarted = true;

    renderQueue();
    updateStatus("Ready");

}


// ==========================================
// 7. EXECUTE ONE SCHEDULING STEP
// ==========================================

function runNextStep() {

    if (!simulationStarted || simulationFinished) {
        return;
    }

    if (simulationQueue.length === 0) {
        finishSimulation();
        return;
    }

    // Get first task
    const task = simulationQueue.shift();

    // Determine execution time
    const executionTime = Math.min(
        task.remainingTime,
        quantum
    );

    const startTime = currentTime;

    // Execute task
    task.remainingTime -= executionTime;

    currentTime += executionTime;

    // Save execution history
    executionHistory.push({
        id: task.id,
        startTime: startTime,
        endTime: currentTime
    });

    // Check task completion
    if (task.remainingTime === 0) {

        results.push({
            id: task.id,
            burstTime: task.burstTime,
            completionTime: currentTime,
            turnaroundTime: currentTime,
            waitingTime: currentTime - task.burstTime
        });

    } else {

        // Move unfinished task to the back
        simulationQueue.push(task);

    }

    // Update interface
    renderQueue();
    renderTimeline();
    renderStatistics();

    currentTimeDisplay.textContent =
        `CPU Time: ${currentTime} ms`;

    // Check whether all tasks are completed
    if (simulationQueue.length === 0) {
        finishSimulation();
    }

}


// ==========================================
// 8. PLAY SIMULATION
// ==========================================

function playSimulation() {

    if (simulationFinished || isRunning) {
        return;
    }

    if (!simulationStarted) {
        startSimulation();
    }

    if (simulationFinished || simulationQueue.length === 0) {
        return;
    }

    isRunning = true;

    updateStatus("Running");

    timer = setInterval(() => {

        runNextStep();

    }, 1000);

}


// ==========================================
// 9. PAUSE SIMULATION
// ==========================================

function pauseSimulation() {

    clearInterval(timer);

    timer = null;

    isRunning = false;

    if (!simulationFinished && simulationStarted) {
        updateStatus("Paused");
    }

}


// ==========================================
// 10. FINISH SIMULATION
// ==========================================

function finishSimulation() {

    clearInterval(timer);

    timer = null;

    isRunning = false;

    simulationFinished = true;

    updateStatus("Completed");

}


// ==========================================
// 11. DISPLAY CURRENT QUEUE
// ==========================================


function renderQueue() {

    circularQueue.innerHTML = "";

    if (simulationQueue.length === 0) {
        circularQueue.innerHTML =
            "<p>All tasks completed. Queue is empty.</p>";

        taskList.innerHTML = "<p>No active tasks.</p>";
        return;
    }

    const container = document.createElement("div");
    container.className = "queue-container";

    simulationQueue.forEach((task, index) => {

        const node = document.createElement("div");
        node.className = "queue-node";

        if (index === 0) {
            node.classList.add("active-node");
        }

        node.innerHTML = `
            <strong>T${task.id}</strong>
            <span>${task.remainingTime} ms</span>
        `;

        container.appendChild(node);

        if (index < simulationQueue.length - 1) {
            const arrow = document.createElement("div");
            arrow.className = "queue-arrow";
            arrow.textContent = "→";

            container.appendChild(arrow);
        }

    });

    // Connect last node back to first
    const circularArrow = document.createElement("div");
    circularArrow.className = "circular-arrow";
    circularArrow.textContent = "↶ Back to Head";

    container.appendChild(circularArrow);

    circularQueue.appendChild(container);

    // Keep the regular task list updated
    taskList.innerHTML = "";

    simulationQueue.forEach(task => {

        const div = document.createElement("div");
        div.className = "task-item";

        div.textContent =
            `T${task.id} | Remaining: ${task.remainingTime} ms`;

        taskList.appendChild(div);

    });

}


// ==========================================
// 12. DISPLAY EXECUTION TIMELINE
// ==========================================

function renderTimeline() {

    timeline.innerHTML = "";

    executionHistory.forEach(item => {

        const div = document.createElement("div");

        div.className = "timeline-item";

        div.innerHTML = `
            <strong>T${item.id}</strong><br>
            ${item.startTime} - ${item.endTime} ms
        `;

        timeline.appendChild(div);

    });

}


// ==========================================
// 13. DISPLAY STATISTICS
// ==========================================

function renderStatistics() {

    let totalWT = 0;
    let totalTAT = 0;

    let html = `
        <table>
            <tr>
                <th>Task</th>
                <th>BT</th>
                <th>CT</th>
                <th>TAT</th>
                <th>WT</th>
            </tr>
    `;

    results.forEach(task => {

        totalWT += task.waitingTime;
        totalTAT += task.turnaroundTime;

        html += `
            <tr>
                <td>T${task.id}</td>
                <td>${task.burstTime}</td>
                <td>${task.completionTime}</td>
                <td>${task.turnaroundTime}</td>
                <td>${task.waitingTime}</td>
            </tr>
        `;

    });

    html += "</table>";

    if (results.length > 0) {

        html += `
            <p>Average Waiting Time:
            ${(totalWT / results.length).toFixed(2)} ms</p>

            <p>Average Turnaround Time:
            ${(totalTAT / results.length).toFixed(2)} ms</p>
        `;

    } else {

        html += "<p>No completed tasks yet.</p>";

    }

    statistics.innerHTML = html;

}


// ==========================================
// 14. RESET SIMULATION
// ==========================================

function resetSimulation() {

    clearInterval(timer);

    timer = null;

    isRunning = false;

    simulationStarted = false;
    simulationFinished = false;

    simulationQueue = [];
    executionHistory = [];
    results = [];

    currentTime = 0;

    currentTimeDisplay.textContent = "CPU Time: 0 ms";

    updateStatus("Ready");

    timeline.innerHTML =
        "<p>Run the simulation to see the timeline.</p>";

    statistics.innerHTML =
        "<p>Statistics will appear here.</p>";

    renderTasks();

}


// ==========================================
// 15. UPDATE STATUS
// ==========================================

function updateStatus(status) {

    currentStatus.textContent = `Status: ${status}`;

}


// ==========================================
// 16. BUTTON EVENT LISTENERS
// ==========================================

runBtn.addEventListener("click", () => {

    if (!simulationStarted || simulationFinished) {
        startSimulation();
    }

    playSimulation();

});


pauseBtn.addEventListener("click", () => {

    pauseSimulation();

});


stepBtn.addEventListener("click", () => {

    if (!simulationStarted) {
        startSimulation();
    }

    pauseSimulation();

    runNextStep();

});


resetBtn.addEventListener("click", () => {

    resetSimulation();

});


// ==========================================
// 17. INITIAL PAGE RENDER
// ==========================================

renderTasks();


document.getElementById("loadCResults").addEventListener("click", async () => {
    try {
        const response = await fetch("./output.json");

        if (!response.ok) {
            throw new Error("Run the C program first.");
        }

        const data = await response.json();

        // Load execution history from C
        executionHistory = data.executions.map(item => ({
            id: item.id,
            startTime: item.start,
            endTime: item.end
        }));

        // Load statistics from C
        results = data.statistics.map(item => ({
            id: item.id,
            burstTime: item.burstTime,
            completionTime: item.completionTime,
            turnaroundTime: item.turnaroundTime,
            waitingTime: item.waitingTime
        }));

        // Update frontend
        timeline.innerHTML = "";
        statistics.innerHTML = "";

        renderTimeline();
        renderStatistics();

        currentTime = Math.max(
            ...data.executions.map(item => item.end)
        );

        currentTimeDisplay.textContent =
            `CPU Time: ${currentTime} ms`;

        updateStatus("C Results Loaded");

        alert("C scheduler results loaded successfully!");

    } catch (error) {
        alert(error.message);
    }
});
