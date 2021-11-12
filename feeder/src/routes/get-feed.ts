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

    var populatedFeed: any[] = [];
    const postGetter = new PostGetter(req.headers.jwt as string);
    var requests: Promise<GetPostPromise>[] = [];
    for (var index = 0; index < goerFeed.posts.length; index++) {
        requests.push(postGetter.getPost(goerFeed.posts[index]));
    }
    await Promise.all(requests)
    .then((getPostPromises) => {
        getPostPromises.map((getPostPromise) => {
            if (getPostPromise.activePost) {
                populatedFeed.push(getPostPromise.post);
            }
        });
    })
    .catch((error) => {
      console.log('Unable to get the posts on a users feed', error);
      throw new DatabaseConnectionError();
    })
    .finally(() => {
    });


    res.send({ feed: populatedFeed });
});

export { router as getFeedRouter };