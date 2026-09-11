const { 
    createTask,
    deleteTask,
    listDone,
    listInProgress,
    listAll,
    listTodo,
    updateTask,
    markTaskDone,
    markTaskInProgress,
    viewTask,
    error
} = require('./tasks');

const args = process.argv.slice(2);

if (args.length === 0) {
    error('No arguments provided. Please provide at least one argument.');
}

if (args[0] === ('create')) {
    const description = args.slice(1).join(' ');
    if (!description || description.trim() === '') {
        error('No task description provided. Please provide a description for the task.');
    }
    createTask(description);
} else if (args[0] === ('delete')) { 
    const id = Number(args[1]);
    if (!Number.isInteger(id) || id <= 0) {
        error('Invalid task ID. Please provide a valid number for the task ID.');
    }
    deleteTask(id);
} else if (args[0] === ('list')) { 
    const description = args[1];
    if (description === 'done') { 
        listDone();
    } else if (description === 'in-progress') {
        listInProgress();
    } else if (description === 'todo') {
        listTodo();
    } else if (description === undefined || description === 'all') { 
        listAll();
    } else {
        error('Invalid list option. Please specify a valid option.');
    }
} else if (args[0] === ('update')) {
    const id = Number(args[1]);
    if (!Number.isInteger(id) || id <= 0) {
        error('Invalid task ID. Please provide a valid number for the task ID.');
    }
    const description = args.slice(2).join(' ');
    if (!description || description.trim() === '') {
        error('No updated task description provided. Please provide a description for the task.');
    }
    updateTask(id, description);
} else if (args[0] === ('mark-done')) {
    const id = Number(args[1]);
    if (!Number.isInteger(id) || id <= 0) {
        error('Invalid task ID. Please provide a valid number for the task ID.');
    }
    markTaskDone(id);
} else if (args[0] === ('mark-in-progress')) {
    const id = Number(args[1]);
    if (!Number.isInteger(id) || id <= 0) {
        error('Invalid task ID. Please provide a valid number for the task ID.');
    }
    markTaskInProgress(id);
} else if(args[0] === ('view')) {
    const id = Number(args[1]);
    if (!Number.isInteger(id) || id <= 0) {
        error('Invalid task ID. Please provide a valid number for the task ID.');
    }
    viewTask(id);
} else if (args[0] === ('help')) {
    console.log('Usage: node app.js <command> [options]');
    console.log('Commands:');
    console.log('  create <description>         Create a new task');
    console.log('  delete <id>                  Delete a task');
    console.log('  list [option]                List tasks (done, todo, in-progress, or all)');
    console.log('  update <id> <description>    Update a task');
    console.log('  mark-done <id>               Mark a task as done');
    console.log('  mark-in-progress <id>        Mark a task as in-progress');
    console.log('  view <id>                    View a task');
    console.log('  help                         Show this help message');
} else {
    error('Invalid command. Please use "help" if you need assistance.');
}