# Task Tracker CLI

A small command-line task tracker built with Node.js. Tasks are stored locally in `data.json` in the directory where you run the command.

Project reference: [Roadmap.sh Task Tracker](https://roadmap.sh/projects/task-tracker)

## Requirements
just Node.js (no external packages are required)

## Usage

Run commands from the project directory:

```bash
node app.js <command> [arguments]
```

### Create a task

```bash
node app.js create "Finish the report"
```

New tasks start with the `todo` status.

### Update a task

```bash
node app.js update 1 "Finish the monthly report"
```

### Delete a task

```bash
node app.js delete 1
```

### Mark a task as in progress

```bash
node app.js mark-in-progress 1
```

### Mark a task as done

```bash
node app.js mark-done 1
```

### View one task

```bash
node app.js view 1
```

### List tasks

```bash
node app.js list
node app.js list all
node app.js list todo
node app.js list in-progress
node app.js list done
```

### Show help

```bash
node app.js help
```

## Task data

Each task has an ID, description, status, and timestamps:

```json
{
  "id": 1,
  "description": "Finish the report",
  "status": "todo",
  "createdAt": "2026-09-11T10:00:00.000Z",
  "updatedAt": "2026-09-11T10:00:00.000Z"
}
```

The application creates `data.json` automatically with an empty array when it is not already present.

## Validation and errors

The CLI reports an error when:

- A description is missing or contains only spaces
- A task ID is missing, not a number, not a whole number, or not positive
- A requested task does not exist
- A list option is unsupported
- `data.json` is invalid, has an incorrect structure, contains invalid task fields, or has duplicate task IDs

Valid task statuses are `todo`, `in-progress`, and `done`.

## Tests

Run the test suite with:

```bash
node --test
```
