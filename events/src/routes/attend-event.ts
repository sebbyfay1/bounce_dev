import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { randomBytes } from 'crypto';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

import { Event } from '../models/event';

const router = express.Router();

router.post(
    '/api/events/go/',
    requireAuth,
    [
        body('eventId').notEmpty().isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { eventId } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const eventObjectId = ObjectId.createFromHexString(eventId);

    const eventsCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const event = await eventsCollection.findOne({ _id: eventObjectId });   
    if (!event) {
        throw new NotFoundError();
    }
    const goerHistoryCollection = databaseClient.client.db('bounce_dev1').collection('test');
    var goerHistory = await goerHistoryCollection.findOne({ goerId: currentUserObjectId });
    if (!goerHistory) {
        goerHistory = {};
    }
    

    res.sendStatus(201);
});

export { router as createEventRouter };