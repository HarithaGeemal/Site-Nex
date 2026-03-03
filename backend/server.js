import express from 'express';
import dotenv from "dotenv/config";
import cors from 'cors';
import connectDB from './configs/mongodb.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import taskAssignmentRoutes from './routes/taskAssignmentRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import materialRoutes from './routes/materialRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// ----------------------------------------
// API Routes (Strict REST Nested Structure)
// ----------------------------------------

// Global User endpoints
app.use('/api/users', express.json(), userRoutes);

// Core Project Base endpoints
app.use('/api/projects', express.json(), projectRoutes);

// Nested Resource Routing
// e.g. /api/projects/:projectId/tasks
app.use('/api/projects/:projectId/tasks', express.json(), taskRoutes);
app.use('/api/projects/:projectId/members', express.json(), projectRoutes); // Handled inside projectRoutes potentially
app.use('/api/projects/:projectId/issues', express.json(), issueRoutes);
app.use('/api/projects/:projectId/materials', express.json(), materialRoutes);

// Legacy flat routes (Kept temporarily to avoid breaking frontend immediately during transition)
app.use('/api/tasks', express.json(), taskRoutes);
app.use('/api/task-assignments', express.json(), taskAssignmentRoutes);
app.use('/api/issues', express.json(), issueRoutes);
app.use('/api/materials', express.json(), materialRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        method: req.method,
        path: req.originalUrl
    });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));