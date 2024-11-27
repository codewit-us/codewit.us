import { format } from 'path';
import { Course, Demo, Exercise, Module, Resource } from '../models';
import { ModuleResponse, ExerciseResponse, CourseResponse, ResourceResponse, DemoResponse, ResourceType, UserResponse} from '../typings/response.types';

function formatResponse<T, R>(input: T[], formatter: (item: T) => R): R[];
function formatResponse<T, R>(input: T, formatter: (item: T) => R): R;
function formatResponse<T, R>(
  input: T | T[],
  formatter: (item: T, ...args: any[]) => R,
  ...args: any[]
): R | R[] {
  if (Array.isArray(input)) {
    return input.map(item => formatter(item as T, ...args));
  } else {
    return formatter(input as T, ...args);
  }
}

export function formatSingleModule(
  module: Module
): ModuleResponse {
  return {
    uid: module.uid,
    topic: module.topic,
    language: module.language.name,
    resources: module.resources.map(resource => formatSingleResource(resource)),
    demos: module.demos ? module.demos.map(demo => ({
      uid: demo.uid,
      title: demo.title,
      youtube_id: demo.youtube_id,
      youtube_thumbnail: demo.youtube_thumbnail,
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

function formatSingleCourse(course: Course, isGetStudent = false): CourseResponse {

  const filterUser = (user: any): UserResponse => ({
    uid: user.uid,
    username: user.username,
    email: user.email,
  });

  const filterModule = (module: Module): ModuleResponse | number => {
    if (!isGetStudent) {
      return module.uid;
    }

    return {
      uid: module.uid,
      topic: module.topic,
      language: module.language.name,
      demos: module.demos?.map((demo) => ({
        uid: demo.uid,
        title: demo.title,
        youtube_id: demo.youtube_id,
        youtube_thumbnail: demo.youtube_thumbnail,
      })) || [],
      resources: module.resources.map((resource) => formatSingleResource(resource)),
    };
  };

  return {
    id: course.id,
    title: course.title,
    language: course.language.name,
    modules: isGetStudent
      ? course.modules.map((module) => filterModule(module) as ModuleResponse)
      : course.modules.map((module) => filterModule(module) as number),
    instructors: course.instructors.map((instructor) => filterUser(instructor)),
    roster: course.roster.map((user) => filterUser(user)),
  };
}

export function formatSingleDemo(
  demo: Demo
): DemoResponse {
  return {
    uid: demo.uid,
    title: demo.title,
    topic: demo.topic,
    tags: demo.tags.map(tag => tag.name),
    language: demo.language.name,
    youtube_id: demo.youtube_id,
    youtube_thumbnail: demo.youtube_thumbnail,
    exercises: demo.exercises ? demo.exercises.map(each => each.uid) : [],
  }
}

const formatSingleResource = (res: Resource): ResourceResponse => {
  const plainRes = res.get({ plain: true }) as ResourceType;
  const { createdAt, updatedAt, ModuleResources, ...filteredResource } = plainRes;
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

export function formatCourseResponse(course: Course, isGetStudent?: boolean): CourseResponse;
export function formatCourseResponse(course: Course[], isGetStudent?: boolean): CourseResponse[];
export function formatCourseResponse(
  course: Course | Course[],
  isGetStudent: boolean = false
): CourseResponse | CourseResponse[] {
  return formatResponse(course, (item: Course) => formatSingleCourse(item, isGetStudent));
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