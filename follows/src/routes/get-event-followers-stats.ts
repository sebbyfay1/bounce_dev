import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, databaseClient } from '@bouncedev1/common';

import { createEmptyEventFollowersStats, EventFollowers, EventFollowersStats } from '../models/event';


const router = express.Router();

router.get(
    '/api/follows/event-followers-stats/:eventId',
    requireAuth,
    [
        param('eventId').isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const eventObjectId = ObjectId.createFromHexString(eventId);
    const eventFollowersCollection = databaseClient.client.db('bounce_dev1').collection('eventFollowers');
    var eventFollowersStats = await eventFollowersCollection.findOne({ eventId: eventObjectId }, { 
        projection: { _id: 0, isPublic: 1, numFollowers: 1, numGoers: 1} }) as EventFollowersStats;
    if (!eventFollowersStats) {
        eventFollowersStats = createEmptyEventFollowersStats(eventObjectId, true);
    }
    res.send(eventFollowersStats);
});

export { router as getEventFollowersStatsRouter };