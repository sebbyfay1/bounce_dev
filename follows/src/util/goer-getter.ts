import { GetGoerHeaderPromise, GoerHeader } from '@bouncedev1/common';

import { ObjectId } from 'mongodb';

const fetch = require('node-fetch');

export class GoerGetter {
    jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }

    async getGoerHeader(goerId: ObjectId, index: number): Promise<GetGoerHeaderPromise> {
        const headers = {
            "jwt": this.jwt
        }
        return new Promise(async (resolve, reject) => {
            const response = await fetch(`http://goers-srv:3000/api/goers/header/${goerId}`, { headers: headers });
            if (response.ok) {
                const json = await response.json();
                console.log('follower json', json);
                return resolve({
                    activeGoer: true,
                    goerHeader: json,
                    index: index
                });
            } else {
                return resolve({
                    activeGoer: false,
                    goerHeader: {},
                    index: index
                });
            }
        });
    }
}