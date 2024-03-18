// Interface For Video Object

interface Exercise {
  demo_uid: number;
  prompt: string;
}

interface ExerciseResponse {
  uid: number;
  prompt: string;
  updatedAt: string;
  createdAt: string;
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

interface DemoResponse {
  likes: number;
  uid: number;
  title: string;
  youtube_id: string;
  updatedAt: string;
  createdAt: string;
  exercises: Exercise[];
  tags: Tag[] | string[];
  language: string;
  languageUid: string;
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
  DemoPostResponse,
  DemoResponse,
  YouTubeSearchResult, 
  Thumbnail 
};
