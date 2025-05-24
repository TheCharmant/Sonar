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
   npm run dev:open
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

## Deployment

### Deployment Options

You can deploy this full-stack application using various cloud providers:

#### Option 1: Render.com (Recommended for simplicity)

1. **Server (Backend) Deployment**:
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Set the root directory to `server`
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add all environment variables from your `.env` file
   - Deploy

2. **Client (Frontend) Deployment**:
   - Create a new Static Site on Render
   - Connect your GitHub repository
   - Set the root directory to `client`
   - Set build command: `npm install && npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`
   - Deploy

3. **Admin Panel Deployment**:
   - Create a new Static Site on Render
   - Connect your GitHub repository
   - Set the root directory to `admin`
   - Set build command: `npm install && npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_BACKEND_URL=https://your-backend-url.onrender.com`
   - Deploy

#### Option 2: Vercel + Railway

1. **Server (Backend) Deployment on Railway**:
   - Create a new project on Railway
   - Connect your GitHub repository
   - Set the root directory to `server`
   - Add all environment variables from your `.env` file
   - Deploy

2. **Client & Admin Deployment on Vercel**:
   - Create two new projects on Vercel
   - Connect your GitHub repository for each
   - For client: Set the root directory to `client`
   - For admin: Set the root directory to `admin`
   - Add appropriate environment variables
   - Deploy

#### Option 3: AWS Deployment

1. **Server Deployment on AWS Elastic Beanstalk**:
   - Create a new application in Elastic Beanstalk
   - Choose Node.js platform
   - Upload a zip of your server directory
   - Configure environment variables
   - Deploy

2. **Client & Admin Deployment on AWS S3 + CloudFront**:
   - Build your client and admin applications
   - Create two S3 buckets
   - Upload the build files to respective buckets
   - Set up CloudFront distributions for each bucket
   - Configure environment variables

### Preparing for Production

Before deploying, make these changes:

1. **Update CORS settings in server/src/app.js**:
   ```javascript
   // Update allowed origins to include your production URLs
   const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
   ```

2. **Update API URLs in client and admin .env files**:
   ```
   # For client/.env.production
   VITE_API_URL=https://your-production-api-url.com/api
   
   # For admin/.env.production
   VITE_BACKEND_URL=https://your-production-api-url.com
   ```

3. **Set up production environment variables**:
   - Create `.env.production` files for each application
   - Never commit these files to version control

### Continuous Deployment

For automated deployments:

1. **GitHub Actions**:
   - Create `.github/workflows/deploy.yml` in your repository
   - Configure separate jobs for server, client, and admin
   - Set up environment secrets in GitHub repository settings

2. **Example GitHub Actions workflow**:
   ```yaml
   name: Deploy
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy-server:
       runs-on: ubuntu-latest
       steps:
         # Server deployment steps
         
     deploy-client:
       runs-on: ubuntu-latest
       steps:
         # Client deployment steps
         
     deploy-admin:
       runs-on: ubuntu-latest
       steps:
         # Admin deployment steps
   ```

### Domain Configuration

1. **Custom Domain Setup**:
   - Purchase a domain (e.g., from Namecheap, GoDaddy, etc.)
   - Configure DNS settings:
     - Point main domain to client application
     - Create subdomain for admin (e.g., admin.yourdomain.com)
     - Create subdomain for API (e.g., api.yourdomain.com)
   
2. **SSL Certificates**:
   - Set up SSL certificates for all domains/subdomains
   - Most platforms (Render, Vercel, etc.) provide this automatically
   - For AWS, use AWS Certificate Manager

### Post-Deployment Checklist

- [ ] Test all application features in production environment
- [ ] Verify all API endpoints are working correctly
- [ ] Check authentication flows
- [ ] Ensure proper error handling
- [ ] Monitor application performance
- [ ] Set up logging and analytics
- [ ] Configure backup strategies for databases

