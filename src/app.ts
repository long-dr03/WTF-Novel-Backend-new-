import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import routes from './routes';
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: ["http://localhost:3000", "https://wtf-novel.vercel.app"],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

import path from 'path';

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory with proper MIME types
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {
        // Set proper MIME types for audio files
        if (filePath.endsWith('.mp3')) {
            res.setHeader('Content-Type', 'audio/mpeg');
        } else if (filePath.endsWith('.wav')) {
            res.setHeader('Content-Type', 'audio/wav');
        } else if (filePath.endsWith('.ogg')) {
            res.setHeader('Content-Type', 'audio/ogg');
        }
        // Enable range requests for audio streaming
        res.setHeader('Accept-Ranges', 'bytes');
    }
}));

// Routes
app.use('/', routes);

export default app;
