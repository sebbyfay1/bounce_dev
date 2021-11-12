import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@bouncedev1/common';

import { createPostRouter } from './routes/create-post';
import { getPostsRouter } from './routes/get-posts';
import { getPostRouter } from './routes/get-post';
import { updatePostRouter } from './routes/update-post';
import { deletePostRouter } from './routes/delete-post';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.use(currentUser);
app.use(createPostRouter);
app.use(getPostsRouter);
app.use(getPostRouter);
app.use(updatePostRouter);
app.use(deletePostRouter);

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };