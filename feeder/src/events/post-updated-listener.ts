import { Message } from 'node-nats-streaming';
import { Listener, Subjects, PostUpdatedEvent, databaseClient } from '@bouncedev1/common';

import { FeedTransactions } from '../util/feed-transactions';

export class PostUpdatedListener extends Listener<PostUpdatedEvent> {
  readonly subject = Subjects.PostUpdated;
  queueGroupName = 'feeder-service';
  
  onMessage(data: PostUpdatedEvent['data'], msg: Message) {
    const session = databaseClient.client.startSession();
    var requests: Promise<void>[] = [];
    data.followers.forEach((followerId) => {
      requests.push(FeedTransactions.UpdatePostInFeed(followerId, data.post, session));
    });
    Promise.all(requests)
    .then(async () => {
      await session.commitTransaction();
      msg.ack();
    })
    .catch(async (error) => {
      console.log('Unable to update posts in all followers feeds', error);
      await session.abortTransaction();
      throw error;
    })
    .finally(async () => {
      await session.endSession();
    });
  }
}
