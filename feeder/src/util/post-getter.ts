import { NotFoundError } from '@bouncedev1/common';

import { ObjectId } from 'mongodb';
import { GetPostPromise } from '../models/feed';

const fetch = require('node-fetch');

export class PostGetter {
    jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }

    async getPost(postId: ObjectId): Promise<any> {
        const headers = {
            "jwt": this.jwt
        }
        return new Promise(async (reject, resolve) => {
            const response = await fetch(`http://follows-srv:3000/api/posts/goer/post/${postId}`, { headers: headers });
            if (response.ok) {
                const json = await response.json();
                return resolve({
                    activePost: true,
                    post: json
                });
            } else {
                return resolve({
                    activePost: false,
                    post: {}
                });
            }
            reject(new NotFoundError());
        });
    }
}