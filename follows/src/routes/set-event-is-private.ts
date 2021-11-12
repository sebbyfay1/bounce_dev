import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';
import { FollowTransactions } from '../util/follow-transactions';

import { EventFollowers, createEmptyEventFollowers } from '../models/event';

const router = express.Router();

router.post(
    '/api/follows/events/private',
    requireAuth,
    [
        body('eventId').isMongoId(),
        body('setPrivate').notEmpty().isBoolean()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { eventId, setPrivate } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const eventObjectId = ObjectId.createFromHexString(eventId);
    const eventFollowersCollection = databaseClient.client.db('bounce_dev1').collection('eventFollowers');
    var eventFollowers = await eventFollowersCollection.findOne({ eventId: eventObjectId }) as EventFollowers;
    if (!eventFollowers) {
        eventFollowers = createEmptyEventFollowers(eventObjectId, setPrivate);
    }
    eventFollowers.isPublic = setPrivate;
    const updatedFollowerResult = await eventFollowersCollection.replaceOne({ goerId: eventId }, eventFollowers, { upsert: true });
    if (!updatedFollowerResult.matchedCount && !updatedFollowerResult.upsertedCount) {
        throw new NotFoundError();
    }
    res.sendStatus(200);
});

export { router as setEventPrivateRouter };