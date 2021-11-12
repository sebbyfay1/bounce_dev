import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@bouncedev1/common';

import { getGoerEventFollowRouter } from './routes/get-goer-event-follows';
import { followRouter } from './routes/follow-goer';
import { unfollowRouter } from './routes/unfollow';
import { approveRequestRouter } from './routes/approve-request';
import { denyRequestRouter } from './routes/deny-request';
import { setGoerPrivateRouter } from './routes/set-goer-is-private';
import { getFollowersRouter } from './routes/get-followers';
import { setEventPrivateRouter } from './routes/set-event-is-private';
import { followEventRouter } from './routes/follow-event';
import { unfollowEventRouter } from './routes/unfollow-event';
import { getFollowsRouter } from './routes/get-follows';
import { getEventFollowersStatsRouter } from './routes/get-event-followers-stats';
import { attendEventRouter } from './routes/attend-event';
import { unattendEventRouter } from './routes/unattend-event';
import { getEventFollowersRouter } from './routes/get-event-followers';


const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUser);
app.use(attendEventRouter);
app.use(followRouter);
app.use(getFollowersRouter);
app.use(getFollowsRouter);
app.use(getEventFollowersStatsRouter);
app.use(getEventFollowersRouter);
app.use(getGoerEventFollowRouter);
app.use(unfollowRouter);
app.use(approveRequestRouter);
app.use(denyRequestRouter);
app.use(setGoerPrivateRouter);
app.use(setEventPrivateRouter);
app.use(followEventRouter);
app.use(unfollowEventRouter);
app.use(unattendEventRouter);
app.use(getGoerEventFollowRouter);

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };