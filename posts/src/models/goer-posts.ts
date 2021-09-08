import { ObjectId } from 'mongodb';

export interface Post {
    postId: string;
    mediaUrl: string;
    eventId: ObjectId;
    caption: string;
    created: number;
    comments: [string];
}

export interface GoerPosts {
    goerId: ObjectId;
    goerUsername: string;
    numPosts: number;
    posts: Post[]
};