import { Course, Demo, Exercise, Module, Resource } from '../models';
import { ModuleResponse, ExerciseResponse, CourseResponse, ResourceResponse, DemoResponse, ResourceType } from '../typings/response.types';

function formatResponse<T, R>(input: T[], formatter: (item: T) => R): R[];
function formatResponse<T, R>(input: T, formatter: (item: T) => R): R;
function formatResponse<T, R>(
  input: T | T[],
  formatter: (item: T) => R
): R | R[] {
  if (Array.isArray(input)) {
    return input.map(formatter);
  } else {
    return formatter(input);
  }
}

export function formatSingleModule(
  module: Module
): ModuleResponse {
  return {
    uid: module.uid,
    topic: module.topic,
    language: module.language.name,
    resources: module.resources.map(resource => resource.uid),
    demos: module.demos ? module.demos.map(demo => ({
      uid: demo.uid,
      title: demo.title,
      youtube_id: demo.youtube_id,
    })) : [],
  };
}

export function formatSingleExercise(
  exercise: Exercise
): ExerciseResponse {
  return {
    uid: exercise.uid,
    topic: exercise.topic,
    language: exercise.language?.name || '',
    tags: exercise.tags?.map(tag => tag.name) || [],
    prompt: exercise.prompt,
    referenceTest: exercise.referenceTest,
  };
}

function formatSingleCourse(course: Course): CourseResponse {
  return {
    id: course.id,
    title: course.title,
    language: course.language.name,
    modules: course.modules.map(module => module.uid),
    instructors: course.instructors.map(instructor => instructor.uid),
    roster: course.roster.map(user => user.uid),
  };
}

export function formatSingleDemo(
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

const formatSingleResource = (res: Resource): ResourceResponse => {
  const plainRes = res.get({ plain: true }) as ResourceType;
  const { createdAt, updatedAt, ...filteredResource } = plainRes;
  return filteredResource;
};

export function formatModuleResponse(module: Module): ModuleResponse;
export function formatModuleResponse(module: Module[]): ModuleResponse[];
export function formatModuleResponse(
  module: Module | Module[]
): ModuleResponse | ModuleResponse[] {
  return formatResponse(module, formatSingleModule);
}

export function formatExerciseResponse(exercise: Exercise): ExerciseResponse;
export function formatExerciseResponse(exercise: Exercise[]): ExerciseResponse[];
export function formatExerciseResponse(
  exercise: Exercise | Exercise[]
): ExerciseResponse | ExerciseResponse[] {
  return formatResponse(exercise, formatSingleExercise);
}

export function formatCourseResponse(course: Course): CourseResponse;
export function formatCourseResponse(course: Course[]): CourseResponse[];
export function formatCourseResponse(
  course: Course | Course[]
): CourseResponse | CourseResponse[] {
  return formatResponse(course, formatSingleCourse);
}

export function formatResourceResponse(resource: Resource): ResourceResponse;
export function formatResourceResponse(resource: Resource[]): ResourceResponse[];
export function formatResourceResponse(
  resource: Resource | Resource[]
): ResourceResponse | ResourceResponse[] {
  return formatResponse(resource, formatSingleResource);
}

export function formatDemoResponse(demo: Demo[]): DemoResponse[];
export function formatDemoResponse(demo: Demo): DemoResponse;
export function formatDemoResponse(
  demo: Demo | Demo[]
): DemoResponse | DemoResponse[] {
  return formatResponse(demo, formatSingleDemo);
}