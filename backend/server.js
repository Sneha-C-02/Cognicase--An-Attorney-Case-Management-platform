import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

// Routes
import caseRoutes from './src/routes/caseRoutes.js';
import clientRoutes from './src/routes/clientRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';
import noteRoutes from './src/routes/noteRoutes.js';
import activityRoutes from './src/routes/activityRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import invoiceRoutes from './src/routes/invoiceRoutes.js';

dotenv.config();

// Connect database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});


// API Routes
app.use('/api/cases', caseRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health route
app.get("/", (req, res) => {
  res.send("Attorney Case Management API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});