# Deployment Guide

This document provides instructions for deploying the Chillar Club application to various environments.

## Prerequisites

- Node.js v16 or higher
- PostgreSQL database
- Firebase account with Authentication and Firestore enabled
- Razorpay account (for payment processing)

## Deployment Options

### Option 1: Manual Deployment

1. **Clone the repository**

```bash
git clone https://github.com/your-username/chillar-club.git
cd chillar-club
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file based on `.env.example` and fill in your credentials:

```
# Database Configuration
DATABASE_URL=postgres://username:password@hostname:port/database_name

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Server Configuration
PORT=3000
NODE_ENV=production

# Storage Configuration
USE_FIREBASE_AS_PRIMARY=true
```

4. **Set up the database**

```bash
node scripts/db-setup.js
```

5. **Build the application**

```bash
npm run build
```

6. **Start the server**

```bash
npm start
```

### Option 2: Docker Deployment

1. **Create a Docker image**

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build and run the Docker image**

```bash
docker build -t chillar-club .
docker run -p 3000:3000 --env-file .env chillar-club
```

### Option 3: Vercel Deployment

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy to Vercel**

```bash
vercel
```

Follow the prompts to configure your deployment.

## Production Considerations

### Database

For production, use a managed database service like:
- AWS RDS for PostgreSQL
- Google Cloud SQL
- Supabase
- Neon

### Firebase Configuration

1. Ensure your production domain is added to the authorized domains list in Firebase Console.
2. Set up appropriate security rules for Firestore.

### Environment Variables

Ensure all necessary environment variables are set in your production environment.

### Monitoring and Logging

Consider setting up:
- Application monitoring (e.g., Sentry, New Relic)
- Log management (e.g., Logtail, Logz.io)

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues, check:
- Database credentials in `.env`
- Network connectivity and firewall settings
- PostgreSQL server status

### Firebase Authentication Problems

If Firebase authentication is not working:
- Verify the Firebase API keys
- Ensure the domain is added to authorized domains in Firebase Console
- Check browser console for errors

### Payment Processing Failures

If Razorpay payments are failing:
- Verify Razorpay API keys
- Check webhook configurations
- Test with Razorpay test mode first