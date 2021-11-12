import express, { Request, Response } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@bouncedev1/common';

import { getGoerRouter } from './routes/get-goer';
import { getGoerHeaderRouter } from './routes/get-goer-header';
import { updateGoerRouter } from './routes/update-goer';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUser);
app.use(updateGoerRouter);
app.use(getGoerRouter);
app.use(getGoerHeaderRouter);

app.all('*', (req: Request, res: Response) => {
    console.log(req);
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };