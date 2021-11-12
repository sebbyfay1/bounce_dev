import { ObjectId } from 'mongodb';

export interface EventFollow {
    eventId: ObjectId;
    created: number;
    status: string; // PUBLIC=1,PRIVATE=2
}

export interface GoerEventFollow {
    goerId: ObjectId;
    created: number;
    status: string; // FOLLOWING=1;ATTENDING=2;MUTE=3;OVER=4
}

export interface GoerEventFollows {
    goerId: ObjectId;
    followingEvents: EventFollow[];
    attendingEvents: EventFollow[];
    pastEvents: EventFollow[];
}

export interface EventFollowers {
    eventId: ObjectId;
    isPublic: boolean;
    numFollowers: number;
    numGoers: number;
    followers: GoerEventFollow[]
    goers: GoerEventFollows[]
}

export interface EventFollowersStats {
    isPublic: boolean;
    numFollowers: number;
    numGoers: number;
}

export function createEmptyGoerEventFollows(goerId: ObjectId): GoerEventFollows {
    var goerEventFollows = <GoerEventFollows>{};
    goerEventFollows.goerId = goerId;
    goerEventFollows.followingEvents = [];
    goerEventFollows.attendingEvents = [];
    goerEventFollows.pastEvents = [];
    return goerEventFollows
}

export function createEmptyEventFollowers(eventId: ObjectId, isPublic: boolean): EventFollowers {
    var eventFollowers = <EventFollowers>{};
    eventFollowers.eventId = eventId;
    eventFollowers.isPublic = isPublic;
    eventFollowers.numFollowers = 0;
    eventFollowers.numGoers = 0;
    eventFollowers.followers = [];
    eventFollowers.goers = [];
    return eventFollowers
}

export function createEmptyEventFollowersStats(eventId: ObjectId, isPublic: boolean): EventFollowersStats {
    var eventFollowers = <EventFollowersStats>{};
    eventFollowers.isPublic = isPublic;
    eventFollowers.numFollowers = 0;
    eventFollowers.numGoers = 0;
    return eventFollowers
}