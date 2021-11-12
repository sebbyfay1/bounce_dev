import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser, DatabaseConnectionError } from '@bouncedev1/common';
import { EventFollowTransactions } from '../util/event-follow-transactions';

import { GoerEventFollows, createEmptyGoerEventFollows, EventFollowers, createEmptyEventFollowers } from '../models/event';
import { AttendingEventPublisher } from '../events/attending-event-publisher';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();

router.post(
    '/api/follows/goer-attends/event', 
    requireAuth,
    [
        body('eventId').notEmpty().isMongoId()
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
        currentGoerEventFollows = createEmptyGoerEventFollows(currentUserObjectId);
    }
    var eventFollowers = await eventFollowersCollection.findOne({ eventId: eventObjectId }) as EventFollowers;
    if (!eventFollowers) {
        eventFollowers = createEmptyEventFollowers(eventObjectId, false);
    }
    try {
        await EventFollowTransactions.attendEvent(currentGoerEventFollows, eventFollowers, currentUserObjectId, eventObjectId);
    } catch (err) {
        console.log(err);
        throw new DatabaseConnectionError();
    }
    await new AttendingEventPublisher(natsWrapper.client).publish({
            jwt: req.headers!.jwt as string,
            goerId: req.currentUser!.userId,
            eventId: eventId
          });
    res.sendStatus(201);
});

export { router as attendEventRouter };