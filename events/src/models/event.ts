import { ObjectId } from 'mongodb';

export interface Event {
    hostId: ObjectId;
    hostIsGoer: boolean;
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
    mediaUrl: string;
}

export interface GoerEvents {
    goerId: ObjectId;
    events: ObjectId[];
}

export function createEmptyGoerEvents(goerId: ObjectId): GoerEvents {
    const goerEvents = <GoerEvents>{};
    goerEvents.goerId = goerId;
    goerEvents.events = [];
    return goerEvents;
}