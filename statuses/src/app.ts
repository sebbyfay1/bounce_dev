import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@bouncedev1/common';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUser);

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };