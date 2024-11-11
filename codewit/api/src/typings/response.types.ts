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

export interface ResourceResponse {
    uid: number,
    title: string,
    source: string,
    likes: number,
    url: string
}

export interface DemoResponse {
    uid: number,
    title: string,
    topic: string,
    tags: string[],
    language: string,
    youtube_id: string,
    exercises: number[]
}