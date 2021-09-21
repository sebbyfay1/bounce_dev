import { databaseClient, NotFoundError } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';
import { Follow, GoerFollows } from '../models/goer';

export class FollowTransactions {
    static deleteEntryFromFollowsArray(objectId: ObjectId, arr: Follow[]): Follow[] {
        for (var index = 0; index < arr.length; index++) {
            if (arr[index].goerId === objectId) {
                arr.splice(index, 1)
                break;
            }
        }
        return arr;
    }

    static async follow(follower: GoerFollows, followee: GoerFollows, followerId: ObjectId, followeeId: ObjectId) {
        const goerFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerFollows');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                follower.following.push({
                    goerId: followeeId,
                    created: Date.now(),
                    status: "1"
                });
                followee.followers.push({
                    goerId: followerId,
                    created: Date.now(),
                    status: "1"
                });
                followee.numFollowers += 1;
                follower.numFollowing += 1;
                const updatedFollowerResult = await goerFollowsCollection.replaceOne({ goerId: followerId }, follower, { session, upsert: true });
                if (!updatedFollowerResult.matchedCount && !updatedFollowerResult.upsertedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerFollowsCollection.replaceOne({ goerId: followeeId }, followee, { session, upsert: true });
                if (!updatedFolloweeResult.matchedCount && !updatedFolloweeResult.upsertedCount) {
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

    static async unfollow(follower: GoerFollows, followee: GoerFollows, followerId: ObjectId, followeeId: ObjectId) {
        const goerFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerFollows');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                follower.following = this.deleteEntryFromFollowsArray(followeeId, follower.following);
                followee.followers = this.deleteEntryFromFollowsArray(followerId, followee.followers);
                follower.numFollowing -= 1;
                followee.numFollowers -= 1;
                const updatedFollowerResult = await goerFollowsCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerFollowsCollection.replaceOne({ _id: followeeId }, followee, { session });
                if (!updatedFolloweeResult.matchedCount) {
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

    static async requestFollow(follower: GoerFollows, followee: GoerFollows, followerId: ObjectId, followeeId: ObjectId) {
        const goerFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerFollows');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                follower.followRequests.push({
                    goerId: followeeId,
                    created: Date.now(),
                    status: "3"
                });
                followee.followerRequests.push({
                    goerId: followerId,
                    created: Date.now(),
                    status: "3"
                });
                const updatedFollowerResult = await goerFollowsCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerFollowsCollection.replaceOne({ _id: followeeId }, followee, { session });
                if (!updatedFolloweeResult.matchedCount) {
                    throw new NotFoundError();
                }
            });
            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally { 
            await session.endSession();
        }
    }

    static async approvedFollowRequest(follower: GoerFollows, followee: GoerFollows, followerId: ObjectId, followeeId: ObjectId) {
        const goerFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerFollows');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                follower.followRequests = this.deleteEntryFromFollowsArray(followeeId, follower.followRequests);
                followee.followerRequests = this.deleteEntryFromFollowsArray(followerId, followee.followerRequests);
                follower.following.push({
                    goerId: followeeId,
                    created: Date.now(),
                    status: "1"
                });
                followee.followers.push({
                    goerId: followerId,
                    created: Date.now(),
                    status: "1"
                });
                follower.numFollowing += 1;
                followee.numFollowers += 1;
                const updatedFollowerResult = await goerFollowsCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerFollowsCollection.replaceOne({ _id: followeeId }, followee, { session });
                if (!updatedFolloweeResult.matchedCount) {
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

    static async denyFollowRequest(follower: GoerFollows, followee: GoerFollows, followerId: ObjectId, followeeId: ObjectId) {
        const goerFollowsCollection = databaseClient.client.db('bounce_dev1').collection('goerFollows');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                follower.followRequests = this.deleteEntryFromFollowsArray(followeeId, follower.followRequests);
                followee.followerRequests = this.deleteEntryFromFollowsArray(followerId, followee.followerRequests);
                const updatedFollowerResult = await goerFollowsCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerFollowsCollection.replaceOne({ _id: followeeId }, followee, { session });
                if (!updatedFolloweeResult.matchedCount) {
                    throw new NotFoundError();
                }
            });
            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally { 
            await session.endSession();
        }
    }
}