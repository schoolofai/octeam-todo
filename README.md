# octeam-todo

A simple Todo application built with Express and TypeScript.

## Features

- RESTful API for managing todos
- TypeScript for type safety
- Jest for testing

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## Testing

```bash
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/todos` | List all todos |
| GET | `/todos/:id` | Get a todo |
| POST | `/todos` | Create a todo |
| PUT | `/todos/:id` | Update a todo |
| DELETE | `/todos/:id` | Delete a todo |

## License

MIT
