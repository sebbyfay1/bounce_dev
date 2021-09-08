import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { randomBytes } from 'crypto';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

import { Post, GoerPosts } from '../models/goer-posts';
import { natsWrapper } from '../nats-wrapper';
import { PostCreatedPublisher } from '../events/post-created-publisher';

const router = express.Router();

router.post(
    '/api/posts/goer/create/',
    requireAuth,
    [
        body('mediaUrls').notEmpty().isURL(),
        body('eventId').notEmpty().isAlphanumeric(),
        body('caption').optional().isLength({ max: 500 })
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { mediaUrls, eventId, caption } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    // const eventObjectId = ObjectId.createFromHexString(eventId);
    const eventObjectId = currentUserObjectId;

    const postsCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const currentGoer = await goerCollection.findOne({ _id: currentUserObjectId })
    if (!currentGoer) {
        throw new NotFoundError();
    }

    const newPost = <Post>{};
    newPost.caption = caption;
    newPost.eventId = eventId;
    newPost.mediaUrl = mediaUrls;
    newPost.created = Date.now();
    newPost.postId = `${currentGoer.username}-${newPost.created}-${randomBytes(4).toString('hex')}`;

    var currentGoerPosts = await postsCollection.findOne({ goerId: currentUserObjectId });
    if (currentGoerPosts) {
        currentGoerPosts.numPosts += 1;
        currentGoerPosts.posts.push(newPost);
        const results = await postsCollection.replaceOne({ goerId: currentUserObjectId}, currentGoerPosts);
        if (!results.matchedCount) {
            throw new NotFoundError();
        }
    } else {
        const goerPosts = <GoerPosts>{};
        goerPosts.goerId = currentUserObjectId;
        goerPosts.numPosts = 1;
        goerPosts.goerUsername = currentGoer.goerUsername;
        goerPosts.posts = [];
        goerPosts.posts.push(newPost);
        await postsCollection.insertOne(goerPosts);
    }

    // create and send event
    await new PostCreatedPublisher(natsWrapper.client).publish({
        post: {
            posterId: currentUserObjectId,
            posterUsername: currentGoer.username,
            postId: newPost.postId,
            eventId: eventObjectId,
            postCreated: newPost.created,
            mediaUrl: 'www.google.com',
            caption: newPost.caption,
        },
        followers: Object.keys(currentGoer.followers)
      });
    res.sendStatus(201);
});

export { router as createPostRouter };