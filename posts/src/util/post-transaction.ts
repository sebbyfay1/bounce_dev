import { databaseClient, NotFoundError } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

import { GoerPosts, Post } from '../models/goer-posts';

export class PostTransactions {
    static deleteEntryFromFollowsArray(objectId: ObjectId, arr: ObjectId[]): ObjectId[] {
        for (var index = 0; index < arr.length; index++) {
            if (arr[index] === objectId) {
                arr.splice(index, 1)
                break;
            }
        }
        return arr;
    }

    static async post(goerPosts: GoerPosts, post: Post, goerObjectId: ObjectId): Promise<ObjectId> {
        const postsCollection = databaseClient.client.db('bounce_dev1').collection('posts');
        const goerPostsCollection = databaseClient.client.db('bounce_dev1').collection('goerPosts');
        var insertedPostId: ObjectId | null;
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                const postCreatedResult = await postsCollection.insertOne(post, { session });
                insertedPostId = postCreatedResult.insertedId;
                goerPosts.posts.push(insertedPostId);
                goerPosts.numPosts += 1;
                const updatedGoerPostsResult = await goerPostsCollection.replaceOne({ goerId: goerObjectId }, goerPosts, { session, upsert: true });
                if (!updatedGoerPostsResult.matchedCount && !updatedGoerPostsResult.upsertedCount) {
                    throw new NotFoundError();
                }
            });
            await session.commitTransaction();
        } catch (err) {
            insertedPostId = null;
            throw err;
        } finally { 
            await session.endSession();
        }

        return new Promise((resolve, reject) => {
            if (insertedPostId) {
                return resolve(insertedPostId);
            }
            return reject();
        });
    }

    static async deletePost(goerPosts: GoerPosts, goerObjectId: ObjectId, postId: ObjectId) {
        const postsCollection = databaseClient.client.db('bounce_dev1').collection('posts');
        const goerPostsCollection = databaseClient.client.db('bounce_dev1').collection('goerPosts');
        const session = databaseClient.client.startSession();
        try {
            await session.withTransaction(async () => {
                const deletePostResult = await postsCollection.deleteOne({ _id: postId }, { session });
                if (!deletePostResult.deletedCount) {
                    throw new NotFoundError();
                }
                goerPosts.posts = this.deleteEntryFromFollowsArray(postId, goerPosts.posts);
                goerPosts.numPosts -= 1;
                const updatedGoerPostsResult = await goerPostsCollection.replaceOne({ goerId: goerObjectId }, goerPosts, { session });
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