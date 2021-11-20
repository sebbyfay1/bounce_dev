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

export function CreatePostFromDoc(doc: any): Post {
    const post = <Post>{};
    post.goerId = doc.goerId;
    post.postType = doc.postType;
    post.mediaUrl = doc.mediaUrl;
    post.eventId = doc.eventId;
    post.caption = doc.caption;
    post.created = doc.created;
    post.comments = doc.comments;
    return post;
}

export interface GoerPosts {
    goerId: ObjectId;
    numPosts: number;
    posts: ObjectId[];
};

export function CreateGoerPostsFromDoc(doc: any): GoerPosts {
    const goerPosts = <GoerPosts>{};
    goerPosts.goerId = doc.goerId;
    goerPosts.numPosts = doc.numPosts;
    goerPosts.posts = doc.posts;
    return goerPosts;
}

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