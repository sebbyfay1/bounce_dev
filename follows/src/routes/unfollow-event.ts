import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, DatabaseConnectionError } from '@bouncedev1/common';

import { EventFollowers, GoerEventFollows } from '../models/event';
import { EventFollowTransactions } from '../util/event-follow-transactions';



const router = express.Router();

router.post(
    '/api/follows/unfollow/event',
    requireAuth,
    [
        body('eventId').notEmpty().isAlphanumeric()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { eventId } = req.body;
    const eventObjectId = ObjectId.createFromHexString(eventId);
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const goerEventFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerEventFollows');
    const eventFollowersCollection = databaseClient.client.db('bounce_dev1').collection('eventFollowers');
    var currentGoerEventFollows = await goerEventFollowsCollection.findOne({ goerId: currentUserObjectId }) as GoerEventFollows;
    if (!currentGoerEventFollows) {
        throw new NotFoundError();
    }
    var eventFollowers = await eventFollowersCollection.findOne({ eventId: eventObjectId }) as EventFollowers;
    if (!eventFollowers) {
        throw new NotFoundError();
    }
    try {
        await EventFollowTransactions.unfollowEvent(currentGoerEventFollows, eventFollowers, currentUserObjectId, eventObjectId);
    } catch (err) {
        console.log(err);
        throw new DatabaseConnectionError();
    }
    res.sendStatus(201);
});

export { router as unfollowEventRouter };