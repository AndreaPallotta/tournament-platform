import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import helmet from 'helmet';
import * as hpp from 'hpp';
import * as path from 'path';
// import apiCacher from './middleware/apicacher';
import errorHandler, { CORSError } from './middleware/errorHandler';
import contentHeader from './middleware/headers';
import logger, { morganMid, setArchiveListener } from './middleware/logger';
import monitor from './middleware/loopMonitor';
import limiter from './middleware/ratelimiter';
import apiRouter from './routes/api/api.route';
import { DEV, PROD } from './utils/env.config';

// Whitelisted ips
const whitelist: string[] = ['https://www.aardvarktournament.com'];

// Setup express app
const app = express();
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(contentHeader);
app.disable('x-powered-by');
app.use(
    compression({
        // Compress only if the headers does not contain `x-no-compression`
        filter: (req, res) => {
            return (
                !req.headers['x-no-compression'] || compression.filter(req, res)
            );
        },
        // byte threshold for the response body size
        threshold: 0,
    })
);
app.use(limiter); // apply rate limiter
app.use(morganMid); // use Morgan to log HTTP requests
app.use(helmet()); // secure app by setting various HTTP headers
app.use(monitor); // monitor event loop to prevent DDoS
app.use(hpp()); // prevents HTTP Parameter Pollution

app.get('/api/health',
    cors({
        origin: '*', optionsSuccessStatus: 200
    }),
    (req, res) => {
        try {
            res.status(200).send({
                uptime: Number(process.uptime().toFixed(2)),
                message: 'OK',
                date: new Date(),
            });
        } catch (err) {
            return res.status(500).send('Health check failed');
        }
    });

app.use(cors({
    origin: (origin: string | undefined, callback) => {
        if (DEV || (origin && whitelist.includes(origin))) {
            return callback(null, true);
        }

        logger.error(`Access from ${origin || 'N/A'} not allowed by CORS`);
        return callback(new CORSError(`Access from ${origin || 'N/A'} not allowed by CORS`));
    },
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// if (PROD) {
//     app.use(apiCacher); // cache responses. Breaks authentication
// }

app.use(errorHandler);

// Setup archiving logs once they are outdated
logger.on('archived', setArchiveListener);

// middleware for /api path routes
app.use('/api', apiRouter);

export default app;
