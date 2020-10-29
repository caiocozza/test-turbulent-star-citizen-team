import { config } from 'dotenv';

config();

export class Logger {
    private async write(log: string) {
        if (process.env?.environment !== 'test') {
            console.log(log);
        }
    }

    public async error(message: string) {
        this.write(`[ERROR] ${message}`);
    }

    public async warning(message: string) {
        this.write(`[WARNING] ${message}`);
    }

    public async info(message: string) {
        this.write(`[INFO] ${message}`);
    }
}