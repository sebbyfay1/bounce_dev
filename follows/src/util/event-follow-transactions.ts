import { databaseClient, NotFoundError, InsertSortedEventId, InsertSortedGoerId } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';
import { GoerEventFollows, EventFollowers } from '../models/event';

export class EventFollowTransactions {
    static deleteEntryFromFollowsArray(objectId: ObjectId, arr: any[]): any[] {
        for (var index = 0; index < arr.length; index++) {
            if (arr[index].goerId === objectId) {
                arr.splice(index, 1)
                break;
            }
        }
        return arr;
    }

    static async followEvent(follower: GoerEventFollows, eventFollowers: EventFollowers, followerId: ObjectId, eventId: ObjectId) {
        const goerEventFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerEventFollows');
        const eventFollowersCollection = databaseClient.client.db('bounce_dev1').collection('eventFollowers');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                follower.followingEvents = InsertSortedEventId(follower.followingEvents, {
                    eventId: eventId,
                    created: Date.now(),
                    status: "1"
                });
                eventFollowers.followers = InsertSortedGoerId(eventFollowers.followers, {
                    goerId: followerId,
                    created: Date.now(),
                    status: "1"
                });
                eventFollowers.numFollowers += 1;
                const updatedFollowerResult = await goerEventFollowsCollection.replaceOne({ goerId: followerId }, follower, { session, upsert: true });
                if (!updatedFollowerResult.matchedCount && !updatedFollowerResult.upsertedCount) {
                    throw new NotFoundError();
                }
                const updatedEventFollowersResult = await eventFollowersCollection.replaceOne({ eventId: eventId }, eventFollowers, { session, upsert: true });
                if (!updatedEventFollowersResult.matchedCount && !updatedEventFollowersResult.upsertedCount) {
                    throw new NotFoundError();
                }
            });
            await session.commitTransaction();
        } catch (err) {
            throw err;
        } finally { 
            await session.endSession();
        }
    }

    static async attendEvent(follower: GoerEventFollows, eventFollowers: EventFollowers, followerId: ObjectId, eventId: ObjectId) {
        const goerEventFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerEventFollows');
        const eventFollowersCollection = databaseClient.client.db('bounce_dev1').collection('eventFollowers');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                follower.followingEvents = InsertSortedEventId(follower.followingEvents, {
                    eventId: eventId,
                    created: Date.now(),
                    status: "1"
                });
                follower.attendingEvents = InsertSortedEventId(follower.attendingEvents, {
                    eventId: eventId,
                    created: Date.now(),
                    status: "1"
                });
                eventFollowers.followers = InsertSortedGoerId(eventFollowers.followers, {
                    goerId: followerId,
                    created: Date.now(),
                    status: "1"
                });
                eventFollowers.goers = InsertSortedGoerId(eventFollowers.goers, {
                    goerId: followerId,
                    created: Date.now(),
                    status: "1"
                });
                eventFollowers.numFollowers += 1;
                eventFollowers.numGoers += 1;
                const updatedFollowerResult = await goerEventFollowsCollection.replaceOne({ goerId: followerId }, follower, { session, upsert: true });
                if (!updatedFollowerResult.matchedCount && !updatedFollowerResult.upsertedCount) {
                    throw new NotFoundError();
                }
                const updatedEventFollowersResult = await eventFollowersCollection.replaceOne({ eventId: eventId }, eventFollowers, { session, upsert: true });
                if (!updatedEventFollowersResult.matchedCount && !updatedEventFollowersResult.upsertedCount) {
                    throw new NotFoundError();
                }
            });
            await session.commitTransaction();
        } catch (err) {
            throw err;
        } finally { 
            await session.endSession();
        }
    }

    static async unfollowEvent(follower: GoerEventFollows, eventFollowers: EventFollowers, followerId: ObjectId, eventId: ObjectId) {
        const goerEventFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerEventFollows');
        const eventFollowersCollection = databaseClient.client.db('bounce_dev1').collection('eventFollowers');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                follower.followingEvents = this.deleteEntryFromFollowsArray(eventId, follower.followingEvents);
                eventFollowers.followers = this.deleteEntryFromFollowsArray(followerId, eventFollowers.followers);
                eventFollowers.numFollowers -= 1;
                const updatedFollowerResult = await goerEventFollowsCollection.replaceOne({ goerId: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedEventFollowersResult = await eventFollowersCollection.replaceOne({ eventId: eventId }, eventFollowers, { session });
                if (!updatedEventFollowersResult.matchedCount) {
                    throw new NotFoundError();
                }
            });
            await session.commitTransaction();
        } catch (err) {
            throw err;
        } finally { 
            await session.endSession();
        }
    }

    static async unattendEvent(follower: GoerEventFollows, eventFollowers: EventFollowers, followerId: ObjectId, eventId: ObjectId) {
        const goerEventFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerEventFollows');
        const eventFollowersCollection = databaseClient.client.db('bounce_dev1').collection('eventFollowers');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                follower.attendingEvents = this.deleteEntryFromFollowsArray(eventId, follower.attendingEvents);
                follower.followingEvents = this.deleteEntryFromFollowsArray(eventId, follower.followingEvents);
                eventFollowers.followers = this.deleteEntryFromFollowsArray(followerId, eventFollowers.followers);
                eventFollowers.goers = this.deleteEntryFromFollowsArray(followerId, eventFollowers.goers);
                eventFollowers.numFollowers -= 1;
                eventFollowers.numGoers -= 1;
                const updatedFollowerResult = await goerEventFollowsCollection.replaceOne({ goerId: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedEventFollowersResult = await eventFollowersCollection.replaceOne({ eventId: eventId }, eventFollowers, { session });
                if (!updatedEventFollowersResult.matchedCount) {
                    throw new NotFoundError();
                }
            });
            await session.commitTransaction();
        } catch (err) {
            throw err;
        } finally { 
            await session.endSession();
        }
    }
}