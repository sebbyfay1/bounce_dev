import { AnyBulkWriteOperation, ObjectId } from 'mongodb';

export interface GoerFeed {
    goerId: ObjectId;
    posts: ObjectId[];
    statuses: ObjectId[];
} 

export function CreateEmptyGoerFeed(goerId: ObjectId): GoerFeed {
    const newFeed = <GoerFeed>{};
    newFeed.goerId = goerId;
    newFeed.posts = [];
    newFeed.statuses = [];
    return newFeed;
}

export interface GetPostPromise {
    activePost: boolean;
    post: any;
}

export interface GetStatusPromise {
    activeStatus: boolean;
    status: any;
}