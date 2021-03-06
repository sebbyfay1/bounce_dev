import { databaseClient } from '@bouncedev1/common';
import { natsWrapper } from './nats-wrapper';

import { app } from './app';
import { PostCreatedListener } from './events/post-created-listener';
import { StatusCreatedListener } from './events/status-created-listener';

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
            'test2',
            'http://nats-srv:4222'
        );
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());
        new PostCreatedListener(natsWrapper.client).listen();
        new StatusCreatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.log(err);
        throw err;
    }

    app.listen(3000, () => {
        console.log('Starting on port 3000!!!!!!');
    });
};

start();