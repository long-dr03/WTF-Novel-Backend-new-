import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import routes from './routes';
import path from 'path';

const cors = require('cors');
const app = express();

const corsOptions = {
    origin: ["http://localhost:3000", "https://wtf-novel.vercel.app", process.env.FRONTEND_URL],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mp3')) {
            res.setHeader('Content-Type', 'audio/mpeg');
        } else if (filePath.endsWith('.wav')) {
            res.setHeader('Content-Type', 'audio/wav');
        } else if (filePath.endsWith('.ogg')) {
            res.setHeader('Content-Type', 'audio/ogg');
        }
        res.setHeader('Accept-Ranges', 'bytes');
    }
}));

app.use('/', routes);

export default app;
