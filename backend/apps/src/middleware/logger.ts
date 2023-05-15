import * as archiver from 'archiver';
import * as fs from 'fs';
import * as morgan from 'morgan';
import * as path from 'path';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { PROD, TEST } from '../utils/env.config';

// Specify different types of output.
// Different log types are displayed in the console and appended to a file.
const transports = [
    new winston.transports.Console(),
    new DailyRotateFile({
        filename: path.join(
            path.dirname(__dirname),
            'logs',
            'error-%DATE%.log'
        ),
        datePattern: 'YYYY-MM-DD-WW',
        zippedArchive: true,
        maxSize: '20m',
        level: 'error',
    }),
    new DailyRotateFile({
        filename: path.join(
            path.dirname(__dirname),
            'logs',
            'info-warn-%DATE%.log'
        ),
        datePattern: 'YYYY-MM-DD-WW',
        zippedArchive: true,
        maxSize: '20m',
        level: 'warn',
    }),
    new DailyRotateFile({
        filename: path.join(
            path.dirname(__dirname),
            'logs',
            'info-warn-%DATE%.log'
        ),
        datePattern: 'YYYY-MM-DD-WW',
        zippedArchive: true,
        maxSize: '20m',
        level: 'info',
    }),
    new DailyRotateFile({
        filename: path.join(path.dirname(__dirname), 'logs', 'http-%DATE%.log'),
        datePattern: 'YYYY-MM-DD-WW',
        zippedArchive: true,
        maxSize: '20m',
        level: 'http',
    }),
    new DailyRotateFile({
        filename: path.join(
            path.dirname(__dirname),
            'logs',
            'debug-%DATE%.log'
        ),
        datePattern: 'YYYY-MM-DD-WW',
        zippedArchive: true,
        maxSize: '20m',
        level: 'debug',
    }),
];

// create logger
const logger = winston.createLogger({
    level: PROD ? 'debug' : 'info',
    silent: TEST,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(
            (info) => `${info.timestamp} - ${info.level}: ${info.message}`
        )
    ),
    transports,
});

// logger listener to archive log files
export const setArchiveListener = (base: string, name: string) => {
    const archive = archiver('zip', {
        zlib: { level: 9 },
    });

    const output = fs.createWriteStream(path.join(base, `${name}.zip`));

    output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
        console.log(
            'archiver has been finalized and the output file descriptor has been closed'
        );
    });

    output.on('end', () => {
        console.log('Data has been drained');
    });

    archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
            console.log(`Warning while archiving logs: ${err}`);
        } else {
            throw err;
        }
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(`${base}/${name}`, false);

    archive.finalize();
};

// Morgan implementation
export const morganMid = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
        stream: {
            write: (message) => logger.http(message),
        },
        skip: (_, res) => {
            return !PROD || res.statusCode < 400;
        },
    }
);

export default logger;
