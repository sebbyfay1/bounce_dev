import { Publisher, Subjects, PostDeletedEvent } from '@bouncedev1/common';

export class PostDeletedPublisher extends Publisher<PostDeletedEvent> {
  readonly subject = Subjects.PostDeleted;
}
