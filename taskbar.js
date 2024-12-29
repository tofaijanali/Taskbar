// DOM elements load hone ke baad setup
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Event listeners set karna
    document.getElementById('task-form').addEventListener('submit', addTask); // Task form submit hone par addTask function chalega
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme); // Theme toggle hone par toggleTheme function chalega

    // Menu bar actions
    document.getElementById('all-tasks').addEventListener('click', loadAllTasks); // All tasks button par click hone par loadAllTasks chalega
    document.getElementById('completed-tasks').addEventListener('click', loadCompletedTasks); // Completed tasks button par click hone par loadCompletedTasks chalega
    document.getElementById('high-priority').addEventListener('click', () => filterTasks('high')); // High priority par click hone par filterTasks chalega
    document.getElementById('medium-priority').addEventListener('click', () => filterTasks('medium')); // Medium priority par click hone par filterTasks chalega
    document.getElementById('low-priority').addEventListener('click', () => filterTasks('low')); // Low priority par click hone par filterTasks chalega
    document.getElementById('deleted-tasks').addEventListener('click', loadDeletedTasks); // Deleted tasks button par click hone par loadDeletedTasks chalega

    loadAllTasks(); // Initial tasks load karna
}

// Task list ke liye array
let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // LocalStorage se tasks ko fetch karna
let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || []; // LocalStorage se deleted tasks ko fetch karna
let editTaskId = null; // Edit mode ke liye ID

// Task add karne ya edit karne ka function
function addTask(e) {
    e.preventDefault(); // Form ke default submit action ko rokna

    // Form inputs get karna
    let title = document.getElementById('task-title').value;
    let description = document.getElementById('task-description').value;
    let dueDate = document.getElementById('task-due-date').value;
    let priority = document.getElementById('task-priority').value;
    let isCompleted = false; // Nayi task ko incomplete set karna

    if (editTaskId) {
        // Edit mode mein task update karna
        tasks = tasks.map((task) => {
            if (task.id === editTaskId) {
                return { ...task, title, description, dueDate, priority }; // Existing task ko update karna
            }
            return task; // Agar task match nahi hota to waise ka waise rakhna
        });
        editTaskId = null; // Edit mode reset karna
    } else {
        // Nayi task add karna
        let task = {
            id: Date.now(), // Unique ID for each task
            title,
            description,
            dueDate,
            priority,
            isCompleted
        };
        tasks.push(task); // Nayi task ko tasks array mein add karna
    }

    // Task list update karna aur localStorage mein save karna
    updateTaskList();
    saveTasksToStorage();

    // Form reset kar dena
    document.getElementById('task-form').reset();
}

// Tasks ko localStorage mein save karna
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Tasks ko localStorage mein store karna
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks)); // Deleted tasks ko localStorage mein store karna
}

// Task list ko update karna
function updateTaskList() {
    let taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Purana data clear karna

    tasks.forEach((task) => {
        let li = document.createElement('li'); // New list item create karna
        li.className = task.priority; // Task ke priority ke according class set karna

        // Task details add karna
        li.innerHTML = `
            <div>
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <small>Due: ${task.dueDate}</small>
            </div>
            <div>
                <button onclick="startEditTask(${task.id})">Edit</button> <!-- Edit button -->
                <button onclick="deleteTask(${task.id})">Delete</button> <!-- Delete button -->
                <button onclick="toggleComplete(${task.id})">${task.isCompleted ? 'Undo' : 'Complete'}</button> <!-- Complete/Undo button -->
            </div>
        `;

        taskList.appendChild(li); // DOM mein list item ko append karna
    });
}

// Task delete karne ka function
function deleteTask(taskId) {
    let taskToDelete = tasks.find((task) => task.id === taskId); // Task ko find karna by ID
    if (taskToDelete) {
        deletedTasks.push(taskToDelete); // Task ko deletedTasks array mein move karna
        tasks = tasks.filter((task) => task.id !== taskId); // Tasks array mein se delete karna

        // Task list update karna aur save karna
        updateTaskList();
        saveTasksToStorage();
    }
}

// Task edit karne ke liye form pre-fill
function startEditTask(taskId) {
    let taskToEdit = tasks.find((task) => task.id === taskId); // Task ko find karna by ID
    if (taskToEdit) {
        // Form inputs ko task ke data se pre-fill karna
        document.getElementById('task-title').value = taskToEdit.title;
        document.getElementById('task-description').value = taskToEdit.description;
        document.getElementById('task-due-date').value = taskToEdit.dueDate;
        document.getElementById('task-priority').value = taskToEdit.priority;

        editTaskId = taskId; // Edit mode enable karna
    }
}

// All tasks ko load karna
function loadAllTasks() {
    updateTaskList(); // Saare tasks ko display karna
}

// Completed tasks ko load karna
function loadCompletedTasks() {
    let taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Purana data clear karna

    tasks
        .filter((task) => task.isCompleted) // Completed tasks filter karna
        .forEach((task) => {
            let li = document.createElement('li');
            li.className = task.priority;

            li.innerHTML = `
                <div>
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <small>Due: ${task.dueDate}</small>
                </div>
                <div>
                    <button onclick="startEditTask(${task.id})">Edit</button>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;

            taskList.appendChild(li); // DOM mein append
        });
}

// Deleted tasks ko load karna
function loadDeletedTasks() {
    let taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Purana data clear karna

    if (deletedTasks.length === 0) {
        taskList.innerHTML = '<p>No deleted tasks found.</p>'; // Agar koi deleted task nahi hai to message dikhana
    } else {
        deletedTasks.forEach((task) => {
            let li = document.createElement('li');
            li.className = task.priority;
            li.style.textDecoration = 'line-through'; // Crossed-out style for deleted tasks

            li.innerHTML = `
                <div>
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <small>Due: ${task.dueDate}</small>
                </div>
                <div>
                    <button onclick="restoreTask(${task.id})">Restore</button> <!-- Restore button -->
                    <button onclick="deleteTaskPermanently(${task.id})">Delete Permanently</button> <!-- Permanent delete button -->
                </div>
            `;

            taskList.appendChild(li); // DOM mein append
        });
    }
}

// Task ko permanently delete karna
function deleteTaskPermanently(taskId) {
    deletedTasks = deletedTasks.filter((task) => task.id !== taskId); // Permanently delete karna
    saveTasksToStorage();
    loadDeletedTasks(); // Updated deleted tasks load karna
}

// Task ko restore karna
function restoreTask(taskId) {
    let taskToRestore = deletedTasks.find((task) => task.id === taskId); // Task ko find karna
    if (taskToRestore) {
        tasks.push(taskToRestore); // Task ko tasks mein restore karna
        deletedTasks = deletedTasks.filter((task) => task.id !== taskId); // Delete from deleted tasks
        saveTasksToStorage();
        loadAllTasks(); // Tasks ko load karna
    }
}

// Priority ke basis pe tasks filter karna
function filterTasks(priority) {
    let taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Purana data clear karna

    tasks
        .filter((task) => task.priority === priority) // Filter tasks by priority
        .forEach((task) => {
            let li = document.createElement('li');
            li.className = task.priority;

            li.innerHTML = `
                <div>
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <small>Due: ${task.dueDate}</small>
                </div>
                <div>
                    <button onclick="startEditTask(${task.id})">Edit</button>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;

            taskList.appendChild(li); // DOM mein append
        });
}

// Task complete ya incomplete karna
function toggleComplete(taskId) {
    let taskToToggle = tasks.find((task) => task.id === taskId); // Task ko find karna by ID
    if (taskToToggle) {
        taskToToggle.isCompleted = !taskToToggle.isCompleted; // Task ka status toggle karna
        saveTasksToStorage();
        updateTaskList();
    }
}

// Theme toggle function
function toggleTheme() {
    document.body.classList.toggle('dark-theme'); // Dark theme toggle karna
}
