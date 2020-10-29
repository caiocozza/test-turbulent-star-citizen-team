export enum MessageType {
    listen = 1,
    create,
    delete,
    broadcast,
};

export type MessageData = {
    type: MessageType,
    name: string;
}

export type MessageDataRegister = {
    time: Date;
} & MessageData;

export type MessageDataBroadcast = {
    message: string;
} & MessageData;