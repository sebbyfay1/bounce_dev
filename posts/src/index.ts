import { app } from './app';
import { databaseClient } from '@bouncedev1/common';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    try {
        await natsWrapper.connect(
            'bounce_dev',
            'test321542',
            'http://nats-srv:4222'
        );
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });
        process.on('SIGINT', () => {
            console.log('SIGINT');
            natsWrapper.client.close()
        });
        process.on('SIGTERM', () => {
            console.log('SIGTERM');
            natsWrapper.client.close()
        });

        await databaseClient.connect(process.env.MONGO_URI);
    } catch (err) {
        console.log('this is a test', err);
        throw err;
    }

    app.listen(3000, () => {
        console.log('Starting on port 3000!!!!!!');
    });
};

start();