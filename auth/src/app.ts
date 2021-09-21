import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@bouncedev1/common';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { singoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { healthCheckRouter } from './routes/health-check';
import { refreshJwtRouter } from './routes/refresh-jwt';
import { usernameAvailableRouter } from './routes/username-available';
import { emailAvailableRouter } from './routes/email-available';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUser);
app.use(healthCheckRouter);
app.use(currentUserRouter);
app.use(usernameAvailableRouter);
app.use(emailAvailableRouter);
app.use(refreshJwtRouter);
app.use(signinRouter);
app.use(singoutRouter);
app.use(signupRouter);

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };