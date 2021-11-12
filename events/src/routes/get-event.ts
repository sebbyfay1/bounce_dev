import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, DatabaseConnectionError } from '@bouncedev1/common';

const fetch = require('node-fetch');
const router = express.Router();

router.get(
    '/api/events/:eventId',
    requireAuth,
    [
        param('eventId').isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { eventId } = req.params;
    var eventObjectId = ObjectId.createFromHexString(eventId);
    const eventsCollection = databaseClient.client.db('bounce_dev1').collection('events');
    const event = await eventsCollection.findOne({ _id: eventObjectId });
    if (!event) {
        throw new NotFoundError();
    }
    const headers = {
        "jwt": req.headers.jwt
    };
    const eventFollowersStats = await fetch(`http://follows-srv:3000/api/follows/event-followers-stats/${eventId}`, { headers: headers });
    if (!eventFollowersStats.ok) {
        console.log('unable to get event followers', eventFollowersStats);
        throw new DatabaseConnectionError();
    }
    const eventFollowersStatsJson = await eventFollowersStats.json();
    console.log(Object.assign({}, event, eventFollowersStatsJson));
    res.send(Object.assign({}, event, eventFollowersStatsJson));
});

export { router as getEventRouter };