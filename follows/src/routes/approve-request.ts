import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

import { FollowTransactions } from '../util/follow-transactions';
import { getJSDocReadonlyTag } from 'typescript';

const router = express.Router();

router.post(
    '/api/follows/approve-request/goer',
    requireAuth,
    [
        body('followerId').notEmpty().isAlphanumeric()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { followerId } = req.body;
    const followerObjectId = ObjectId.createFromHexString(followerId);
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);

    const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const follower = await goerCollection.findOne({ _id: followerObjectId })
    if (!follower) {
        throw new NotFoundError();
    }
    const currentGoer = await goerCollection.findOne({ _id: currentUserObjectId })
    if (!currentGoer) {
        throw new NotFoundError();
    }

    await FollowTransactions.approvedFollowRequest(follower, currentGoer, followerObjectId, currentUserObjectId);

    res.sendStatus(201);
});

export { router as approveRequestRouter };