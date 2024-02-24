/* v8 ignore next 48 */
// Interface For Video Object

interface Exercise {
  demo_uid: number;
  prompt: string;
}

interface Demo {
  createdAt?: string;
  uid?: string;
  youtube_id: string;
  title: string;
  likes?: number;
  exercises: Exercise[];
  updatedAt?: string;
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

export type { Exercise, Demo, YouTubeSearchResult, Thumbnail };
