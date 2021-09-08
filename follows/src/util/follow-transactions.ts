import { databaseClient, NotFoundError } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

export class FollowTransactions {
    static async follow(follower: any, followee: any, followerId: ObjectId, followeeId: ObjectId) {
        const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!follower.following) {
                    follower.following = {}
                }
                if (!followee.followers) {
                    followee.followers = {}
                }
                follower.following[followeeId.toString()] = Date.now();
                followee.followers[followerId.toString()] = Date.now();
                const updatedFollowerResult = await goerCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerCollection.replaceOne({ _id: followeeId }, followee, { session });
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

    static async unfollow(follower: any, followee: any, followerId: ObjectId, followeeId: ObjectId) {
        const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!follower.following) {
                    follower.following = {}
                }
                if (!followee.followers) {
                    followee.followers = {}
                }
                delete follower.following[followeeId.toString()];
                delete followee.followers[followerId.toString()];
                const updatedFollowerResult = await goerCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerCollection.replaceOne({ _id: followeeId }, followee, { session });
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

    static async requestFollow(follower: any, followee: any, followerId: ObjectId, followeeId: ObjectId) {
        const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!follower.followRequests) {
                    follower.followRequests = {}
                }
                if (!followee.followerRequests) {
                    followee.followerRequests = {}
                }
                follower.followRequests[followeeId.toString()] = Date.now();
                followee.followerRequests[followerId.toString()] = Date.now();
                const updatedFollowerResult = await goerCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerCollection.replaceOne({ _id: followeeId }, followee, { session });
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

    static async approvedFollowRequest(follower: any, followee: any, followerId: ObjectId, followeeId: ObjectId) {
        const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!follower.following) {
                    follower.following = {}
                }
                if (!followee.followers) {
                    followee.followers = {}
                }
                if (!follower.followRequests) {
                    follower.followRequests = {}
                }
                if (!followee.followerRequests) {
                    followee.followerRequests = {}
                }
                delete follower.followRequests[followeeId.toString()];
                delete followee.followerRequests[followerId.toString()];
                follower.following[followeeId.toString()] = Date.now();
                followee.followers[followerId.toString()] = Date.now();
                const updatedFollowerResult = await goerCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerCollection.replaceOne({ _id: followeeId }, followee, { session });
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

    static async denyFollowRequest(follower: any, followee: any, followerId: ObjectId, followeeId: ObjectId) {
        const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!follower.followRequests) {
                    follower.followRequests = {}
                }
                if (!followee.followerRequests) {
                    followee.followerRequests = {}
                }
                delete follower.followRequests[followeeId.toString()];
                delete followee.followerRequests[followerId.toString()];
                const updatedFollowerResult = await goerCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedFolloweeResult = await goerCollection.replaceOne({ _id: followeeId }, followee, { session });
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

    static async followHost(follower: any, host: any, followerId: ObjectId, hostId: ObjectId) {
        const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const hostsCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!follower.hostsFollowing) {
                    follower.hostsFollowing = {}
                }
                if (!host.followers) {
                    host.followers = {}
                }
                follower.hostsFollowing[hostId.toString()] = Date.now();
                host.followers[followerId.toString()] = Date.now();
                const updatedFollowerResult = await goerCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedHostResult = await hostsCollection.replaceOne({ _id: hostId }, host, { session });
                if (!updatedHostResult.matchedCount) {
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

    static async unfollowHost(follower: any, host: any, followerId: ObjectId, hostId: ObjectId) {
        const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const hostsCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!follower.hostsFollowing) {
                    follower.hostsFollowing = {}
                }
                if (!host.followers) {
                    host.followers = {}
                }
                delete follower.hostsFollowing[hostId.toString()];
                delete host.followers[followerId.toString()];
                const updatedFollowerResult = await goerCollection.replaceOne({ _id: followerId }, follower, { session });
                if (!updatedFollowerResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedHostResult = await hostsCollection.replaceOne({ _id: hostId }, host, { session });
                if (!updatedHostResult.matchedCount) {
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