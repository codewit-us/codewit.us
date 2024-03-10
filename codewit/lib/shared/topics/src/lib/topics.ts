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

  private findFullPath(node: TopicNode, topic: string, path: string[] = []): string[] | null {
    // checks if the current node has the topic directly
    if (node.hasOwnProperty(topic)) return [...path, topic];

    // recursively searches through child nodes for the topic
    for (const key of Object.keys(node)) {
        const fullPath = this.findFullPath(node[key], topic, [...path, key]); 
        if (fullPath) return fullPath; 
    }
    return null; // not found :(
  }

  public distance(otherTopic: string): number {
      // check if the topics are in tree 
      if (!this.chosenTopic || !this.findTopic(this.topicsTree, otherTopic)) return -1;

      // retrieves full paths from root to both the chosen topic and otherTopic
      const pathToChosen = this.findFullPath(this.topicsTree, this.chosenTopic);
      const pathToOther = this.findFullPath(this.topicsTree, otherTopic);

      if (!pathToChosen || !pathToOther) return -1;

      // calculate the length of the common path segment
      let commonPathLength = 0;
      while (commonPathLength < pathToChosen.length && commonPathLength < pathToOther.length && pathToChosen[commonPathLength] === pathToOther[commonPathLength]) {
          commonPathLength++; 
      }

      // topics are direct siblings or parent-child, return 1
      if (pathToChosen.length - commonPathLength <= 1 && pathToOther.length - commonPathLength <= 1) {
          return 1;
      }

      // calculate distance as sum of steps from each topic to the divergence point
      return (pathToChosen.length - commonPathLength) + (pathToOther.length - commonPathLength);
  }
}

export default topic;
