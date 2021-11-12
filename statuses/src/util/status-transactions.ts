import { databaseClient, NotFoundError } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

import { GoerStatuses, Status } from '../models/goer-status';

export class StatusTransactions {
    static deleteEntryFromFollowsArray(objectId: ObjectId, arr: ObjectId[]): ObjectId[] {
        for (var index = 0; index < arr.length; index++) {
            if (arr[index] === objectId) {
                arr.splice(index, 1)
                break;
            }
        }
        return arr;
    }

    static async addStatus(goerStatuses: GoerStatuses, status: Status, goerObjectId: ObjectId): Promise<ObjectId> {
        const statusesCollection = databaseClient.client.db('bounce_dev1').collection('statuses');
        const goerStatusesCollection = databaseClient.client.db('bounce_dev1').collection('goerStatuses');
        var insertedStatusId: ObjectId | null;
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                const postCreatedResult = await statusesCollection.insertOne(status, { session });
                insertedStatusId = postCreatedResult.insertedId;
                goerStatuses.statuses.push(insertedStatusId);
                goerStatuses.numStatuses += 1;
                const updatedGoerStatusesResult = await goerStatusesCollection.replaceOne({ goerId: goerObjectId }, goerStatuses, { session, upsert: true });
                if (!updatedGoerStatusesResult.matchedCount && !updatedGoerStatusesResult.upsertedCount) {
                    throw new NotFoundError();
                }
            });
            await session.commitTransaction();
        } catch (err) {
            insertedStatusId = null;
            throw err;
        } finally { 
            await session.endSession();
        }

        return new Promise((resolve, reject) => {
            if (insertedStatusId) {
                return resolve(insertedStatusId);
            }
            return reject();
        });
    }

    static async deleteStatus(goerStatuses: GoerStatuses, goerObjectId: ObjectId, statusId: ObjectId) {
        const statusesCollection = databaseClient.client.db('bounce_dev1').collection('statuses');
        const goerStatusesCollection = databaseClient.client.db('bounce_dev1').collection('goerStatuses');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                const deleteStatusResult = await statusesCollection.deleteOne({ _id: statusId }, { session });
                if (!deleteStatusResult.deletedCount) {
                    throw new NotFoundError();
                }
                goerStatuses.statuses = this.deleteEntryFromFollowsArray(statusId, goerStatuses.statuses);
                goerStatuses.numStatuses -= 1;
                const updatedGoerPostsResult = await goerStatusesCollection.replaceOne({ goerId: goerObjectId }, goerStatuses, { session });
                if (!updatedGoerPostsResult.matchedCount) {
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