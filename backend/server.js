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

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task-assignments', taskAssignmentRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/materials', materialRoutes);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));