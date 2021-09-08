import { Message } from 'node-nats-streaming';
import { Listener, Subjects, PostCreatedEvent, databaseClient } from '@bouncedev1/common';

import { FeedTransactions } from '../util/feed-transactions';

export class PostCreatedListener extends Listener<PostCreatedEvent> {
  readonly subject = Subjects.PostCreated;
  queueGroupName = 'feeder-service';
  
  onMessage(data: PostCreatedEvent['data'], msg: Message) {
    const session = databaseClient.client.startSession();
    var requests: Promise<void>[] = [];
    data.followers.forEach((followerId) => {
      requests.push(FeedTransactions.addPostToFeed(followerId, data.post, session));
    });
    Promise.all(requests)
    .then(async () => {
      await session.commitTransaction();
      msg.ack();
    })
    .catch(async (error) => {
      console.log('Unable to add post to all followers feeds', error);
      await session.abortTransaction();
      throw error;
    })
    .finally(async () => {
      await session.endSession();
    });
  }
}
