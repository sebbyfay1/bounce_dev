import express, { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

import { PostGetter } from '../util/post-getter';
import { GetPostPromise } from '../models/goer-posts';

const fetch = require('node-fetch');
const router = express.Router();

router.get(
    '/api/posts/goer/post/:postId',
    requireAuth,
    [
        param('postId').optional().isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { postId } = req.params;
    var postObjectId = ObjectId.createFromHexString(postId);
    const postGetter = new PostGetter(req.headers.jwt! as string);
    var postPromise: GetPostPromise;
    try {
        postPromise = await postGetter.getPost2(postObjectId);
    } catch (err) {
        console.log(err);
        throw new NotFoundError();
    }
    res.send(postPromise.post);
});

export { router as getPostRouter };