import fs from 'fs';
import path from 'path';

const logFile = path.join('logs', 'server.log');

export const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(logFile, logMessage);
    console.log(logMessage);
};
