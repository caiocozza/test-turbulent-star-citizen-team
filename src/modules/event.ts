import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { MessageData, MessageDataRegister, MessageDataBroadcast, MessageType } from "../types";
import { Storage } from './storage';
import { Logger } from './logger';
import { SocketServer } from './server';
import { config } from 'dotenv';

config();

export class EventService {
    private timeouts: { [name:string]: NodeJS.Timeout } = {};
    private events: { [name:string]: EventEmitter } = {};

    constructor(
        private readonly storage: Storage,
        private readonly logger: Logger) {}

    public get timeoutsObj() {
        return this.timeouts;
    }

    public get eventsObj() {
        return this.events;
    }

    public async sync() {
        if (process.env?.environment === 'test') {
            return;
        }
        
        const rawData = await this.storage.fetch();
        rawData.forEach(data => {
            const parsed = JSON.parse(data) as MessageDataRegister;

            if (!parsed.name || !parsed.time || !parsed.type) {
                this.logger.warning(`Could not parse persisted event - ${data}`);
                return;
            }

            this.register(parsed);
        });
    }

    private listen(client: WebSocket, data: MessageData) {
        const found = this.events[data.name];

        if (!found) {
            client.send('Event not found.');
            return;
        }

        // creates the listener to send data to client.
        found.on(`/${data.name}/time-reached`, (data: string) => client.send(data));
    }

    private register(data: MessageDataRegister) {
        this.events[data.name] = new EventEmitter();
        this.storage.save(data.name, data);

        // This timeout can be canceled by the user since its in timeouts.
        const scheduled = setTimeout(() => {
            this.events[data.name].emit(`/${data.name}/time-reached`, `The event ${data.name} has reached the time ${data.time}.`);
            this.storage.remove(data.name);
        }, new Date(data.time).getTime() - new Date().getTime());

        this.timeouts[data.name] = scheduled;
    }

    private create(client: WebSocket, data: MessageDataRegister) {
        // Check if this event is alive.
        if (this.events[data.name] || this.timeouts[data.name]) {
            client.send('Event name already in use.');
            return;
        }

        // Check time to schedule if its valid.
        if (data.time <= new Date()) {
            client.send('time should not be past.')
            return;
        }

        this.register(data);

        // When creating an event, you are automatically listening to it.
        this.listen(client, data);
    }

    private delete(client: WebSocket, data: MessageData) {
        const foundTimeout = this.timeouts[data.name];
        const foundEvent = this.events[data.name];

        if (foundTimeout) {
            clearTimeout(foundTimeout);
            delete this.timeouts[data.name];
        }

        if (foundEvent) {
            foundEvent.removeAllListeners(`/${data.name}/time-reached`);
            delete this.events[data.name];
        }

        client.send(`Event ${data.name} removed and all listeners removed.`);
    }

    public handle(server: SocketServer, client: WebSocket, data: MessageData) {
        switch(data.type) {
            case MessageType.create:
                if (!(data as MessageDataRegister).time) {
                    client.send('Property time is required when type is create');
                    break;
                }

                this.create(client, data as MessageDataRegister);
                break;
            
            case MessageType.delete:
                this.delete(client, data);
                break;
            
            case MessageType.listen:
                this.listen(client, data);
                break;

            case MessageType.broadcast:
                if (!(data as MessageDataBroadcast).message) {
                    client.send('Property message is required when type is broadcast');
                    break;
                }
                server.broadcast((data as MessageDataBroadcast).message);
                break;

            default: 
                client.send('Type of the package is not recognized by the server');
                break;
        }
    }
}