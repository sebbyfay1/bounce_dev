import { Publisher, Subjects, AttendingEventEvent } from '@bouncedev1/common';

export class AttendingEventPublisher extends Publisher<AttendingEventEvent> {
  readonly subject = Subjects.EventAttending;
}
