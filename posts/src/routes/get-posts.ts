import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { ObjectId, Document } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, DatabaseConnectionError } from '@bouncedev1/common';

import { Post, GoerPosts, GetPostPromise, CreateEmptyGoerPosts } from '../models/goer-posts';
import { CreateGoerPostsFromDoc } from '../models/goer-posts';
import { EventGetter } from '../util/event-getter';
import { PostGetter } from '../util/post-getter';

const fetch = require('node-fetch');
const router = express.Router();

router.get(
    '/api/posts/goer/posts/:goerId',
    requireAuth,
    [
        param('goerId').optional().isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { goerId } = req.params;
    var goerObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    if (goerId) {
        goerObjectId = ObjectId.createFromHexString(goerId);
    }
    const goerPostsCollection = databaseClient.client.db('bounce_dev1').collection('goerPosts');
    const goerPostsDoc = await goerPostsCollection.findOne({ goerId: goerObjectId });
    if (!goerPostsDoc) {
        return res.send(CreateEmptyGoerPosts(goerObjectId));
    }
    const goerPosts = CreateGoerPostsFromDoc(goerPostsDoc);

    const postGetter = new PostGetter(req.headers.jwt! as string);
    var populatedPosts: any[] = [];
    var postPromises: Promise<GetPostPromise>[] = [];
    for (var index = 0; index < goerPosts.posts.length; index++) {
        postPromises.push(postGetter.getPost2(goerPosts.posts[index]));
    }
    await Promise.all(postPromises)
    .then((postPromises) => {
        postPromises.map((postPromise) => {
            if (postPromise.activePost) {
                populatedPosts.push(postPromise.post);
            }
        });
    })
    .catch((error) => {
        console.error('Unable to get the posts for a user', error);
    })
    .finally(() => {
    });
    res.send({ posts: populatedPosts });
});

export { router as getPostsRouter };