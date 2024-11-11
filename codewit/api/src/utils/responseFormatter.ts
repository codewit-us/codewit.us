import { Course, Demo, Exercise, Module, User } from '../models';
import { ModuleResponse, ExerciseResponse, CourseResponse, ResourceResponse, DemoResponse } from '../typings/response.types';

export function formatModuleResponse(
  module: Module
): ModuleResponse {
  const {
    uid,
    topic,
    language,
    resources,
  } = module;

  return {
    uid,
    topic,
    language: language.name,
    resources: resources.map(resource => resource.uid),
  };
}

export function formatExerciseResponse(
  exercise: Exercise
): ExerciseResponse {
  const {
    uid,
    topic,
    prompt,
    referenceTest,
    language,
    tags,
  } = exercise;

  return {
    uid,
    topic,
    language: language.name,
    tags: tags.map(tag => tag.name),
    prompt,
    referenceTest,
  };
}

export function formatCourseResponse(course: Course): CourseResponse {
  const {
    id,
    title,
    language,
    modules,
    instructors,
    roster,
  } = course;

  return {
    id,
    title,
    language: language.name,
    modules: modules.map(module => module.uid),
    instructors: instructors.map(instructor => instructor.uid),
    roster: roster.map(user => user.uid),
  };
}

export function formatResourceResponse(
  resource: {uid: number, likes: number, url: string, title: string, source: string, createdAt?: string; updatedAt?: string }
): ResourceResponse {
  const {createdAt, updatedAt, ...filteredResource} = resource;
  return filteredResource;
}

export function formatDemoResponse(
  demo: Demo
): DemoResponse {
  return {
    uid: demo.uid,
    title: demo.title,
    topic: demo.topic,
    tags: demo.tags.map(each => each.name),
    language: demo.language.name,
    youtube_id: demo.youtube_id,
    exercises: demo.exercises ? demo.exercises.map(each => each.uid) : [],
  }
}