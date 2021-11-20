import express, { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

import { StatusGetter } from '../util/status-getter';
import { GetStatusPromise } from '../models/get-status-promise';

const fetch = require('node-fetch');
const router = express.Router();

router.get(
    '/api/statuses/goer/status/:statusId',
    requireAuth,
    [
        param('statusId').isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { statusId } = req.params;
    var postObjectId = ObjectId.createFromHexString(statusId);
    const statusGetter = new StatusGetter(req.headers.jwt! as string);
    var postPromise: GetStatusPromise;
    try {
        postPromise = await statusGetter.getStatus(postObjectId);
    } catch (err) {
        console.log(err);
        throw new NotFoundError();
    }
    res.send(postPromise.status);
});

export { router as getStatusRouter };