import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';
import { FollowTransactions } from '../util/follow-transactions';

import { GoerFollows, createEmptyFollows } from '../models/goer';


const router = express.Router();

router.post(
    '/api/follows/goers/private',
    requireAuth,
    [
        body('setPrivate').notEmpty().isBoolean()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { setPrivate } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);

    const goerFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerFollows');
    var currentGoerFollows = await goerFollowsCollection.findOne({ goerId: currentUserObjectId }) as GoerFollows;
    if (!currentGoerFollows) {
        currentGoerFollows = createEmptyFollows(currentUserObjectId);
    }
    currentGoerFollows.isPrivate = setPrivate;
    const updatedFollowerResult = await goerFollowsCollection.replaceOne({ goerId: currentUserObjectId }, currentGoerFollows, { upsert: true });
    if (!updatedFollowerResult.matchedCount && !updatedFollowerResult.upsertedCount) {
        throw new NotFoundError();
    }
    res.sendStatus(201);
});

export { router as setGoerPrivateRouter };