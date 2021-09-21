import { AnyBulkWriteOperation, ObjectId } from 'mongodb';

export interface GoerFeed {
    goerId: ObjectId;
    posts: ObjectId[];
} 

export function CreateEmptyGoerFeed(goerId: ObjectId): GoerFeed {
    const newFeed = <GoerFeed>{};
    newFeed.goerId = goerId;
    newFeed.posts = [];
    return newFeed;
}

export interface GetPostPromise {
    activePost: boolean;
    post: any;
}