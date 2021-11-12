import { ObjectId } from 'mongodb';

export interface Follow {
    goerId: ObjectId;
    created: number;
    status: string; // ACTIVE=1;BLOCKED=2;REQUESTED=3
}

export interface GoerFollows {
    goerId: ObjectId;
    isPrivate: boolean;
    numFollowers: number;
    numFollowing: number;
    following: Follow[];
    followers: Follow[];
    followRequests: Follow[];
    followerRequests: Follow[];
}

export function createEmptyFollows(goerId: ObjectId): GoerFollows {
    var goerFollows = <GoerFollows>{};
    goerFollows.goerId = goerId;
    goerFollows.isPrivate = false;
    goerFollows.numFollowers = 0;
    goerFollows.numFollowing = 0;
    goerFollows.followers = [];
    goerFollows.following = [];
    goerFollows.followers.push({
        goerId: goerId,
        created: Date.now(),
        status: '1'
    });
    goerFollows.following.push({
        goerId: goerId,
        created: Date.now(),
        status: '1'
    });
    goerFollows.followRequests = [];
    goerFollows.followerRequests = [];
    return goerFollows
}