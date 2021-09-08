import { Publisher, Subjects, PostUpdatedEvent } from '@bouncedev1/common';

export class PostUpdatedPublisher extends Publisher<PostUpdatedEvent> {
  readonly subject = Subjects.PostUpdated;
}
