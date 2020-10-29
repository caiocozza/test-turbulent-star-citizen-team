import http from 'http';
import { Logger } from './modules/logger';
import { ServerManager } from './modules/manager';
import { SocketServer } from './modules/server';
import { Storage } from './modules/storage';
import { createClient } from 'redis';
import { config } from 'dotenv';
import { EventService } from './modules/event';

config();

const REDIS_URL = process.env.REDIS_URL;
const PORT = process.env.PORT;

if (!REDIS_URL) {
    console.error('MISSING REDIS_URL!');
    process.exit(1);
}

const httpServer = http.createServer();

const logger = new Logger();
const server = new SocketServer(logger, { server: httpServer });
const storage = new Storage(createClient(process.env.REDIS_URL), logger);
const events = new EventService(storage, logger);

export const manager = new ServerManager(server, events, logger);

events
    .sync()
    .then(() => {
        httpServer.listen(Number(PORT), () => logger.info(`Server listenning at ${PORT}`));
        manager.enable();
    })
    .catch(error => console.error(error));