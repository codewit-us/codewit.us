import { ExerciseGetResponse } from './exercise';

export interface DemoGetResponse {
  uid: number;
  title: string;
  likes: number;
  youtube_id: string;

  exercises?: ExerciseGetResponse[];
}
