import { ObjectId } from 'mongodb';

export interface Goer {
    userId: ObjectId
    username: string,
    isGoer: boolean,
    isPrivate: boolean,

    firstName: string,
    lastName: string,
    bio: string,
    birthday: Date,

    city: string,

    profilePictureUrl: string
}