import mongoose, { mongo } from 'mongoose';

export interface HostAttrs {
    username: string,
    isGoer: boolean
}