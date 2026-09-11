const { 
    createTask,
    deleteTask,
    listDone,
    listInProgress,
    listAll,
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
    const message = args.slice(1).join(' ');
    createTask(message);
} else if (args[0] === ('delete')) { 
    const id = Number(args[1]);
    deleteTask(id);
} else if (args[0] === ('list')) { 
    const description = args[1];
    if (description === 'done') { 
        listDone();
    } else if (description === 'in-progress') {
        listInProgress();
    } else if (description === undefined || description === 'all') { 
        listAll();
    } else {
        error('Invalid list option. Please specify a valid option.');
    }
} else if (args[0] === ('update')) {
    const id = Number(args[1]);
    const description = args.slice(2).join(' ');
    updateTask(id, description);
} else if (args[0] === ('mark-done')) {
    const id = Number(args[1]);
    markTaskDone(id);
} else if (args[0] === ('mark-in-progress')) {
    const id = Number(args[1]);
    markTaskInProgress(id);
} else if(args[0] === ('view')) {
    const id = Number(args[1]);
    viewTask(id);
} else if (args[0] === ('help')) {
    console.log('Usage: node app.js <command> [options]');
    console.log('Commands:');
    console.log('  create <task>            Create a new task');
    console.log('  delete <task>            Delete a task');
    console.log('  list [option]            List tasks (done, todo, in-progress, or all)');
    console.log('  update <task>            Update a task');
    console.log('  mark-done <task>         Mark a task as done');
    console.log('  mark-in-progress <task>  Mark a task as in-progress');
    console.log('  view <task>              View a task');
    console.log('  help                     Show this help message');
} else {
    error('Invalid command. Please use "help" if you need assistance.');
}