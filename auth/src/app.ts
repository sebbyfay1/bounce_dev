import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError } from '@bouncedev1/common';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { singoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { healthCheckRouter } from './routes/health-check';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUserRouter);
app.use(signinRouter);
app.use(singoutRouter);
app.use(signupRouter);
app.use(healthCheckRouter);

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };