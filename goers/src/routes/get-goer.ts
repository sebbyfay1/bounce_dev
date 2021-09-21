import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { validateRequest, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';
const fetch = require('node-fetch');

const router = express.Router();

router.get(
    '/api/goers/:goerId',
    requireAuth,
    [
        param('goerId').notEmpty().isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { goerId } = req.params;
    const goerObjectId = ObjectId.createFromHexString(goerId);
    
    const userCollection = databaseClient.client.db('bounce_dev1').collection('goers');
    const goer = await userCollection.findOne({ _id: goerObjectId });
    if (!goer) {
        throw new NotFoundError();
    }
    const headers = {
        "jwt": req.headers.jwt
    };
    const response = await fetch(`http://follows-srv:3000/api/follows/goer-follows/${goerId}`, { headers: headers });
    const json = await response.json();
    res.send(Object.assign({}, goer, json));
});

export { router as getGoerRouter };