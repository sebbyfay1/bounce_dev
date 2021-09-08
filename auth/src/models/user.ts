import { ObjectId } from 'mongodb';

export interface UserAttrs {
    email: string,
    username: string,
    password: string,
    userId: ObjectId,
    isGoer: boolean
}