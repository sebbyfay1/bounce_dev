import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, BadRequestError, currentUser } from '@bouncedev1/common';

import { PostTransactions } from '../util/post-transaction';
import { GoerPosts } from '../models/goer-posts';

const router = express.Router();

router.post(
    '/api/posts/goer/delete/',
    requireAuth,
    [
        body('postId').notEmpty()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { postId } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const postObjectId = ObjectId.createFromHexString(postId);

    const goerPostsCollection = databaseClient.client.db('bounce_dev1').collection('goerPosts');

    var currentGoerPosts = await goerPostsCollection.findOne({ goerId: currentUserObjectId }) as GoerPosts;
    if (!currentGoerPosts) {
        throw new NotFoundError();
    }
    await PostTransactions.deletePost(currentGoerPosts, currentUserObjectId, postObjectId);

    res.sendStatus(200);
});

export { router as deletePostRouter };