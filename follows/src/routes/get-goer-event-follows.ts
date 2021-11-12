import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, DatabaseConnectionError, databaseClient } from '@bouncedev1/common';

import { GoerEventFollows, createEmptyGoerEventFollows } from '../models/event';
import { GetEventHeaderPromise } from '../models/event-header';
import { EventGetter } from '../util/event-getter';


const router = express.Router();

router.get(
    '/api/follows/goer-event-follows/:goerId?',
    requireAuth,
    [
        param('goerId').optional().isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { followeeId } = req.body;
    const goerObjectId = ObjectId.createFromHexString(followeeId ? followeeId : req.currentUser!.userId);
    const goerEventFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerEventFollows');
    var goerEventFollows = await goerEventFollowsCollection.findOne({ goerId: goerObjectId }) as GoerEventFollows;
    if (!goerEventFollows) {
        goerEventFollows = createEmptyGoerEventFollows(goerObjectId);
        await goerEventFollowsCollection.insertOne(goerEventFollows);
        return res.send(goerEventFollows);
    }
    var populatedAttendingEvents: any[] = [];
    const eventGetter = new EventGetter(req.headers.jwt as string);
    var requests: Promise<GetEventHeaderPromise>[] = [];
    for (var index = 0; index < goerEventFollows.attendingEvents.length; index++) {
        requests.push(eventGetter.getEventHeader(goerEventFollows.attendingEvents[index].eventId, index));
    }
    await Promise.all(requests)
    .then((getEventHeaderPromises) => {
        getEventHeaderPromises.map((getEventHeaderPromise) => {
            if (getEventHeaderPromise.activeEvent) {
                populatedAttendingEvents.push(Object.assign({}, goerEventFollows.attendingEvents[getEventHeaderPromise.index], { event: getEventHeaderPromise.eventHeader }));
            }
        });
    })
    .catch((error) => {
      console.log('Unable to get the posts on a users feed', error);
      throw new DatabaseConnectionError();
    })
    .finally(() => {
    });
    goerEventFollows.attendingEvents = populatedAttendingEvents;
    res.send(goerEventFollows);
});

export { router as getGoerEventFollowRouter };