import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, BadRequestError, currentUser } from '@bouncedev1/common';

import { Post, GoerPosts } from '../models/goer-posts';
import { natsWrapper } from '../nats-wrapper';
import { PostUpdatedPublisher } from '../events/post-updated-publisher';

const router = express.Router();

router.post(
    '/api/posts/goer/update/',
    requireAuth,
    [
        body('postId').notEmpty().isNumeric(),
        body('eventId').notEmpty().isAlphanumeric(),
        body('caption').optional().isLength({ max: 500 })
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { postId, eventId, caption } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const eventObjectId = ObjectId.createFromHexString(eventId);

    const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const currentGoer = await goerCollection.findOne({ _id: currentUserObjectId })
    if (!currentGoer) {
        throw new NotFoundError();
    }
    const postsCollection = databaseClient.client.db('bounce_dev1').collection('test');
    var currentGoerPosts = await postsCollection.findOne({ goerId: currentUserObjectId });
    if (!currentGoerPosts) {
        throw new NotFoundError();
    }
    if (postId >= currentGoerPosts.posts.length) {
        throw new BadRequestError('This postId is out of range');
    }
    currentGoerPosts.posts[postId].caption = caption;
    const results = await postsCollection.replaceOne({ goerId: currentUserObjectId}, currentGoerPosts);

    // create and send event
    await new PostUpdatedPublisher(natsWrapper.client).publish({
        post: {
            posterId: currentUserObjectId,
            posterUsername: currentGoer.username,
            postId: postId,
            eventId: eventObjectId,
            postCreated: 12345,
            mediaUrl: 'www.google.com',
            caption: caption,
        },
        followers: Object.keys(currentGoer.followers)
      });

    res.sendStatus(200);
});

export { router as updatePostRouter };