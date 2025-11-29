import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export interface VideoOption {
    value: string,
    label: string,
    thumbnail: string,
}

export function yt_video_key(): ["youtube_videos"] {
    return ["youtube_videos"]
}

export function use_yt_videos() {
    return useQuery({
        queryKey: yt_video_key(),
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
}
