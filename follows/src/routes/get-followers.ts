import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, databaseClient } from '@bouncedev1/common';

import { createEmptyFollows } from '../models/goer';

const router = express.Router();

router.get(
    '/api/follows/goer-followers/:goerId?',
    requireAuth,
    [
        param('goerId').optional().isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { followeeId } = req.body;
    const goerObjectId = ObjectId.createFromHexString(followeeId ? followeeId : req.currentUser!.userId);
    const goerFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerFollows');
    var goerFollows = await goerFollowsCollection.findOne({ goerId: goerObjectId });
    if (goerFollows) {
        return res.send(goerFollows.followers);
    }
    const newGoerFollowsObj = createEmptyFollows(goerObjectId);
    await goerFollowsCollection.insertOne(newGoerFollowsObj);
    res.send(newGoerFollowsObj.followers);
});

export { router as getFollowersRouter };