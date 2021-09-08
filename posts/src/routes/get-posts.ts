import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

const router = express.Router();

router.get(
    '/api/posts/goer/',
    requireAuth,
    [
        body('goerId').optional().isAlphanumeric()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { goerId } = req.body;
    var goerObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    if (goerId) {
        goerObjectId = ObjectId.createFromHexString(goerId);
    }
    const postsCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const goerPosts = await postsCollection.findOne({ goerId: goerObjectId });
    res.send(goerPosts);
});

export { router as getPostsRouter };