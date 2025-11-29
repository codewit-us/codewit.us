// codewit/client/src/components/form/VideoSelect.tsx
import { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { SelectStyles } from '../../utils/styles.js';
import { useQuery } from '@tanstack/react-query';
import { Label } from 'flowbite-react';
import { VideoOption, use_yt_videos } from "../../hooks/yt_videos";

interface VideoSelectProps {
  youtube_id: string,
  required?: boolean,
  onSelectVideo: (videoId: string, videoThumbnail: string) => void,
}

const VideoSelect = ({ youtube_id, required = false, onSelectVideo }: VideoSelectProps): JSX.Element => {
  const [selected_option, set_selected_option] = useState<VideoOption | null>(null);

  const {data: videos, isFetching, error} = use_yt_videos();

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
