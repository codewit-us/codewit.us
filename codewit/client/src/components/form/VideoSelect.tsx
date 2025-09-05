// codewit/client/src/components/form/VideoSelect.tsx
import { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { SelectStyles } from '../../utils/styles.js';
import { useQuery } from '@tanstack/react-query';
import { Label } from 'flowbite-react';

interface VideoSelectProps {
  youtube_id: string,
  required?: boolean,
  onSelectVideo: (videoId: string, videoThumbnail: string) => void,
}

interface VideoOption {
  value: string,
  label: string,
  thumbnail: string,
}

const VideoSelect = ({ youtube_id, required = false, onSelectVideo }: VideoSelectProps): JSX.Element => {
  const [selected_option, set_selected_option] = useState<VideoOption | null>(null);

  const {data: videos, isFetching, error} = useQuery({
    queryKey: ["youtube_videos"],
    queryFn: async (): Promise<VideoOption[]> => {
      const apiKey = import.meta.env.VITE_KEY;
      const channelId = import.meta.env.VITE_CHANNEL_ID;

      let rtn = [];
      let next_page_token: string | null = null;

      while (true) {
        // results are paginated so if we are to show all of the videos in the
        // select then we will need to retrieve all of the videos.
        let url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&type=video&maxResults=50`;

        if (next_page_token != null) {
          url += `&pageToken=${next_page_token}`;
        }

        const response = await axios.get(url);

        if (response.data.error) {
          throw new Error(response.data.error.message);
        }

        for (let item of response.data.items) {
          rtn.push({
            value: item.id.videoId,
            label: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
          });
        }

        if (response.data.nextPageToken != null) {
          next_page_token = response.data.nextPageToken;
        } else {
          break;
        }
      }

      return rtn;
    },
    // reduce the amount of times we will make the requests by caching the
    // results.
    staleTime: 5* 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  useEffect(() => {
    if (youtube_id && videos != null) {
      const found = videos.find(video => {
        return video.value === youtube_id
      });

      set_selected_option(found || null);
    }
  }, [youtube_id, videos]);

  return (
    <div className="space-y-2">
      <Label htmlFor="youtube_id">
        YouTube Video {required ? <span className="text-red-500">*</span> : null}
      </Label>
      {error ? (
        <div className="text-red-500">Failed to fetch videos. Please try again later.</div>
      ) : (
        <Select
          id="youtube_id"
          value={selected_option ?? undefined}
          placeholder={isFetching ? "Loading..." : "Select YouTube Video."}
          onChange={(selected) => {
            if (selected != null) {
              set_selected_option(selected);
              onSelectVideo(selected.value, selected.thumbnail);
            }
          }}
          options={videos}
          className="text-sm bg-blue text-white border-none w-full rounded-lg"
          styles={SelectStyles}
          isDisabled={isFetching}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          menuPlacement="auto"
        />
      )}
    </div>
  );
};

export default VideoSelect;