import { AnyBulkWriteOperation, ObjectId } from 'mongodb';

export interface EventHeader {
    _id: ObjectId;
    hostName: string;
    name: string;
    startTime: string;
    endTime: string;
}

export interface GetEventHeaderPromise {
    activeEvent: boolean;
    eventHeader: any
}