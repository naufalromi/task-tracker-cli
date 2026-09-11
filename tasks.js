const fs = require('fs');
const dataFile = 'data.json';
let tasks;
try {
    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, '[]');
    }

    const data = fs.readFileSync(dataFile, 'utf8');
    tasks = JSON.parse(data);
    if (!Array.isArray(tasks)) {
        throw new Error('Task data is not an array');
    }

    const validStatuses = ['todo', 'in-progress', 'done'];
    const isValidTask = tasks.every((task) => {
        task &&
        typeof task === 'object' &&
        Number.isInteger(task.id) &&
        task.id > 0 &&
        typeof task.description === 'string' &&
        task.description.trim() !== '' &&
        validStatuses.includes(task.status) &&
        typeof task.createdAt === 'string' &&
        !isNaN(Date.parse(task.createdAt)) &&
        typeof task.updatedAt === 'string' &&
        !isNaN(Date.parse(task.updatedAt));
    });
    if (!isValidTask) {
        throw new Error('Task data has invalid structure or values');
    }

    const taskIds = tasks.map((task) => task.id);
    const uniqueIds = new Set(taskIds);
    if (uniqueIds.size !== tasks.length) {
        throw new Error('Task IDs must be unique.');
    }
    
} catch (err) {
    console.error('Error: data.json is corrupted or inaccessible', err);
    process.exit(1);
}
let id = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;

module.exports = {
    createTask,
    deleteTask,
    listDone,
    listInProgress,
    listTodo,
    listAll,
    viewTask,
    updateTask,
    markTaskDone,
    markTaskInProgress,
    error
};

function createTask(description) {
    const newTask = {
        id: id++,
        description: description,
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    fs.writeFileSync('data.json', JSON.stringify(tasks, null, 2));
    console.log(`Task created: ${newTask.id}`);
}

function deleteTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        fs.writeFileSync('data.json', JSON.stringify(tasks, null, 2));
        console.log(`Task deleted: ${id}`);
    } else {
        error('Task not found.');
    }
}

function listDone() {
    tasks.filter(task => task.status === 'done').forEach(task => {
        console.log(`Task: ${task.id}`);
        console.log(`Status: ${task.status}`);
        console.log(`Description: ${task.description}`);
        console.log(`Created At: ${task.createdAt}`);
        console.log(`Updated At: ${task.updatedAt}`);
        console.log('-------------------------');
    });
}

function listInProgress() {
    tasks.filter(task => task.status === 'in-progress').forEach(task => {
        console.log(`Task: ${task.id}`);
        console.log(`Status: ${task.status}`);
        console.log(`Description: ${task.description}`);
        console.log(`Created At: ${task.createdAt}`);
        console.log(`Updated At: ${task.updatedAt}`);
        console.log('-------------------------');
    });
}

function listTodo() {
    tasks.filter(task => task.status === 'todo').forEach(task => {
        console.log(`Task: ${task.id}`);
        console.log(`Status: ${task.status}`);
        console.log(`Description: ${task.description}`);
        console.log(`Created At: ${task.createdAt}`);
        console.log(`Updated At: ${task.updatedAt}`);
        console.log('-------------------------');
    });
}

function listAll() {
    tasks.forEach(task => {
        console.log(`Task: ${task.id}`);
        console.log(`Status: ${task.status}`);
        console.log(`Description: ${task.description}`);
        console.log(`Created At: ${task.createdAt}`);
        console.log(`Updated At: ${task.updatedAt}`);
        console.log('-------------------------');
    });
}

function viewTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        console.log(`Task: ${task.id}`);
        console.log(`Status: ${task.status}`);
        console.log(`Description: ${task.description}`);
        console.log(`Created At: ${task.createdAt}`);
        console.log(`Updated At: ${task.updatedAt}`);
    } else {
        error('Task not found.');
    }
}

function updateTask(id, description) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].description = description;
        tasks[taskIndex].updatedAt = new Date().toISOString();
        fs.writeFileSync('data.json', JSON.stringify(tasks, null, 2));
        console.log(`Task updated: ${id}`);
    } else {
        error('Task not found.');
    }
}

function markTaskDone(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.status = 'done';
        task.updatedAt = new Date().toISOString();
        fs.writeFileSync('data.json', JSON.stringify(tasks, null, 2));
        console.log(`Task marked as done: ${id}`);
    } else {
        error('Task not found.');
    }
}

function markTaskInProgress(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.status = 'in-progress';
        task.updatedAt = new Date().toISOString();
        fs.writeFileSync('data.json', JSON.stringify(tasks, null, 2));
        console.log(`Task marked as in-progress: ${id}`);
    } else {
        error('Task not found.');
    }
}

function error(message) {
    console.error(`Error: ${message}`);
    process.exit(1);
}