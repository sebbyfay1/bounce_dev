import { app } from './app';
import { databaseClient } from '@bouncedev1/common';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    try {
        await databaseClient.connect(process.env.MONGO_URI);
    } catch (err) {
        console.log(err);
        throw err;
    }

    app.listen(3000, () => {
        console.log('Starting on port 3000!!!!!!');
    });
};

start();