import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@bouncedev1/common';

import { updateRouter } from './routes/update';
import { gethostRouter } from './routes/get-host';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUser);
app.use(updateRouter);
app.use(gethostRouter);

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };