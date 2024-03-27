import { topic as Topic } from '@codewit/topics';

function validateTopic(topic: string): boolean {
  const _topic = new Topic();
  _topic.setTopic(topic);

  return _topic.getTopic() !== undefined;
}

export { validateTopic };
