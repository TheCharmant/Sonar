# Full-Stack Application

This is a full-stack application consisting of three main components:
- Server (Backend API)
- Client (Frontend Web Application)
- Admin Panel (Administration Interface)

## Project Structure

```
project-root/
├── server/       # Backend API built with Node.js and Express
├── client/       # Frontend application built with React and Vite
└── admin/        # Admin panel built with React and Firebase
```

## Prerequisites

Before setting up the project, you'll need:

- Node.js (v16 or later)
- npm (v7 or later)
- Firebase account
- Google Cloud Platform account
- Resend account (for email services)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/TheCharmant/Sonar.git
cd Sonar
```

### 2. Set Up External Services

#### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Set up Firebase Authentication
   - Enable Email/Password authentication
   - Set up any OAuth providers you need (Google, etc.)
4. Create a Firestore database
5. Generate a new private key for your service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
   - Convert the JSON to base64 (you'll need this for the server .env file):
     ```bash
     cat your-service-account.json | base64
     ```

#### Google Cloud Platform Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your Firebase project
3. Enable the APIs you need (e.g., Google Drive API, Google Sheets API)
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Create OAuth client ID
   - Set the authorized redirect URIs (e.g., http://localhost:5000/api/auth/callback)
   - Note down the Client ID and Client Secret

#### Resend Setup

1. Create an account at [Resend](https://resend.com/)
2. Create an API key
3. Note down the API key for your server .env file

### 3. Set Up the Server

```bash
cd server
npm install
```

Create a `.env` file in the server directory with the following variables:

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

Create the initial admin user:

```bash
npm run create-admin
```

Start the server:

```bash
npm run dev
```

### 4. Set Up the Client

```bash
cd ../client
npm install
```

Create a `.env` file in the client directory:

```
# API Configuration
VITE_BACKEND_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

Start the client:

```bash
npm run dev
```

### 5. Set Up the Admin Panel

```bash
cd ../admin
npm install
```

Create a `.env` file in the admin directory:

```
VITE_BACKEND_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Start the admin panel:

```bash
npm run dev
```

## Accessing the Applications

- Server API: http://localhost:5000
- Client Application: http://localhost:5173
- Admin Panel: http://localhost:5174

## Development Workflow

1. Make changes to the code
2. Test your changes locally
   ```bash
   # Run all applications (server, client, admin) concurrently
   cd server
   npm run dev:all
   ```
3. Build the applications for production:
   ```bash
   # In each directory (server, client, admin)
   npm run build
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the `ALLOWED_ORIGINS` in the server .env file includes all frontend URLs.
2. **Authentication Errors**: Verify your Firebase and Google OAuth credentials.
3. **Email Sending Failures**: Check your Resend API key and configuration.

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud Platform Documentation](https://cloud.google.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)

