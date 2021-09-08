import { Publisher, Subjects, PostCreatedEvent } from '@bouncedev1/common';

export class PostCreatedPublisher extends Publisher<PostCreatedEvent> {
  readonly subject = Subjects.PostCreated;
}
