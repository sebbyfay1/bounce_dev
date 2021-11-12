import { Message } from 'node-nats-streaming';
import { Listener, Subjects, PostCreatedEvent, databaseClient } from '@bouncedev1/common';

import { FeedTransactions } from '../util/feed-transactions';

export class PostCreatedListener extends Listener<PostCreatedEvent> {
  readonly subject = Subjects.PostCreated;
  queueGroupName = 'feeder-service';
  
  async onMessage(data: PostCreatedEvent['data'], msg: Message) {
    if (!data.followers.length) { 
      msg.ack();
      return; 
    }
    const session = databaseClient.client.startSession();
    var requests: Promise<void>[] = [];
    data.followers.forEach((follow) => {
      if (follow.status === '1') {
        requests.push(FeedTransactions.addPostToFeed(follow.goerId, data.post, session));
      }
    });
    await Promise.all(requests)
    .then(async () => {
      await session.commitTransaction();
      msg.ack();
    })
    .catch(async (error) => {
      console.log('Unable to add post to all followers feeds', error);
      await session.abortTransaction();
    })
    .finally(async () => {
      await session.endSession();
    });
  }
}
