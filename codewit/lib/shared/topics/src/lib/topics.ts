import topicTree from './topicstree';

type TopicNode = {
  [key: string]: TopicNode;
};

class topic {
  private chosenTopic?: string;
  private readonly topicsTree: TopicNode; 

  constructor() {
    this.topicsTree = topicTree;
  }

  // checks if a topic exists in the tree.
  private findTopic(node: TopicNode, topic: string): boolean {
    if (node.hasOwnProperty(topic)) return true; // direct match at current node
    for (const key of Object.keys(node)) {
      if (this.findTopic(node[key], topic)) return true; // recursively search in child nodes
    }
    return false; // topic not found
  }

  // sets the chosen topic if it's valid otherwise undefined
  public setTopic(topic: string): void {
    this.chosenTopic = this.findTopic(this.topicsTree, topic) ? topic : undefined;
  }

  // returns the current chosen topic
  public getTopic(): string | undefined {
    return this.chosenTopic;
  }

  // recursively finds the path to a topic used for distance calculation
  private findPath(node: TopicNode, topic: string, path: string[] = []): string[] | null {
    if (node.hasOwnProperty(topic)) return [...path, topic]; // path found!!!!!!!!!!!!!
    for (const key of Object.keys(node)) {
      const foundPath = this.findPath(node[key], topic, [...path, key]);
      if (foundPath) return foundPath; // path found in a subtree
    }
    return null; // topic not found in this branch
  }

  // calculates the distance between two paths in the topic tree
  private calculateDistance(path1: string[], path2: string[]): number {
    let i = 0;
    // find length of shared path
    while (i < path1.length && i < path2.length && path1[i] === path2[i]) {
      i++;
    }
    return path1.length + path2.length - 2 * i;
  }

  // calc & returns the distance between the chosen topic and another topic
  public distance(otherTopic: string): number {
    if (!this.chosenTopic || !this.findTopic(this.topicsTree, otherTopic)) return -1;
    const path1 = this.findPath(this.topicsTree, this.chosenTopic) ?? [];
    const path2 = this.findPath(this.topicsTree, otherTopic) ?? [];
    return this.chosenTopic === otherTopic ? 0 : this.calculateDistance(path1, path2);
  }
}

export default topic;
