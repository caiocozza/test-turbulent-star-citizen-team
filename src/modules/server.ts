import WebSocket, { Server } from "ws";
import { Logger } from "./logger";

export class SocketServer extends Server {
    constructor(
        private readonly logger: Logger,
        options?: WebSocket.ServerOptions) {
        super(options);
    }

    public async broadcast<T>(data: T) {
        this.logger.info(`broadcasting data of type ${typeof data}.`);

        this.clients.forEach(client => {
            client.send(data, error => this.logger.error(error.message));
        });  
    }
}