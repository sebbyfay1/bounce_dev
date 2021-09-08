export interface HostAttrs {
    isGoer: boolean,

    name: string,
    description: string,
    tags: string[],

    address: string,
    city: string,
    state: string,

    profilePictureUrls: string[]

    followers: {}
}