# Client Application

This is the frontend client application built with React, TypeScript, and Vite.

## Setup

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root of the client directory with the following variables:

```
# API Configuration
VITE_BACKEND_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

## Development

Start the development server:

```
npm run dev
```

## Build

Create a production build:

```
npm run build
```

## Preview

Preview the production build locally:

```
npm run preview
```

## Scripts

The following scripts are available:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server with hot-reload |
| `npm run build` | Create a production-ready build |
| `npm run lint` | Run ESLint to check code quality |
| `npm run preview` | Preview the production build locally |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BACKEND_URL` | URL of the backend server | Yes |
| `VITE_API_URL` | URL of the API endpoints | Yes |

Note: You must restart the development server after changing environment variables.


