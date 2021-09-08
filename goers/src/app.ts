import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@bouncedev1/common';

import { updateRouter } from './routes/update';
import { getGoerRouter } from './routes/get-goer';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUser);
app.use(updateRouter);
app.use(getGoerRouter);

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };