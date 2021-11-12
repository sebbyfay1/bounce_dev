import { databaseClient, NotFoundError } from '@bouncedev1/common';
import { ClientSession, ObjectId } from 'mongodb';

import { GoerFeed, CreateEmptyGoerFeed } from '../models/feed';

export class FeedTransactions {
    static async addPostToFeed(followerId: string, post: any, session: ClientSession): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const followerObjectId = ObjectId.createFromHexString(followerId);
            const feedCollection = databaseClient.client.db('bounce_dev1').collection('feeds');
            var feed = await feedCollection.findOne({ goerId: followerObjectId }) as GoerFeed;
            if (!feed) {
                feed = CreateEmptyGoerFeed(followerObjectId);
            }
            feed.posts.push(post);
            await session.withTransaction(async () => { 
                const result = await feedCollection.replaceOne({ goerId: followerObjectId }, feed!, { session, upsert: true });
                if (!result.matchedCount && !result.upsertedCount) {
                    reject(new NotFoundError());
                } else {
                    resolve();
                }
            });
        });
    }

    static async addStatusToFeed(followerId: string, status: any, session: ClientSession): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const followerObjectId = ObjectId.createFromHexString(followerId);
            const feedCollection = databaseClient.client.db('bounce_dev1').collection('feeds');
            var feed = await feedCollection.findOne({ goerId: followerObjectId }) as GoerFeed;
            if (!feed) {
                feed = CreateEmptyGoerFeed(followerObjectId);
            }
            feed.statuses.push(status);
            var success = false;
            await session.withTransaction(async () => {
                const result = await feedCollection.replaceOne({ goerId: followerObjectId }, feed!, { session, upsert: true });
                if (result.matchedCount || result.upsertedCount) {
                    success = true;
                }
            });
            if (success) {
                return resolve();
            }
            reject(new NotFoundError());
        });
    }
}