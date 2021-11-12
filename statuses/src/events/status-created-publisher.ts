import { Publisher, Subjects, StatusCreatedEvent } from '@bouncedev1/common';

export class StatusCreatedPublisher extends Publisher<StatusCreatedEvent> {
  readonly subject = Subjects.StatusCreated;
}
