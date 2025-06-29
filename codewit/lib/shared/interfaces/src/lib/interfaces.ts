// Interface For Video Object

interface Exercise {
  prompt: string;
  topic: string;
  tags: string[];
  language: string;
  referenceTest: string;
}

interface ExerciseResponse {
  prompt: string;
  topic: string;
  tags: string[];
  language: string;
  referenceTest: string;
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
  exercises: number[]
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
}

export interface StudentModule {
  uid: number,
  topic: string,
  language: string,
  resources: StudentResource[];
  demos: StudentDemo[],
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

export type {
  Exercise,
  ExerciseResponse,
  ExerciseFormData,
  Demo,
  Tag,
  SelectedTag,
  DemoPostResponse,
  DemoResponse,
  DemoFormData,
  YouTubeSearchResult,
  Thumbnail,
  Resource,
  Course,
  Module,
  User
};
