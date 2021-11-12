import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { validateRequest, requireAuth, NotFoundError, databaseClient, DatabaseConnectionError } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

const fetch = require('node-fetch');
const router = express.Router();

router.get(
    '/api/goers/:goerId',
    requireAuth,
    [
        param('goerId').isMongoId()
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
    const goerFollowsResponse = await fetch(`http://follows-srv:3000/api/follows/goer-follows/${goerId}`, { headers: headers });
    if (!goerFollowsResponse.ok) {
        console.log('unable to get goer follows', goerFollowsResponse);
        throw new DatabaseConnectionError();
    }
    const goerFollowsJson = await goerFollowsResponse.json();
    const goerEventFollowsResponse = await fetch(`http://follows-srv:3000/api/follows/goer-event-follows/${goerId}`, { headers: headers });
    if (!goerEventFollowsResponse.ok) {
        console.log('unable to get event follows');
        throw new DatabaseConnectionError();
    }
    const goerEventFollowsJson = await goerEventFollowsResponse.json();
    console.log('goer event follows', goerEventFollowsJson);
    const goerPostsResponse = await fetch(`http://posts-srv:3000/api/posts/goer/posts/${goerId}`, { headers: headers });
    if (!goerPostsResponse.ok) {
        console.log('unable to get goer posts');
        throw new DatabaseConnectionError();
    }
    const goerPostsJson = await goerPostsResponse.json();
    console.log('goer', Object.assign({}, goer, goerPostsJson, goerFollowsJson, goerEventFollowsJson));
    res.send(Object.assign({}, goer, goerPostsJson, goerFollowsJson, goerEventFollowsJson));
});

export { router as getGoerRouter };