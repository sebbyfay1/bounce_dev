import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, BadRequestError, currentUser } from '@bouncedev1/common';

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

    const postsCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');

    var currentGoerPosts = await postsCollection.findOne({ goerId: currentUserObjectId });
    if (!currentGoerPosts) {
        throw new NotFoundError();
    }
    for (var index = 0; index < currentGoerPosts.posts.length; index++) {
        if (currentGoerPosts.posts[index].postId === postId) {
            currentGoerPosts.posts.splice(index, 1);
            break;
        }
        if (index == currentGoerPosts.posts.length) {
            throw new BadRequestError('PostId is not found');
        }
    }
    currentGoerPosts.numPosts -= 1;
    const result = await postsCollection.replaceOne({ goerId: currentUserObjectId}, currentGoerPosts);
    if (!result.matchedCount && !result.upsertedCount) {
        throw new NotFoundError();
    }
    // create and send event

    res.sendStatus(200);
});

export { router as deletePostRouter };