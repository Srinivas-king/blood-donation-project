import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bloodRoutes from '../routes/blood.routes';
import path from 'path';

import { initializeDatabase } from '../db/db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// 1. Data ni accept cheyyadaniki (JSON & URL Encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. MOST IMPORTANT: "public" folder ni server ki connect chestunnam.
// Ee line valle http://localhost:3000/admin.html pani chestundi.
app.use(express.static(path.join(__dirname, '../../public')));

// 3. API Routes
app.use('/api', bloodRoutes);

// Server Start
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server started on port ${PORT}`);
            console.log(`👉 Open http://localhost:${PORT}/index.html in browser`);
        });
    })
    .catch((err) => {
        console.error('❌ Critical: Failed to initialize database. Server cannot start.', err);
        process.exit(1);
    });