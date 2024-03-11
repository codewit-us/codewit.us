import { before } from "node:test";
import topic from "./topics"

describe('smoke test', () => {

  it('should return true', () => {
    expect(true).toEqual(true);
  });

  it('should return false', () => {
    expect(false).toEqual(false);
  });

});

describe('test set & get in topic class', () => {
  
  let topicObj: topic;
  beforeEach(() => {
    topicObj = new topic();
  });

  it('create a topic obj and set a valid value', () => {
    topicObj.setTopic("console io");
    expect(topicObj.getTopic()).toEqual("console io");
  });

  it('create a topic obj and set invalid value', () => {
    topicObj.setTopic("this does not exist!");
    expect(topicObj.getTopic()).toEqual(undefined);
  });

  it('create a topic obj and set a valid value then invalid', () => {
    topicObj.setTopic("object");
    expect(topicObj.getTopic()).toEqual("object");
    topicObj.setTopic("this does not exist!");
    expect(topicObj.getTopic()).toEqual(undefined);
    topicObj.setTopic("console io");
    expect(topicObj.getTopic()).toEqual("console io");
  });

});

describe('test distance in topic class', () => {

  let topicObj: topic;
  beforeEach(() => {
    topicObj = new topic();
  });

  it('check distance between a topic and itself', () => {
    topicObj.setTopic("console io");
    expect(topicObj.distance("console io")).toEqual(0);
  });

  it('check distance between topic and undefined topic', () => {
    topicObj.setTopic("console io");
    expect(topicObj.distance("i don't exist!")).toEqual(-1);
  });

  it('check distance between undefined topic and defined topic', () => {
    topicObj.setTopic("i don't exist!");
    expect(topicObj.distance("console io")).toEqual(-1);
  });

  it('check distance between undefined topic and undefined topic', () => {
    topicObj.setTopic("i don't exist!");
    expect(topicObj.distance("i also don't exist!")).toEqual(-1);
  });

  it('check distance between topic and parent topic', () => {
    topicObj.setTopic("console io");
    expect(topicObj.distance("input output")).toEqual(1);
  }); 

  it('check distance between topic and sibling topic', () => {
    topicObj.setTopic("console io");
    expect(topicObj.distance("file io")).toEqual(1);
  }); 

  it('check distance between topic and multiple topic', () => {
    topicObj.setTopic("console io");
    expect(topicObj.distance("input output")).toEqual(1);
    expect(topicObj.distance("operation")).toEqual(2);
    expect(topicObj.distance("arithmetic")).toEqual(3);
    expect(topicObj.distance("boolean expression")).toEqual(4);
  }); 

});
