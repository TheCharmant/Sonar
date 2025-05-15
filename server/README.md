# Server Application

This is the backend server application built with Node.js and Express.

## Setup

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root of the server directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_jwt_secret_key
CLIENT_ID=your_oauth_client_id
CLIENT_SECRET=your_oauth_client_secret
REDIRECT_URI=http://localhost:5000/api/auth/callback

# Firebase
FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_firebase_service_account_json

# Frontend URLs
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Admin credentials for initial setup
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=Admin123!
```

5. Create the initial admin user:
   ```
   npm run create-admin
   ```

## Development

Start the development server:

```
npm run dev
```

## Production

Start the production server:

```
npm start
```

## Scripts

The following scripts are available:

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start the development server with hot-reload |
| `npm run create-admin` | Create an admin user using credentials from .env file |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Port on which the server runs | Yes |
| `NODE_ENV` | Environment (development, production) | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | Yes |
| `CLIENT_ID` | OAuth client ID for authentication | Yes |
| `CLIENT_SECRET` | OAuth client secret for authentication | Yes |
| `REDIRECT_URI` | OAuth redirect URI | Yes |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64 encoded Firebase service account JSON | Yes |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | Yes |
| `RESEND_API_KEY` | API key for Resend email service | Yes |
| `ADMIN_EMAIL` | Email for the initial admin user | Yes |
| `ADMIN_PASSWORD` | Password for the initial admin user | Yes |

Note: The application uses dotenv to load environment variables from the `.env` file.
