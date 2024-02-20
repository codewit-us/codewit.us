import { useState, useEffect } from 'react';
import { YouTubeSearchResult } from 'client/src/interfaces/demo.interface';

interface VideoSelectProps {
  onSelectVideo: (videoId: string) => void;
  selectedVideoId: string;
}

const VideoSelect = ({ onSelectVideo, selectedVideoId }: VideoSelectProps): JSX.Element => {
  const [videos, setVideos] = useState<YouTubeSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    const apiKey = import.meta.env.VITE_KEY;
    const channelId = import.meta.env.VITE_CHANNEL_ID;
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&type=video&maxResults=50`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      setVideos(data.items);
      setError(null);
    } catch (error) {
      setError('Failed to fetch videos. Please try again later.');
      console.error('Failed to fetch videos:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="mb-5">
      <label htmlFor="youtube_id" className="block mb-2 text-sm font-medium text-white">Select YouTube Video</label>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <select
          id="youtube_id"
          name="youtube_id"
          value={selectedVideoId}
          onChange={(e) => onSelectVideo(e.target.value)}
          required
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option value="">Select a video</option>
          {videos.map((video) => (
            <option key={video.id.videoId} value={video.id.videoId}>
              {video.snippet.title}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default VideoSelect;
