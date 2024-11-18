export interface ModuleResponse {
    uid: number;
    topic: string;
    language: string;
    resources: number[];
    demos: {
        uid: number;
        title: string;
        youtube_id: string;
    }[] | [];
}

export interface ExerciseResponse {
    uid: number;
    topic: string;
    language: string;
    tags: string[];
    prompt: string;
    referenceTest: string;
}

export interface CourseResponse {
    id: string;
    title: string;
    language: string;
    modules: number[];
    roster: number[];
    instructors: number[];
}

export type ResourceType = {
    uid: number;
    likes: number;
    url: string;
    title: string;
    source: string;
    createdAt?: string;
    updatedAt?: string;
};

export type ResourceResponse = Omit<ResourceType, 'createdAt' | 'updatedAt'>;

export interface DemoResponse {
    uid: number,
    title: string,
    topic: string,
    tags: string[],
    language: string,
    youtube_id: string,
    exercises: number[]
}