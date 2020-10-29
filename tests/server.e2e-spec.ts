import { MessageData, MessageDataRegister, MessageType } from '../src/types';
import WebSocket from 'ws';
import { manager } from '../src/app';


describe('E2E Testing', () => {

    beforeAll(() => {
        jest.setTimeout(10000);
    });

    it('Should connect and register a new event', (done) => {
        const client = new WebSocket('http://localhost:3000');
        const register: MessageDataRegister = {
            type: MessageType.create,
            name: 'testing_0',
            time: new Date(new Date().setMinutes(5))
        };

        setTimeout(() => client.send(JSON.stringify(register)), 150);

        setTimeout(() => {
            expect(Object.keys(manager.eventService.eventsObj).length).toBeGreaterThan(0);
            expect(Object.keys(manager.eventService.timeoutsObj).length).toBeGreaterThan(0);
            client.close();
            done();
        }, 1000);
    });

    it('Should try to create an event with a name already in use', (done) => {
        const client = new WebSocket('http://localhost:3000');
        const register: MessageDataRegister = {
            type: MessageType.create,
            name: 'testing_0',
            time: new Date(new Date().setMinutes(5))
        };

        setTimeout(() => client.send(JSON.stringify(register)), 150);

        setTimeout(() => {
            expect(Object.keys(manager.eventService.eventsObj).length).toBe(1);
            expect(Object.keys(manager.eventService.timeoutsObj).length).toBe(1);
            client.close();
            done();
        }, 1000);
    });

    it('Should create and event and listen to it', (done) => {
        const client = new WebSocket('http://localhost:3000');

        client.on('message', (data) => {
            expect(data.toString().includes('testing_1 has reached the time')).toBe(true);
            done();
        });

        const register: MessageDataRegister = {
            type: MessageType.create,
            name: 'testing_1',
            time: new Date(new Date().setSeconds(2))
        };

        setTimeout(() => client.send(JSON.stringify(register)), 150);
    });

    it('Should remove one event', (done) => {
        const client = new WebSocket('http://localhost:3000');
        const register: MessageDataRegister = {
            type: MessageType.create,
            name: 'testing_2',
            time: new Date(new Date().setMinutes(5))
        };

        const remove: MessageData = {
            type: MessageType.delete,
            name: 'testing_2',
        };

        setTimeout(() => client.send(JSON.stringify(register)), 150);
        setTimeout(() => client.send(JSON.stringify(remove)), 250);

        setTimeout(() => {
            expect(!Object.keys(manager.eventService.eventsObj).includes('testing_2')).toBe(true);
            expect(!Object.keys(manager.eventService.timeoutsObj).includes('testing_2')).toBe(true);

            done();
        }, 500);
    });
});