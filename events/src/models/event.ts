import { ObjectId } from 'mongodb';

export interface Event {
    hostId: ObjectId;
    isGoer: boolean;
    created: number;
    hostName: string;

    name: string;
    description: string;
    address: string;
    startDate: string;
    endDate: string;
    startTime: String;
    endTime: String;

    isPublic: boolean;
    mediaUrls: string[];

    followers: {};
    goers: {};
}