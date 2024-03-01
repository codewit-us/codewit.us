import { useState, useEffect, useRef } from 'react';

interface YouTubeSearchResult {
  id: { videoId: string };
  snippet: { title: string };
}

interface VideoSelectProps {
  onSelectVideo: (videoId: string) => void;
  selectedVideoId: string;
}

const VideoSelect = ({ onSelectVideo, selectedVideoId }: VideoSelectProps): JSX.Element => {
  const [videos, setVideos] = useState<YouTubeSearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    const selectedVideo = videos.find(video => video.id.videoId === selectedVideoId);
    setSelectedVideoTitle(selectedVideo ? selectedVideo.snippet.title : '');
  }, [selectedVideoId, videos]);

  const filteredVideos = videos.filter(video =>
    video.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (videoId: string, videoTitle: string) => {
    onSelectVideo(videoId);
    setSelectedVideoTitle(videoTitle);
    setIsOpen(false); 
    setSearchTerm('');
  };

  return (
    <div className="mb-5" ref={wrapperRef}>
      <label htmlFor="youtube_id" className="block mb-2 text-sm font-medium text-white">Select YouTube Video</label>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={selectedVideoTitle || searchTerm}
                onChange={(e) => {setSelectedVideoTitle(''), setSearchTerm(e.target.value)}}
                onFocus={() => setIsOpen(true)}
                placeholder="Search for a video"
                required
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
              </svg>
            </div>
            {isOpen && (
              <ul className="absolute z-10 bg-gray-700 border border-gray-600 text-white text-sm rounded-md w-full max-h-60 overflow-auto">
                {filteredVideos.map((video) => (
                  <li
                    key={video.id.videoId}
                    onClick={() => handleSelect(video.id.videoId, video.snippet.title)}
                    className="p-2 hover:bg-gray-600 cursor-pointer"
                  >
                    {video.snippet.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoSelect;
