# NTI

A minimal full-stack **task manager** used to bootstrap and demonstrate the
Cloud Agent development environment for this repository.

## Stack

- **Backend:** Node.js + [Express](https://expressjs.com/) REST API
- **Frontend:** static HTML/CSS/JS served by Express
- **Persistence:** JSON file store at `data/tasks.json`

## Getting started

```bash
npm install        # install dependencies
npm start          # run the server on http://localhost:3000
npm test           # run the automated test suite
```

The dev server listens on `PORT` (default `3000`) and `HOST` (default `0.0.0.0`).

## API

| Method | Path              | Description            |
| ------ | ----------------- | ---------------------- |
| GET    | `/api/health`     | Health check           |
| GET    | `/api/tasks`      | List all tasks         |
| POST   | `/api/tasks`      | Create a task          |
| PATCH  | `/api/tasks/:id`  | Toggle done / retitle  |
| DELETE | `/api/tasks/:id`  | Delete a task          |

## Cloud Agent environment

The environment is defined in [`.cursor/environment.json`](.cursor/environment.json):

- `install`: `npm install`
- `terminals`: runs `npm start` (the dev server) in a persistent terminal
- `ports`: exposes `3000`
