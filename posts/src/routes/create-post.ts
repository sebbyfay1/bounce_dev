import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient, currentUser } from '@bouncedev1/common';

import { Post, GoerPosts, CreateEmptyGoerPosts, CreateGoerPostsFromDoc } from '../models/goer-posts';
import { natsWrapper } from '../nats-wrapper';
import { PostCreatedPublisher } from '../events/post-created-publisher';
import { PostTransactions } from '../util/post-transaction';

const fetch = require('node-fetch');
const router = express.Router();

router.post(
    '/api/posts/goer/create/',
    requireAuth,
    [
        body('mediaUrl').notEmpty(),
        body('eventId').notEmpty().isMongoId(),
        body('caption').optional().isLength({ max: 500 })
    ],
    validateRequest, 
    async (req: Request, res: Response) => {
    const { mediaUrl, eventId, caption } = req.body;
    const currentUserObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const eventObjectId = currentUserObjectId

    const newPost = <Post>{};
    newPost.goerId = currentUserObjectId;
    newPost.postType = "goer.post";
    newPost.caption = caption;
    newPost.eventId = eventObjectId;
    newPost.mediaUrl = mediaUrl;
    newPost.created = Date.now();

    const goerPostsCollection = databaseClient.client.db('bounce_dev1').collection('goerPosts');
    const currentGoerPostsDoc = await goerPostsCollection.findOne({ goerId: currentUserObjectId });
    const currentGoerPosts: GoerPosts = currentGoerPostsDoc ? CreateGoerPostsFromDoc(currentGoerPostsDoc) : CreateEmptyGoerPosts(currentUserObjectId);

    const insertedPostId = await PostTransactions.post(currentGoerPosts, newPost, currentUserObjectId);
    console.log('making request to get followers');

    const headers = {
        "jwt": req.headers.jwt
    };
    const response = await fetch(`http://follows-srv:3000/api/follows/goer-followers/${currentUserObjectId}`, { headers: headers });
    const followersJson = await response.json();
    console.log('followers', followersJson);
    if (followersJson.length) {
        await new PostCreatedPublisher(natsWrapper.client).publish({
            post: insertedPostId,
            followers: followersJson
          });
    }
    res.sendStatus(201);
});

export { router as createPostRouter };