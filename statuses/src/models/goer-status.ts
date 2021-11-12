import { ObjectId } from 'mongodb';

export interface Status {
    goerId: ObjectId;
    postType: string;
    eventId: ObjectId;
    statusType: string;
    created: number;
}

export interface GoerStatuses {
    goerId: ObjectId;
    numStatuses: number;
    statuses: ObjectId[]
};

export interface GetStatusPromise {
    activeStatus: boolean;
    status: any;
}

export function CreateEmptyGoerStatuses(goerId: ObjectId): GoerStatuses {
    var goerPosts = <GoerStatuses>{};
    goerPosts.goerId = goerId;
    goerPosts.numStatuses = 0;
    goerPosts.statuses = [];
    return goerPosts;
}