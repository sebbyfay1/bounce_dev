import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { randomBytes } from 'crypto';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

import { Event } from '../models/event';

const router = express.Router();

router.post(
    '/api/events/create/',
    requireAuth,
    [
        body('hostName').notEmpty().isString(),

        body('name').notEmpty().isString(),
        body('description').optional().isString(),
        body('address').notEmpty().isString(),

        body('startDate').notEmpty().isDate({
            format: 'YYYY-MM-DD',
            delimiters: ['/', '-'],
            strictMode: false
        }),
        body('endDate').notEmpty().isDate({
            format: 'YYYY-MM-DD',
            delimiters: ['/', '-'],
            strictMode: false
        }),
        body('startTime').notEmpty().isString(),
        body('endTime').notEmpty().isString(),

        body('mediaUrls').notEmpty().isURL(),

        body('isGoer').notEmpty().isBoolean(),
        body('isPublic').notEmpty().isBoolean
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { hostName, name, description, address, startDate, endDate, startTime, endTime, mediaUrls, isGoer, isPublic } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);

    const newEvent = <Event>{};
    newEvent.hostName = hostName;
    newEvent.hostId = currentUserObjectId;
    newEvent.isGoer = isGoer;
    newEvent.created = Date.now();
    newEvent.name = name;
    newEvent.description = description;
    newEvent.address = address;
    newEvent.startDate = startDate;
    newEvent.endDate = endDate;
    newEvent.startTime = startTime;
    newEvent.endTime = endTime;
    newEvent.isPublic = isPublic;
    newEvent.mediaUrls = mediaUrls.split(',');

    const eventsCollection = databaseClient.client.db('bounce_dev1').collection('test');
    eventsCollection.insertOne(newEvent);

    res.sendStatus(201);
});

export { router as createEventRouter };