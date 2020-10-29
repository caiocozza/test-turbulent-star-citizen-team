import WebSocket from 'ws';
import { EventService } from './event';
import { Logger } from './logger';
import { SocketServer } from './server';
import { MessageData } from '../types';

export class ServerManager {
    constructor(
        private readonly server: SocketServer,
        public readonly eventService: EventService,
        private readonly logger: Logger) {}

    private handleConnection(manager: ServerManager, connection: WebSocket) {
        this.logger.info('New client');

        connection.on('message', (data: WebSocket.Data) => {
            const parsed = JSON.parse(data.toString()) as MessageData;

            if (!parsed.name || !parsed.type) {
                connection.send('Bad package received.');
                return;
            }

            manager.eventService.handle(this.server, connection, parsed);
        });
        connection.on('close', (code, reason) => this.logger.info(`Client offline - code ${code} ${reason}`));
    }

    public enable() {
        this.server.on('connection', (connection) => this.handleConnection(this, connection));
    }

    public close() {
        this.server.close();
    }
}

