// Interface For Video Object

interface Exercise {
  demo_uid: number;
  prompt: string;
}

interface ExerciseResponse {
  uid: number;
  topic: string;
  prompt: string;
  updatedAt: string;
  createdAt: string;
  language: string | {name:string;};
  tags: Tag[];
  testing_script: string;
}

interface Demo {
  youtube_id: string;
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
  value: string;
  label: string;
}

interface DemoResponse {
  likes: number;
  uid: number;
  title: string;
  topic: string;
  youtube_id: string;
  updatedAt: string;
  createdAt: string;
  exercises: Exercise[];
  tags: Tag[] | string [];
  language: string | {name:string;};
  languageUid: string;
}

interface Resource {
  url: string;
  title: string;
  source: string;
  likes: number;
  uid?: number
}

interface Course {
  title: string;
  language: string;
  modules: string[];
  instructors: number[];
  roster: number[];
  id?: string | number;
}

interface Module {
  language: string;
  topic: string;
  demos?: DemoResponse[];
  resources: string[]; 
  uid?: number;
}

interface User {
  uid: number;
  username: string;
  googleId: string;
  email: string;
  isAdmin: boolean;
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
  Demo,
  Tag,
  SelectedTag,
  DemoPostResponse,
  DemoResponse,
  YouTubeSearchResult, 
  Thumbnail,
  Resource,
  Course,
  Module,
  User
};
