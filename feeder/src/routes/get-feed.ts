import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { DatabaseConnectionError, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';

import { GetPostPromise, GetStatusPromise } from '../models/feed';
import { PostGetter } from '../util/post-getter';
import { StatusGetter } from '../util/status-getter';

const router = express.Router();

router.get(
    '/api/feeds/',
    requireAuth,
    async (req: Request, res: Response) => {
    const goerObjectId: ObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const feedsCollection = databaseClient.client.db('bounce_dev1').collection('feeds');
    const goerFeed = await feedsCollection.findOne({ goerId: goerObjectId });
    if (!goerFeed) {
        console.log('Cant find user feed');
        throw new NotFoundError();
    }

    var populatedFeed: {
        posts: any[],
        statuses: any[]
    } = {
        posts: [],
        statuses: []
    };
    const postGetter = new PostGetter(req.headers.jwt as string);
    var postsRequests: Promise<GetPostPromise>[] = [];
    for (var index = 0; index < goerFeed.posts.length; index++) {
        postsRequests.push(postGetter.getPost(goerFeed.posts[index]));
    }
    console.log('postRequests', )
    await Promise.all(postsRequests)
    .then((getPostPromises) => {
        console.log('getPostPromises', getPostPromises);
        getPostPromises.map((getPostPromise) => {
            if (getPostPromise.activePost) {
                populatedFeed.posts.push(getPostPromise.post);
            }
        });
    })
    .catch((error) => {
      console.log('Unable to get the posts on a users feed', error);
      throw new DatabaseConnectionError();
    })
    .finally(() => {
    });

    const statusGetter = new StatusGetter(req.headers.jwt as string);
    var statusRequests: Promise<GetStatusPromise>[] = [];
    for (var index = 0; index < goerFeed.statuses.length; index++) {
        statusRequests.push(statusGetter.getStatus(goerFeed.statuses[index]));
    }
    await Promise.all(statusRequests)
    .then((getStatusPromises) => {
        console.log('getStatusPromises', getStatusPromises);
        getStatusPromises.map((getStatusPromise) => {
            if (getStatusPromise.activeStatus) {
                populatedFeed.statuses.push(getStatusPromise.status);
            }
        });
    })
    .catch((error) => {
      console.log('Unable to get the statuses on a users feed', error);
      throw new DatabaseConnectionError();
    })
    .finally(() => {
    });

    res.send({ feed: populatedFeed });
});

export { router as getFeedRouter };