import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import { randomBytes } from 'crypto';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser, RequestValidationError, DatabaseConnectionError } from '@bouncedev1/common';

import { Event, GoerEvents, createEmptyGoerEvents } from '../models/event';
import { EventTransactions } from '../util/event-transactions';

const fetch = require('node-fetch');
const router = express.Router();

router.post(
    '/api/events/goer/create/',
    requireAuth,
    [
        body('name').notEmpty(),
        body('description').optional(),
        body('address').notEmpty(),
        body('startTime').notEmpty(),
        body('endTime').notEmpty(),
        body('isPublic').notEmpty().isBoolean(),
        body('mediaUrl').optional().isURL()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { name, description, address, startTime, endTime, mediaUrl, isPublic } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);

    const newEvent = <Event>{};
    newEvent.hostId = currentUserObjectId;
    newEvent.hostIsGoer = true;
    newEvent.created = Date.now();
    newEvent.name = name;
    newEvent.description = description;
    newEvent.address = address;
    newEvent.startTime = startTime;
    newEvent.endTime = endTime;
    newEvent.isPublic = isPublic;
    newEvent.mediaUrl = mediaUrl;

    const goerEventsCollection = databaseClient.client.db('bounce_dev1').collection('goerEvents');
    var goerEvents = await goerEventsCollection.findOne({ goerId: currentUserObjectId }) as GoerEvents;
    if (!goerEvents) {
        goerEvents = createEmptyGoerEvents(currentUserObjectId);
    }
    console.log(goerEvents);
    console.log('inserting event to table');
    const insertedEventId = await EventTransactions.createEvent(goerEvents, newEvent, currentUserObjectId);
    console.log(insertedEventId);
    const headers = {
        'jwt': req.headers.jwt,
        'Content-Type': 'application/json'
    }
    const body = {
        'eventId': insertedEventId.toHexString()
    }
    console.log('mkaing request');
    const followEventResponse = await fetch('http://follows-srv:3000/api/follows/goer-attends/event', { 
        method: 'post',
        body: JSON.stringify(body),
        headers: headers
    });
    console.log(followEventResponse);
    if (!followEventResponse.ok) {
        throw new DatabaseConnectionError();
    }
    res.send({ id: insertedEventId });
});

export { router as createEventRouter };