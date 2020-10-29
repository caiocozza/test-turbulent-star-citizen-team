import { RedisClient } from 'redis';
import { promisify } from 'util';
import { Logger } from './logger';

export class Storage {
    constructor(
        private readonly client: RedisClient,
        private readonly _: Logger) {}

    public async byKey(key: string) {
        const call = promisify(this.client.get).bind(this.client);
        return call(key);
    }

    public async save(key: string, value: any) {
        const call = promisify(this.client.set).bind(this.client);
        return call(key, JSON.stringify(value));
    }

    public async remove(key: string) {
        const call = promisify(this.client.del).bind(this.client);
        return call(key);
    }

    public async fetch() {
        const call = promisify(this.client.keys).bind(this.client);
        const keys =  await call('*') as string[];
        return Promise.all(keys.map(key => this.byKey(key)));
    }
}
