import { Attempt } from "../models";
import { EvaluationResponse } from "../utils/codeEvalService"

export interface ModuleResponse {
    uid: number;
    topic: string;
    language: string;
    resources: ResourceResponse[];
    demos: {
        uid: number;
        title: string;
        youtube_id: string;
        youtube_thumbnail: string;
    }[] | [];
}

export interface ExerciseResponse {
    uid: number;
    topic: string;
    language: string;
    tags: string[];
    prompt: string;
    referenceTest: string;
    starterCode: string;
}

export interface CourseResponse {
    id: string;
    title: string;
    enrolling: boolean,
    auto_enroll: boolean,
    language: string;
    modules: ModuleResponse[] | number[];
    roster: UserResponse[];
    instructors: UserResponse[];
}

export interface UserResponse {
    uid: number;
    username: string;
    email: string;
}

export type ResourceType = {
    uid: number;
    likes: number;
    url: string;
    title: string;
    source: string;
    createdAt?: string;
    updatedAt?: string;
    ModuleResources?: any[];
};

export type ResourceResponse = Omit<ResourceType, 'createdAt' | 'updatedAt' | 'ModuleResources'>;

export interface DemoResponse {
    uid: number,
    title: string,
    topic: string,
    tags: string[],
    language: string,
    youtube_id: string,
    youtube_thumbnail: string,
    exercises: DemoExercise[]
}

export interface DemoExercise {
    uid: number,
    prompt: string,
}

export interface AttemptWithEval {
  attempt: {
    uid: number;
    submissionNumber: number;
    completionPercentage: number;
  };
  updatedModules: { moduleUid: number; completion: number }[];
  evaluation: EvaluationResponse;
}
