// Interface For Video Object

interface Exercise {
  uid: number
  prompt: string;
  topic: string;
  tags: string[];
  language: string;
  referenceTest: string;
  starterCode: string;
}

interface ExerciseResponse {
  prompt: string;
  topic: string;
  tags: string[];
  language: string;
  referenceTest: string;
  starterCode: string;
  uid: number;
}

interface ExerciseFormData{
  exercise: { prompt: string };
  isEditing: boolean;
  editingUid: number;
  selectedLanguage: string;
  topic: string;
  selectedTags: { label: string, value: string }[];
  referenceTest: string;
  starterCode: string;
}

interface Demo {
  youtube_id: string;
  youtube_thumbnail: string;
  title: string;
}

interface DemoPostResponse {
  likes: number;
  uid: number;
  title: string;
  youtube_id: string;
  updatedAt: string;
  createdAt: string;
  tags?: Tag[];
  language?: string;
}

interface Tag {
  value: any;
  uid?: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SelectedTag {
  value: number;
  label: string;
}

interface DemoResponse {
  uid: number,
  title: string,
  topic: string,
  tags: string[],
  language: string,
  youtube_id: string,
  youtube_thumbnail: string,
  exercises: DemoExercise[]
}

interface DemoExercise {
  uid: number,
  prompt: string,
}

interface DemoFormData {
  uid: number | undefined;
  youtube_id: string;
  youtube_thumbnail: string;
  title: string;
  topic: string;
  tags: string[];
  language: string;
  exercises: string[];
}

interface Resource {
  url: string;
  title: string;
  source: string;
  likes: number;
  uid?: number
}

interface Course {
  id: string;
  title: string;
  enrolling: boolean,
  auto_enroll: boolean,
  language: string;
  modules: Module[];
  instructors: Array<{
    uid: number;
    username: string;
    email: string;
  }>;
  roster: Array<{
    uid: number;
    username: string;
    email: string;
  }>;
}

interface Module {
  demos: any;
  uid: number | undefined;
  topic: string;
  language: string;
  resources: Resource[];
  completion: number;
}


interface User {
  uid: number;
  username: string;
  googleId: string;
  email: string;
  isAdmin: boolean;
}

export interface StudentDemo {
  uid: number,
  title: string,
  youtube_id: string,
  youtube_thumbnail: string,
  completion: number,
}

export interface StudentModule {
  uid: number,
  topic: string,
  language: string,
  resources: StudentResource[];
  demos: StudentDemo[],
  completion: number,
}

export interface StudentResource {
  uid: number,
  likes: number,
  url: string,
  title: string,
  source: string,
}

export interface StudentUser {
  uid: number;
  username: string;
  email: string;
}

export interface StudentCourse {
  id: string,
  title: string,
  language: string,
  modules: StudentModule[],
  instructors: StudentUser[],
}

export interface StudentProgress {
  studentUid: number;
  studentName: string;
  completion: number;
}

export interface TeacherCourse{
  id: string,
  title: string,
  language: string,
  modules: StudentModule[],
}

// Interface to Youtube API Response

interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: Thumbnail;
      medium: Thumbnail;
      high: Thumbnail;
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface AttemptDTO {
  uid: number;
  submissionNumber: number;
  completionPercentage: number;
}

interface AttemptResult {
  attempt: AttemptDTO;
  updatedModules: {
    moduleUid: number;
    completion: number;
  }[];
}

// Payload sent when creating a NEW exercise (no uid yet)
export type ExerciseInput = Omit<Exercise, 'uid'>;

export type ModuleDraft = Omit<Module, 'completion'>;

export type {
  AttemptDTO,
  AttemptResult,
  Course,
  Exercise,
  ExerciseResponse,
  ExerciseFormData,
  Demo,
  DemoPostResponse,
  DemoResponse,
  DemoFormData,
  Module,
  Resource,
  SelectedTag,
  User,
  Tag,
  Thumbnail,
  YouTubeSearchResult
};
