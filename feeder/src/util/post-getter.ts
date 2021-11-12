import { NotFoundError } from '@bouncedev1/common';

import { ObjectId } from 'mongodb';
import { GetPostPromise } from '../models/feed';

const fetch = require('node-fetch');

export class PostGetter {
    jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }

    async getPost(postId: ObjectId): Promise<GetPostPromise> {
        const headers = {
            "jwt": this.jwt
        }
        const response = await fetch(`http://posts-srv:3000/api/posts/goer/post/${postId}`, { headers: headers });
        var postJson: any | undefined = undefined;
        if (response.ok) {
            postJson = await response.json();
        }
        return new Promise((resolve, reject) => {
            resolve({
                activePost: response.ok,
                post: postJson
            });
        });
    }
}