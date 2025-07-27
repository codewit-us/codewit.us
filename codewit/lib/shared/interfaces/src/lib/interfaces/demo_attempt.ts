export interface DemoAttempt {
    demo: DemoInfo,
    resources: DemoResource[] | null,
    related_demos: RelatedDemo[] | null,
}

export interface DemoResource {
    uid: number,
    url: string,
    title: string,
    source: string,
    liked: boolean,
}

export interface RelatedDemo {
    uid: number,
    title: string,
    topic: string,
    youtube_id: string,
    youtube_thumbnail: string,
    completion: number,
}

export interface DemoInfo {
    uid: number,
    title: string,
    topic: string,
    language: string,
    youtube_id: string,
    youtube_thumbnail: string,
    liked: boolean,
    tags: string[],
    exercises: DemoExercise[],
}

export interface DemoExercise {
    uid: number,
    prompt: string,
    language: string,
    skeleton: string | null,
    completion: number,
}