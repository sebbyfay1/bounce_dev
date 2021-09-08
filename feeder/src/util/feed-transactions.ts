import { databaseClient, NotFoundError } from '@bouncedev1/common';
import { ClientSession, ObjectId } from 'mongodb';

export class FeedTransactions {
    static async addPostToFeed(followerId: string, post: any, session: ClientSession): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const followerObjectId = ObjectId.createFromHexString(followerId);
            const feedCollection = databaseClient.client.db('bounce_dev1').collection('feeds');
            var feed = await feedCollection.findOne({ goerId: followerObjectId });
            if (!feed) {
                feed = {
                    goerId: followerObjectId,
                    posts: []
                }
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

    static async UpdatePostInFeed(followerId: string, updatedPost: any, session: ClientSession): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const followerObjectId = ObjectId.createFromHexString(followerId);
            const feedCollection = databaseClient.client.db('bounce_dev1').collection('feeds');
            var feed = await feedCollection.findOne({ goerId: followerObjectId });
            if (!feed) {
                feed = {
                    goerId: followerObjectId,
                    posts: []
                };
                feed.posts.push(updatedPost);
                try {
                    await session.withTransaction( async () => {
                        await feedCollection.insertOne(feed!, { session });
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
                return;
            }
            for (var index = 0; index < feed.posts.length; index++) {
                if (feed.posts[index].postId === updatedPost.postId) {
                    feed.posts[index] = updatedPost;
                    break;
                }
            }
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

    static async DeletePostInFeed(followerId: string, postId: string, session: ClientSession): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const followerObjectId = ObjectId.createFromHexString(followerId);
            const feedCollection = databaseClient.client.db('bounce_dev1').collection('feeds');
            var feed = await feedCollection.findOne({ goerId: followerObjectId });
            if (!feed) {
                resolve();
                return;
            }
            for (var index = 0; index < feed.posts.length; index++) {
                if (feed.posts[index].postId === postId) {
                    feed.posts.splice(index, 1)
                    break;
                }
            }
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
}