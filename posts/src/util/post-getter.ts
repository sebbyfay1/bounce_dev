import { NotFoundError, databaseClient } from '@bouncedev1/common';

import { ObjectId } from 'mongodb';
import { GetPostPromise } from '../models/goer-posts';

const fetch = require('node-fetch');

export class PostGetter {
    jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }

    async getPost2(postId: ObjectId): Promise<GetPostPromise> {
        const postsCollection = databaseClient.client.db('bounce_dev1').collection('posts');
        const post = await postsCollection.findOne({ _id: postId });
        var postOk = true;
        var goerHeaderJson: any, eventHeaderJson: any;
        if (!post) {
            throw new NotFoundError();
        }
        const headers = {
            "jwt": this.jwt
        }
        const goerHeaderResponse = await fetch(`http://goers-srv:3000/api/goers/header/${post.goerId}`, { headers: headers });
        if (!goerHeaderResponse.ok) {
            console.error("Unable to get goerHeader for post");
            postOk = false;
        } else {
            goerHeaderJson = await goerHeaderResponse.json();
            const eventHeaderResponse = await fetch(`http://events-srv:3000/api/events/header/${post.eventId}`, { headers: headers });
            if (!eventHeaderResponse.ok) {
                console.error("Unable to get eventHeader for post");
                postOk = false;
            }
            eventHeaderJson = await eventHeaderResponse.json();
        }
        return new Promise((resolve, reject) => {
            if (postOk) {
                return resolve({
                    activePost: true,
                    post: Object.assign({}, post, { poster: goerHeaderJson }, { event: eventHeaderJson })
                });
            }
            reject();
        });
    }
}