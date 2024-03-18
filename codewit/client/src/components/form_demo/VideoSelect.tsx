import { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { YouTubeSearchResult } from '@codewit/interfaces'; 

interface VideoSelectProps {
  onSelectVideo: (videoId: string) => void;
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
    axios.get(url)
      .then(response => {
        if (response.data.error) {
          throw new Error(response.data.error.message);
        }
        setVideos(response.data.items.map((item: YouTubeSearchResult) => ({
          value: item.id.videoId,
          label: item.snippet.title
        })));
        setError(null);
      })
      .catch(error => {
        setError('Failed to fetch videos. Please try again later.');
        console.error('Failed to fetch videos:', error);
      });
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleChange = (selectedOption: {value: string, label: string}) => {
    setSelectedOption(selectedOption);
    onSelectVideo(selectedOption.value);
  };

  return (
    <div className="mb-5">
      <label htmlFor="youtube_id" className="block mb-2 text-sm font-medium text-white">Select YouTube Video</label>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Select
          id="youtube_id"
          value={selectedOption}
          onChange={handleChange}
          options={videos}
          className="text-sm bg-blue text-white border-none w-full rounded-lg"
          styles={{
            control: (provided) => ({
              ...provided,
              backgroundColor: 'rgb(55, 65, 81)',
              borderRadius: '0.5rem',
              borderColor: 'rgb(75 85 99)',
              color: 'white !important',
              padding: '2px',
              boxShadow: 'none',
              '&:hover': {
                borderColor: 'rgb(75 85 99)',
                cursor: 'text',
              }
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: 'rgb(55, 65, 81)',
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected ? 'none' : 'none',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgb(75 85 99)',
                cursor: 'pointer',
              }
            }),
            multiValue: (provided) => ({
              ...provided,
              backgroundColor: 'rgb(31 41 55)',
            }),
            multiValueLabel: (provided) => ({
              ...provided,
              color: 'white',
            }),
            multiValueRemove: (provided) => ({
              ...provided,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgb(239 68 68)',
                color: 'white',
              },
            }),
            singleValue: (provided) => ({
              ...provided,
              color: 'white',
            }),
            placeholder: (provided) => ({
              ...provided,
              color: 'white',
            }),
            input: (provided) => ({
              ...provided,
              color: 'white',
            }),
          }}
        />
      )}
    </div>
  );
};

export default VideoSelect;
