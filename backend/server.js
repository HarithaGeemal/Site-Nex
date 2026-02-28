import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from the backend');
})


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));