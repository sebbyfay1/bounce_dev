import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

import { FollowTransactions } from '../util/follow-transactions';
import { GoerFollows } from '../models/goer';

const router = express.Router();

router.post(
    '/api/follows/deny-request/goer',
    requireAuth,
    [
        body('followerId').notEmpty().isAlphanumeric()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { followerId } = req.body;
    const followerObjectId = ObjectId.createFromHexString(followerId);
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const goerCollection = databaseClient.client.db('bounce_dev1').collection('goerFollows');
    const follower = await goerCollection.findOne({ _id: followerObjectId }) as GoerFollows;
    if (!follower) {
        throw new NotFoundError();
    }
    const currentGoer = await goerCollection.findOne({ _id: currentUserObjectId }) as GoerFollows;
    if (!currentGoer) {
        throw new NotFoundError();
    }
    await FollowTransactions.denyFollowRequest(follower, currentGoer, followerObjectId, currentUserObjectId);
    res.sendStatus(201);
});
 
export { router as denyRequestRouter };