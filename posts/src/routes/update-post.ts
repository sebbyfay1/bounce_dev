import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, BadRequestError, currentUser } from '@bouncedev1/common';

import { Post, GoerPosts, CreatePostFromDoc } from '../models/goer-posts';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/posts/goer/update/',
    requireAuth,
    [
        body('postId').notEmpty().isMongoId(),
        body('caption').notEmpty().isLength({ max: 500 })
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { postId, caption } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const postObjectId = ObjectId.createFromHexString(postId);

    const postsCollection = databaseClient.client.db('bounce_dev1').collection('posts');
    const postDoc = await postsCollection.findOne({ _id: postObjectId });
    if (!postDoc) {
        throw new NotFoundError();
    }
    var post = CreatePostFromDoc(postDoc);
    post.caption = caption;
    const results = await postsCollection.replaceOne({ _id: postObjectId}, post);
    if (!results.modifiedCount) {
        throw new NotFoundError();
    }
    res.sendStatus(200);
});

export { router as updatePostRouter };