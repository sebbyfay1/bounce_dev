import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { DatabaseConnectionError, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';

import { GetPostPromise } from '../models/feed';
import { PostGetter } from '../util/post-getter';

const router = express.Router();

router.get(
    '/api/feeds/',
    requireAuth,
    async (req: Request, res: Response) => {
    const goerObjectId: ObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const feedsCollection = databaseClient.client.db('bounce_dev1').collection('feeds');
    const goerFeed = await feedsCollection.findOne({ goerId: goerObjectId });
    if (!goerFeed) {
        throw new NotFoundError();
    }

    var populatedFeed: {}[] = [];
    const postGetter = new PostGetter(req.headers.jwt as string);
    var requests: Promise<GetPostPromise>[] = [];
    for (var index = 0; index < goerFeed.posts.length; index++) {
        requests.push(postGetter.getPost(goerFeed.posts[index]));
    }
    await Promise.all(requests)
    .then(async (getPostPromises) => {
        getPostPromises.map((getPostPromise) => {
            if (getPostPromise.activePost) {
                populatedFeed.push(getPostPromise.post);
            }
        });
    })
    .catch(async (error) => {
      console.log('Unable to add post to all followers feeds', error);
      throw new DatabaseConnectionError();
    })
    .finally(async () => {
    });

    res.send(populatedFeed);
});

export { router as getFeedRouter };