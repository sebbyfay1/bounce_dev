import { ObjectId } from 'mongodb';

export interface Status {
    goerId: ObjectId;
    postType: string;
    eventId: ObjectId;
    created: number;
}

export interface Post {
    goerId: ObjectId;
    postType: string;
    mediaUrl: string;
    eventId: ObjectId;
    caption: string;
    created: number;
    comments: string[];
}

export interface GoerPosts {
    goerId: ObjectId;
    numPosts: number;
    posts: ObjectId[]
};

export interface GetPostPromise {
    activePost: boolean;
    post: any;
}

export function CreateEmptyGoerPosts(goerId: ObjectId): GoerPosts {
    var goerPosts = <GoerPosts>{};
    goerPosts.goerId = goerId;
    goerPosts.numPosts = 0;
    goerPosts.posts = [];
    return goerPosts;
}