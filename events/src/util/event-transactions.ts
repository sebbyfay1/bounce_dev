import { databaseClient, NotFoundError } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

export class EventTransactions {
    static async follow(goerHistory: any, event: any, goerId: ObjectId, eventId: ObjectId) {
        const goerHistoryCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const eventsCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!goerHistory.follows) {
                    goerHistory.follows = []
                }
                if (!event.followers) {
                    event.followers = {}
                }
                goerHistory.follows.push({
                    lastUpdated: Date.now(),
                    eventId: eventId,
                    eventName: event.name,
                    endDate: event.endDate
                });
                event.followers[goerId.toString()] = Date.now();
                const updatedEventResult = await eventsCollection.replaceOne({ _id: eventId }, event, { session });
                if (!updatedEventResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedGoerHistoryResult = await goerHistoryCollection.replaceOne({ goerId: goerId }, goerHistoryCollection, { session });
                if (!updatedGoerHistoryResult.matchedCount) {
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

    static async unfollow(goerHistory: any, event: any, goerId: ObjectId, eventId: ObjectId) {
        const goerHistoryCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const eventsCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!goerHistory.follows) {
                    goerHistory.follows = []
                }
                if (!event.followers) {
                    event.followers = {}
                }
                for (var index = 0; index < goerHistory.follows.length; index++) {
                    if (goerHistory.follows[index].eventId === eventId) {
                        goerHistory.follows.splice(index, 1)
                        break;
                    }
                }
                delete event.followers[goerId.toString()];
                const updatedEventResult = await eventsCollection.replaceOne({ _id: eventId }, event, { session });
                if (!updatedEventResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedGoerHistoryResult = await goerHistoryCollection.replaceOne({ goerId: goerId }, goerHistoryCollection, { session });
                if (!updatedGoerHistoryResult.matchedCount) {
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

    static async go(goerHistory: any, event: any, goerId: ObjectId, eventId: ObjectId) {
        const goerHistoryCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const eventsCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!goerHistory.events) {
                    goerHistory.events = []
                }
                if (!event.goers) {
                    event.goers = {}
                }
                goerHistory.events.push({
                    lastUpdated: Date.now(),
                    eventId: event._id,
                    eventName: event.name,
                    endDate: event.endDate
                });
                event.goers[goerId.toString()] = Date.now();
                const updatedEventResult = await eventsCollection.replaceOne({ _id: eventId }, event, { session });
                if (!updatedEventResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedGoerHistoryResult = await goerHistoryCollection.replaceOne({ goerId: goerId }, goerHistoryCollection, { session });
                if (!updatedGoerHistoryResult.matchedCount) {
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

    static async ungo(goerHistory: any, event: any, goerId: ObjectId, eventId: ObjectId) {
        const goerHistoryCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const eventsCollection = databaseClient.client.db('bounce_dev1').collection('test');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                if (!goerHistory.events) {
                    goerHistory.events = []
                }
                if (!event.goers) {
                    event.goers = {}
                }
                for (var index = 0; index < goerHistory.events.length; index++) {
                    if (goerHistory.events[index].eventId === eventId) {
                        goerHistory.events.splice(index, 1)
                        break;
                    }
                }
                delete event.goers[goerId.toString()];
                const updatedEventResult = await eventsCollection.replaceOne({ _id: eventId }, event, { session });
                if (!updatedEventResult.matchedCount) {
                    throw new NotFoundError();
                }
                const updatedGoerHistoryResult = await goerHistoryCollection.replaceOne({ goerId: goerId }, goerHistoryCollection, { session });
                if (!updatedGoerHistoryResult.matchedCount) {
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