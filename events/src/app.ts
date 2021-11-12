import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@bouncedev1/common';

import { createEventRouter } from './routes/create-event';
import { getEventRouter } from './routes/get-event';
import { getEventHeadersRouter } from './routes/get-event-header';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUser);
app.use(createEventRouter);
app.use(getEventRouter);
app.use(getEventHeadersRouter);

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };