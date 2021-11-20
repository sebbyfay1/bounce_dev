import { databaseClient } from '@bouncedev1/common';
import { natsWrapper } from './nats-wrapper';
import { exit } from 'process';

import { app } from './app';
import { AttendingEventListener } from './events/attending-event-listener';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    try {
        await databaseClient.connect(process.env.MONGO_URI);
        await natsWrapper.connect(
            'bounce_dev',
            'test248',
            'http://nats-srv:4222'
        );
        new AttendingEventListener(natsWrapper.client).listen();
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!!!!!!!');
            exit(1);
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());
    } catch (err) {
        console.log(err);
        throw err;
    }

    app.listen(3000, () => {
        console.log('Starting on port 3000!!!!!!');
    });
};

start();