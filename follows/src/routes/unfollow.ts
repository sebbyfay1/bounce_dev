import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';

import { FollowTransactions } from '../util/follow-transactions';
import { GoerFollows } from '../models/goer';


const router = express.Router();

router.post(
    '/api/follows/unfollow/goer',
    requireAuth,
    [
        body('followeeId').notEmpty().isAlphanumeric()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { followeeId } = req.body;
    const followeeObjectId = ObjectId.createFromHexString(followeeId);
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const goerCollection = databaseClient.client.db('bounce_dev1').collection('goerFollows');
    const followee = await goerCollection.findOne({ _id: followeeObjectId }) as GoerFollows;
    if (!followee) {
        throw new NotFoundError();
    }
    const currentGoer = await goerCollection.findOne({ _id: currentUserObjectId }) as GoerFollows;
    if (!currentGoer) {
        throw new NotFoundError();
    }
    await FollowTransactions.unfollow(currentGoer, followee, currentUserObjectId, followeeObjectId);
    res.sendStatus(201);
});

// router.post(
//     '/api/follows/unfollow/host',
//     requireAuth,
//     [
//         body('hostId').notEmpty().isAlphanumeric()
//     ], 
//     validateRequest, 
//     async (req: Request, res: Response) => {
//     const { hostId } = req.body;
//     const hostObjectId = ObjectId.createFromHexString(hostId);
//     const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
//     const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
//     const currentGoer = await goerCollection.findOne({ _id: currentUserObjectId })
//     if (!currentGoer) {
//         throw new NotFoundError();
//     }
//     const hostsCollection = databaseClient.client.db('bounce_dev1').collection('test');
//     const host = await hostsCollection.findOne({ _id: hostObjectId })
//     if (!host) {
//         throw new NotFoundError();
//     }
//     await FollowTransactions.unfollowHost(currentGoer, host, currentUserObjectId, hostObjectId);

//     res.sendStatus(201);
// });

export { router as unfollowRouter };