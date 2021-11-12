import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, databaseClient, GetGoerHeaderPromise } from '@bouncedev1/common';

import { createEmptyEventFollowers, EventFollowers } from '../models/event';
import { GoerGetter } from '../util/goer-getter';


const router = express.Router();

router.get(
    '/api/follows/event-followers/:eventId',
    requireAuth,
    [
        param('eventId').isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const eventObjectId = ObjectId.createFromHexString(eventId);
    const eventFollowersCollection = databaseClient.client.db('bounce_dev1').collection('eventFollowers');
    var eventFollowers = await eventFollowersCollection.findOne({ eventId: eventObjectId }) as EventFollowers;
    if (!eventFollowers) {
        eventFollowers = createEmptyEventFollowers(eventObjectId, true);
    }
    console.log('event followers', eventFollowers);
    var followerRequests: Promise<GetGoerHeaderPromise>[] = [];
    var goerRequests: Promise<GetGoerHeaderPromise>[] = [];
    var populatedEventFollowers: any[] = [];
    var populatedEventGoers: any[] = [];
    const goerGetter = new GoerGetter(req.headers.jwt as string);
    for (var index = 0; index < eventFollowers.followers.length; index++) {
        followerRequests.push(goerGetter.getGoerHeader(eventFollowers.followers[index].goerId, index));
    }
    for (var index = 0; index < eventFollowers.goers.length; index++) {
        goerRequests.push(goerGetter.getGoerHeader(eventFollowers.goers[index].goerId, index));
    }
    console.log('follower requests', followerRequests);
    console.log('goer requests', goerRequests);
    await Promise.all(followerRequests)
    .then((getGoerHeaderPromises) => {
        console.log('getGoerHeaderPromises', getGoerHeaderPromises)
        getGoerHeaderPromises.map((getGoerHeaderPromise) => {
            if (getGoerHeaderPromise.activeGoer) {
                populatedEventFollowers.push(Object.assign({}, eventFollowers.followers[getGoerHeaderPromise.index], { goer: getGoerHeaderPromise.goerHeader }));
            }
        });
    })
    await Promise.all(goerRequests)
    .then((getGoerHeaderPromises) => {
        getGoerHeaderPromises.map((getGoerHeaderPromise) => {
            if (getGoerHeaderPromise.activeGoer) {
                populatedEventGoers.push(Object.assign({}, eventFollowers.goers[getGoerHeaderPromise.index], { goer: getGoerHeaderPromise.goerHeader }));
            }
        });
    })
    eventFollowers.followers = populatedEventFollowers;
    eventFollowers.goers = populatedEventGoers;
    console.log(eventFollowers);
    res.send(eventFollowers);
});

export { router as getEventFollowersRouter };