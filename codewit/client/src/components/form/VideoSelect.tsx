import { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { SelectStyles } from '../../utils/styles.js';
import { YouTubeSearchResult } from '@codewit/interfaces'; 

interface VideoSelectProps {
  onSelectVideo: (videoId: string, videoThumbnail: string) => void;
  selectedVideoId: string;
}

const VideoSelect = ({ onSelectVideo, selectedVideoId }: VideoSelectProps): JSX.Element => {
  const [videos, setVideos] = useState<YouTubeSearchResult[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    const apiKey = import.meta.env.VITE_KEY;
    const channelId = import.meta.env.VITE_CHANNEL_ID;
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&type=video&maxResults=50`;

    try {
      const response = await axios.get(url);
      if (response.data.error) throw new Error(response.data.error.message);

      setVideos(response.data.items.map((item: YouTubeSearchResult) => ({
        value: item.id.videoId,
        label: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url, 
      })));
      setError(null);
    } catch (err) {
      setError('Failed to fetch videos. Please try again later.');
      console.error('Failed to fetch videos:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (selectedVideoId) {
      const preselectedOption = videos.find(video => video.value === selectedVideoId);
      setSelectedOption(preselectedOption || null);
    }
  }, [selectedVideoId, videos]);  

  const handleChange = (selectedOption: { value: string, label: string, thumbnail: string }) => {
    setSelectedOption(selectedOption);
    onSelectVideo(selectedOption.value, selectedOption.thumbnail);
  };

  return (
    <div className="mb-5">
      <label htmlFor="youtube_id" className="block mb-2 text-sm font-medium text-gray-400">Select YouTube Video</label>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Select
          id="youtube_id"
          value={selectedOption}
          onChange={handleChange}
          options={videos}
          className="text-sm bg-blue text-white border-none w-full rounded-lg"
          styles={SelectStyles}
        />
      )}
    </div>
  );
};

export default VideoSelect;