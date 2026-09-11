const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
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

function createCliDirectory(initialData) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'task-tracker-cli-cli-'));

    if (initialData !== undefined) {
        fs.writeFileSync(path.join(directory, 'data.json'), initialData);
    }

    return directory;
}

function runCli(directory, ...arguments_) {
    return spawnSync(process.execPath, [path.join(projectDir, 'app.js'), ...arguments_], {
        cwd: directory,
        encoding: 'utf8'
    });
}

function removeDirectory(directory) {
    fs.rmSync(directory, { recursive: true, force: true });
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
    const todo = captureConsole('log', () => tasks.listTodo());
    const view = captureConsole('log', () => tasks.viewTask(6));

    assert.match(done, /Task: 6/);
    assert.match(done, /Description: Write CLI tests/);
    assert.match(inProgress, /Task: 2/);
    assert.match(todo, /Task: 1/);
    assert.match(view, /Status: done/);
});

test('deleteTask removes the task from the temporary data file', () => {
    const output = captureConsole('log', () => tasks.deleteTask(6));

    assert.equal(output, 'Task deleted: 6');
    assert.equal(readTasks().some(({ id }) => id === 6), false);
});

test('CLI creates data.json automatically on first use', () => {
    const directory = createCliDirectory();

    try {
        const result = runCli(directory, 'create', 'First task');

        assert.equal(result.status, 0);
        assert.equal(result.stdout.trim(), 'Task created: 1');
        const savedTasks = JSON.parse(fs.readFileSync(path.join(directory, 'data.json'), 'utf8'));
        assert.equal(savedTasks.length, 1);
        assert.equal(savedTasks[0].id, 1);
        assert.equal(savedTasks[0].description, 'First task');
        assert.equal(savedTasks[0].status, 'todo');
        assert.ok(Date.parse(savedTasks[0].createdAt));
        assert.ok(Date.parse(savedTasks[0].updatedAt));
    } finally {
        removeDirectory(directory);
    }
});

test('CLI rejects blank task descriptions', () => {
    const directory = createCliDirectory('[]');

    try {
        for (const command of [
            ['create'],
            ['create', '   '],
            ['update', '1'],
            ['update', '1', '   ']
        ]) {
            const result = runCli(directory, ...command);

            assert.equal(result.status, 1, command.join(' '));
            assert.match(result.stderr, /Error: .*description/i);
        }

        assert.deepEqual(JSON.parse(fs.readFileSync(path.join(directory, 'data.json'), 'utf8')), []);
    } finally {
        removeDirectory(directory);
    }
});

test('CLI rejects missing, non-numeric, and non-positive IDs', () => {
    const directory = createCliDirectory('[]');
    const commands = ['delete', 'update', 'mark-done', 'mark-in-progress', 'view'];

    try {
        for (const command of commands) {
            for (const invalidId of [undefined, 'abc', '0', '-1', '1.5']) {
                const arguments_ = invalidId === undefined ? [command] : [command, invalidId];
                const result = runCli(directory, ...arguments_);

                assert.equal(result.status, 1, arguments_.join(' '));
                assert.match(result.stderr, /Error: Invalid task ID/);
            }
        }
    } finally {
        removeDirectory(directory);
    }
});

test('CLI reports an error when a requested task does not exist', () => {
    const directory = createCliDirectory('[]');

    try {
        for (const command of [
            ['delete', '1'],
            ['update', '1', 'Changed task'],
            ['mark-done', '1'],
            ['mark-in-progress', '1'],
            ['view', '1']
        ]) {
            const result = runCli(directory, ...command);

            assert.equal(result.status, 1, command.join(' '));
            assert.match(result.stderr, /Error: Task not found/);
        }
    } finally {
        removeDirectory(directory);
    }
});

test('CLI rejects unsupported list options', () => {
    const directory = createCliDirectory('[]');

    try {
        const result = runCli(directory, 'list', 'later');

        assert.equal(result.status, 1);
        assert.match(result.stderr, /Error: Invalid list option/);
    } finally {
        removeDirectory(directory);
    }
});

test('CLI handles malformed, wrongly structured, and duplicate task data gracefully', () => {
    const validTask = {
        id: 1,
        description: 'Valid task',
        status: 'todo',
        createdAt: '2026-09-11T10:00:00.000Z',
        updatedAt: '2026-09-11T10:00:00.000Z'
    };
    const invalidTaskData = [
        'not JSON',
        '{}',
        'false',
        JSON.stringify([{ ...validTask, id: 0 }]),
        JSON.stringify([{ ...validTask, description: '   ' }]),
        JSON.stringify([{ ...validTask, status: 'waiting' }]),
        JSON.stringify([{ ...validTask, createdAt: 'not a date' }]),
        JSON.stringify([{ ...validTask, updatedAt: 'not a date' }]),
        JSON.stringify([validTask, { ...validTask, description: 'Duplicate ID' }])
    ];

    for (const invalidData of invalidTaskData) {
        const directory = createCliDirectory(invalidData);

        try {
            const result = runCli(directory, 'list');

            assert.equal(result.status, 1, invalidData);
            assert.match(result.stderr, /Error: data\.json is corrupted or inaccessible/);
        } finally {
            removeDirectory(directory);
        }
    }
});
