import { Message } from 'node-nats-streaming';
import { Listener, Subjects, PostDeletedEvent, databaseClient } from '@bouncedev1/common';

import { FeedTransactions } from '../util/feed-transactions';

export class PostCreatedListener extends Listener<PostCreatedEvent> {
  readonly subject = Subjects.PostDeleted;
  queueGroupName = 'feeder-service';
  
  onMessage(data: PostDeletedEvent['data'], msg: Message) {
    const session = databaseClient.client.startSession();
    var requests: Promise<void>[] = [];
    data.followers.forEach((followerId) => {
      requests.push(FeedTransactions.DeletePostInFeed(followerId, data.postId, session));
    });
    Promise.all(requests)
    .then(async () => {
      await session.commitTransaction();
      msg.ack();
    })
    .catch(async (error) => {
      console.log('Unable to delete post from all follower feeds', error);
      await session.abortTransaction();
      throw error;
    })
    .finally(async () => {
      await session.endSession();
    });
  }
}
