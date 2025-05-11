# Chillar Club - Subscription-Based Rewards Platform

A dynamic subscription-based reward platform that provides an intelligent and engaging user experience through advanced real-time data synchronization.

## Project Overview

Chillar Club is a full-stack web application that allows users to:
- Subscribe to membership plans via Razorpay payment gateway
- Participate in daily reward draws
- Claim prizes through an easy-to-use interface
- Track their subscription status
- Manage their profile and preferences

## Technology Stack

- **Frontend**: React, TailwindCSS, Shadcn/UI
- **Backend**: Express.js
- **Database**: PostgreSQL and Firebase Firestore (dual-storage architecture)
- **Authentication**: Firebase Authentication
- **Payment Processing**: Razorpay

## Documentation

- [Database Schema](SCHEMA.md) - Detailed database schema information
- [Deployment Guide](DEPLOY.md) - Instructions for deploying the application

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Firebase account
- Razorpay account (for payment processing)

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/your-username/chillar-club.git
cd chillar-club
```

2. **Run the setup script**

This will install dependencies and set up the initial configuration:

```bash
./setup.sh
```

3. **Configure Firebase**

a. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
b. Add a web app to your Firebase project
c. Enable Authentication with Email/Password and Google sign-in methods
d. Create a Firestore database in your preferred region
e. Add your development/local domain to the Authorized Domains list in Authentication settings
f. Copy the Firebase configuration values to your `.env` file:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. **Configure Razorpay (optional for development)**

a. Create a [Razorpay account](https://dashboard.razorpay.com/signup)
b. Get your API Key ID and Secret Key from the Razorpay Dashboard
c. Add them to your `.env` file:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Note: For development, you can skip the Razorpay setup as the app will use a mock implementation.

5. **Initialize the database**

```bash
npm run db:push
```

6. **Start the development server**

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Development Mode

For easier development without real payment processing, the app includes a development mode with:

- Mock Razorpay implementation for testing payment flows
- Automatic payment verification
- Enhanced logging

To run the application in development mode, ensure `NODE_ENV=development` is set in your `.env` file.

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express server
- `/shared` - Shared types and schemas
- `/scripts` - Utility scripts for database operations

## Key Features

- **Dual-Storage Architecture**: Uses Firebase Firestore as primary storage with PostgreSQL as fallback
- **Real-time Data Synchronization**: Automatically syncs data between databases
- **Comprehensive Legal Framework**: Includes Terms & Conditions, Privacy Policy, Refund Policy, and Legal Disclaimer
- **Administrative Dashboard**: For managing users, subscriptions, and rewards
- **User Authentication**: Secure login with Firebase Authentication
- **Payment Processing**: Integrated with Razorpay for subscription management

## License

[MIT](LICENSE)