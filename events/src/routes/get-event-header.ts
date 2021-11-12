import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { validateRequest, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get(
    '/api/events/header/:eventId',
    requireAuth,
    [
        param('eventId').isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const eventObjectId = ObjectId.createFromHexString(eventId);
    const eventsCollection = databaseClient.client.db('bounce_dev1').collection('events');
    const event = await eventsCollection.findOne({ _id: eventObjectId }, { projection: { _id: 1, hostName: 1, name: 1, startTime: 1, endTime: 1 } });
    if (!event) {
        throw new NotFoundError();
    }
    res.send(event);
});

export { router as getEventHeadersRouter };