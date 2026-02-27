# Attorney Case Management SaaS

A production-style legal tech dashboard built with the MERN stack.

## Core Features
- **Case Management**: Centralized hub for managing legal cases.
- **Client Tracking**: Integrated client records linked to cases.
- **Productive Dashboard**: Real-time analytics with Recharts.
- **Activity Timeline**: Automated logging of all case-related actions.
- **Task & Document Management**: Keep track of deadlines and files per case.

## Architecture
- **Backend**: Node.js, Express, MongoDB/Mongoose.
- **Frontend**: React (Vite), React Router, Lucide-React, Recharts.
- **Styling**: Vanilla CSS (SaaS Industry standard).

## Installation & Setup

### 1. Prerequisites
- Node.js installed on your system.
- MongoDB instance running (optional, defaults to `localhost:27017`).

### 2. Backend Setup
1. Navigate to the `backend` folder.
2. Ensure you have a `.env` file with `MONGO_URI`.
3. Run: `npm install`
4. Start the server: `npm run dev`

### 3. Frontend Setup
1. Navigate to the `frontend` folder.
2. Run: `npm install`
3. Start the dashboard: `npm run dev`

### 4. Direct Access
Once both are running, access the dashboard at: `http://localhost:5173`

## Portfolio-Level Qualities
- **Modular Code**: Controllers, models, and routes separated.
- **Clean UI**: Modern typography, spacing, and interactive hover effects.
- **Scalable Schema**: Relationships between Cases, Clients, and Activities.
