import { databaseClient, NotFoundError } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

export class EventTransactions {
    static async createEvent(goerEvents: any, event: any, goerId: ObjectId): Promise<ObjectId> {
        const goerEventsCollection = databaseClient.client.db('bounce_dev1').collection('goerEvents');
        const eventsCollection = databaseClient.client.db('bounce_dev1').collection('events');
        var insertedEventId: ObjectId | undefined;
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                console.log('adding event to event collection');
                const insertedEventResult = await eventsCollection.insertOne(event, { session });
                insertedEventId = insertedEventResult.insertedId;
                goerEvents.events.push(insertedEventId);
                console.log('adding event to goer events collection');
                const updatedGoerEventsResult = await goerEventsCollection.replaceOne({ goerId: goerId }, goerEvents, { session, upsert: true });
                if (!updatedGoerEventsResult.matchedCount && !updatedGoerEventsResult.upsertedCount) {
                    throw new NotFoundError();
                }
            });
            await session.commitTransaction();
        } catch (err) {
            console.log(err);
            insertedEventId = undefined;
        } finally { 
            await session.endSession();
        }
        return new Promise((resolve, reject) => {
            if (insertedEventId) {
                return resolve(insertedEventId);
            }
            reject();
        });
    }
}