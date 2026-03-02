import express from 'express';
import dotenv from "dotenv/config";
import cors from 'cors';
import connectDB from './configs/mongodb.js';

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from the backend');
})


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));