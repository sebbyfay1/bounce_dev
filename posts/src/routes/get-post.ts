import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

const router = express.Router();

router.get(
    '/api/posts/goer/post/:postId',
    requireAuth,
    [
        param('postId').optional().isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { postId } = req.body;
    var postObjectId = ObjectId.createFromHexString(postId);
    const postsCollection = databaseClient.client.db('bounce_dev1').collection('posts');
    const goerPosts = await postsCollection.findOne({ _id: postObjectId });
    res.send(goerPosts);
});

export { router as getPostsRouter };