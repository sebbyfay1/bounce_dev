import { NotFoundError, databaseClient } from '@bouncedev1/common';

import { ObjectId } from 'mongodb';
import { GetStatusPromise } from '../models/get-status-promise';
import { Status } from '../models/goer-status';

const fetch = require('node-fetch');

export class StatusGetter {
    jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }

    async getStatus(postId: ObjectId): Promise<GetStatusPromise> {
        const statusesCollection = databaseClient.client.db('bounce_dev1').collection('statuses');
        const status = await statusesCollection.findOne({ _id: postId }) as Status;
        var statusOk = true;
        var goerHeaderJson: any, eventHeaderJson: any;
        if (!status) {
            throw new NotFoundError();
        }
        const headers = {
            "jwt": this.jwt
        }
        const goerHeaderResponse = await fetch(`http://goers-srv:3000/api/goers/header/${status.goerId}`, { headers: headers });
        if (!goerHeaderResponse.ok) {
            console.error("Unable to get goerHeader for status");
            statusOk = false;
        } else {
            goerHeaderJson = await goerHeaderResponse.json();
            const eventHeaderResponse = await fetch(`http://events-srv:3000/api/events/header/${status.eventId}`, { headers: headers });
            if (!eventHeaderResponse.ok) {
                console.error("Unable to get eventHeader for status");
                statusOk = false;
            }
            eventHeaderJson = await eventHeaderResponse.json();
        }
        return new Promise((resolve, reject) => {
            if (statusOk) {
                return resolve({
                    activeStatus: true,
                    status: Object.assign({}, status, { poster: goerHeaderJson }, { event: eventHeaderJson })
                });
            }
            reject();
        });
    }
}