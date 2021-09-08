import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@bouncedev1/common';

import { followRouter } from './routes/follow';
import { unfollowRouter } from './routes/unfollow';
import { approveRequestRouter } from './routes/approve-request';
import { denyRequestRouter } from './routes/deny-request';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUser);
app.use(followRouter);
app.use(unfollowRouter);
app.use(approveRequestRouter);
app.use(denyRequestRouter);

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };