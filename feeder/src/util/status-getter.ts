import { NotFoundError } from '@bouncedev1/common';

import { ObjectId } from 'mongodb';
import { GetStatusPromise } from '../models/feed';

const fetch = require('node-fetch');

export class PostGetter {
    jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }

    async getPost(postId: ObjectId): Promise<GetStatusPromise> {
        const headers = {
            "jwt": this.jwt
        }
        const response = await fetch(`http://statuses-srv:3000/api/statuses/goer/status/${postId}`, { headers: headers });
        var statusJson: any | undefined = undefined;
        if (response.ok) {
            statusJson = await response.json();
        }
        return new Promise((resolve, reject) => {
            resolve({
                activeStatus: response.ok,
                status: statusJson
            });
        });
    }
}