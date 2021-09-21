import { ObjectId } from 'mongodb';

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