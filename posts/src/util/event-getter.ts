import { NotFoundError } from '@bouncedev1/common';

import { ObjectId } from 'mongodb';
import { GetEventHeaderPromise } from '../models/event-header';

const fetch = require('node-fetch');

export class EventGetter {
    jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }

    async getEventHeader(eventId: ObjectId): Promise<GetEventHeaderPromise> {
        const headers = {
            "jwt": this.jwt
        }
        return new Promise(async (resolve, reject) => {
            const response = await fetch(`http://events-srv:3000/api/events/header/${eventId}`, { headers: headers });
            if (response.ok) {
                const json = await response.json();
                return resolve({
                    activeEvent: true,
                    eventHeader: json
                });
            } else {
                return resolve({
                    activeEvent: false,
                    eventHeader: {}
                });
            }
        });
    }
}