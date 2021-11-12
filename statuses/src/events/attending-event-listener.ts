import { Message } from 'node-nats-streaming';
import { Listener, Subjects, databaseClient, AttendingEventEvent } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

import { StatusTransactions } from '../util/status-transactions';
import { CreateEmptyGoerStatuses, GoerStatuses, Status } from '../models/goer-status';
import { StatusCreatedPublisher } from './status-created-publisher';
import { natsWrapper } from '../nats-wrapper';

export class AttendingEventListener extends Listener<AttendingEventEvent> {
  readonly subject = Subjects.EventAttending;
  queueGroupName = 'statuses-service';
  
  async onMessage(data: AttendingEventEvent['data'], msg: Message) {
    const newStatus = <Status>{}
    newStatus.goerId = ObjectId.createFromHexString(data.goerId);
    newStatus.eventId = ObjectId.createFromHexString(data.eventId);
    newStatus.postType = 'goer.status';
    newStatus.statusType = 'event.attending';
    newStatus.created = Date.now();

    const goerStatusesCollection = databaseClient.client.db('bounce_dev1').collection('goerStatuses');
    var goerStatuses = await goerStatusesCollection.findOne({ goerId: ObjectId.createFromHexString(data.goerId) }) as GoerStatuses;
    if (!goerStatuses) {
      console.log('creating empty goer status');
      goerStatuses = CreateEmptyGoerStatuses(ObjectId.createFromHexString(data.goerId));
    }
    console.log('adding status', goerStatuses, newStatus);
    const insertedStatusId = await StatusTransactions.addStatus(goerStatuses, newStatus, ObjectId.createFromHexString(data.goerId));

    const headers = {
      "jwt": data.jwt
  };
    const response = await fetch(`http://follows-srv:3000/api/follows/goer-followers/${data.goerId}`, { headers: headers });
    const followersJson = await response.json();
    console.log('followers', followersJson);
    if (followersJson.length) {
        await new StatusCreatedPublisher(natsWrapper.client).publish({
            status: insertedStatusId,
            followers: followersJson
          });
    }
    msg.ack();
  }
}
