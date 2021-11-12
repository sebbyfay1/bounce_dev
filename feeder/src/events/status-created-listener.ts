import { Message } from 'node-nats-streaming';
import { Listener, Subjects, PostCreatedEvent, databaseClient, StatusCreatedEvent } from '@bouncedev1/common';

import { FeedTransactions } from '../util/feed-transactions';

export class StatusCreatedListener extends Listener<StatusCreatedEvent> {
  readonly subject = Subjects.StatusCreated;
  queueGroupName = 'feeder-service';
  
  onMessage(data: StatusCreatedEvent['data'], msg: Message) {
    if (!data.followers.length) { 
      msg.ack();
      return; 
    }
    const session = databaseClient.client.startSession();
    var requests: Promise<void>[] = [];
    data.followers.forEach((follow) => {
      if (follow.status === '1') {
        requests.push(FeedTransactions.addStatusToFeed(follow.goerId, data.status, session));
      }
    });
    Promise.all(requests)
    .then(async () => {
      await session.commitTransaction();
      msg.ack();
    })
    .catch(async (error) => {
      console.log('Unable to add status to all followers feeds', error);
      await session.abortTransaction();
    })
    .finally(async () => {
      await session.endSession();
    });
  }
}
