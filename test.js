const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');

const originalDir = process.cwd();
const projectDir = __dirname;
let testDir;
let tasks;

function readTasks() {
    return JSON.parse(fs.readFileSync('data.json', 'utf8'));
}

function captureConsole(method, callback) {
    const original = console[method];
    const messages = [];
    console[method] = (...args) => messages.push(args.join(' '));

    try {
        callback();
    } finally {
        console[method] = original;
    }

    return messages.join('\n');
}

before(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-tracker-cli-'));
    fs.copyFileSync(path.join(projectDir, 'data.json'), path.join(testDir, 'data.json'));
    process.chdir(testDir);

    // tasks.js reads data.json when it is loaded, so load it after changing directory.
    tasks = require(path.join(projectDir, 'tasks.js'));
});

after(() => {
    process.chdir(originalDir);
    fs.rmSync(testDir, { recursive: true, force: true });
});

test('createTask adds a todo task to the temporary data file', () => {
    const output = captureConsole('log', () => tasks.createTask('Write tests'));
    const task = readTasks().at(-1);

    assert.equal(output, 'Task created: 6');
    assert.deepEqual(
        { id: task.id, description: task.description, status: task.status },
        { id: 6, description: 'Write tests', status: 'todo' }
    );
    assert.ok(Date.parse(task.createdAt));
    assert.ok(Date.parse(task.updatedAt));
});

test('updateTask and status functions persist changes', () => {
    captureConsole('log', () => tasks.updateTask(6, 'Write CLI tests'));
    captureConsole('log', () => tasks.markTaskInProgress(6));
    const output = captureConsole('log', () => tasks.markTaskDone(6));
    const task = readTasks().find(({ id }) => id === 6);

    assert.equal(output, 'Task marked as done: 6');
    assert.equal(task.description, 'Write CLI tests');
    assert.equal(task.status, 'done');
});

test('list and view functions display matching tasks', () => {
    const done = captureConsole('log', () => tasks.listDone());
    const inProgress = captureConsole('log', () => tasks.listInProgress());
    const view = captureConsole('log', () => tasks.viewTask(6));

    assert.match(done, /Task: 6/);
    assert.match(done, /Description: Write CLI tests/);
    assert.match(inProgress, /Task: 2/);
    assert.match(view, /Status: done/);
});

test('deleteTask removes the task from the temporary data file', () => {
    const output = captureConsole('log', () => tasks.deleteTask(6));

    assert.equal(output, 'Task deleted: 6');
    assert.equal(readTasks().some(({ id }) => id === 6), false);
});
