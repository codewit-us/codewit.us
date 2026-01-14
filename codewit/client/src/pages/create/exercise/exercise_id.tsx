import { Editor } from "@monaco-editor/react";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import MDEditor from "@uiw/react-markdown-editor";
import axios from "axios";
import { Button, Select, TextInput, Label, ButtonGroup } from "flowbite-react";
import { useState, useEffect } from "react";
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { default as ReactSelect } from  "react-select";
import CreatableSelect from 'react-select/creatable';
import { toast } from "react-toastify";

import {
    ExerciseInput,
    ExerciseResponse,
} from "@codewit/interfaces";
import {
    createExerciseSchema,
    updateExerciseSchema,
} from "@codewit/validations";

import { useAppForm } from "../../../form";
import LoadingPage from "../../../components/loading/LoadingPage";
import { ErrorView } from "../../../components/error/Error";
import TagSelect, { topic_options } from "../../../components/form/TagSelect";
import LanguageSelect from "../../../components/form/LanguageSelect";
import ReusableModal from "../../../components/form/ReusableModal";
import InputLabel from "../../../components/form/InputLabel";
import { isFormValid } from "../../../utils/formValidationUtils";
import { cn, SelectStyles } from "../../../utils/styles";
import { use_single_exercise_query, single_exercise_query_key } from "../../../hooks/useExercise";

type UITag = { label: string; value: string };
type Difficulty = 'easy' | 'hard' | 'worked example';

export function ExerciseIdView() {
    const params = useParams();
    const navigate = useNavigate();
    const client = useQueryClient();

    if (params.exercise_id == null) {
        return <ErrorView title="No UID Provided">
            <p>No exercise uid was provided to the page.</p>
            <Link to="/create/exercise">
                <Button type="button">Back to exercises</Button>
            </Link>
        </ErrorView>;
    }

    if (params.exercise_id === "new") {
        return <ExerciseEdit
            exercise={null}
            on_created={record => {
                client.setQueryData(single_exercise_query_key(record.uid), record);

                navigate(`/create/exercise/${record.uid}`);
            }}
            on_cancel={() => navigate("/create/exercise")}
        />;
    } else {
        let parsed = parseInt(params.exercise_id, 10);

        if (!isNaN(parsed) && parsed > 0) {
            return <ValidExerciseIdView exercise_id={parsed}/>;
        } else {
            return <ErrorView title="Invalid Exercise UID">
                <p>The provided exercise uid is not valid. Make sure that the uid is a valid whole number greater than 0</p>
                <Link to="/create/exercise">
                    <Button type="button">Back to exercises</Button>
                </Link>
            </ErrorView>
        }
    }
}

interface ValidExerciseIdViewProps {
    exercise_id: number
}

export function ValidExerciseIdView({exercise_id}: ValidExerciseIdViewProps) {
    const navigate = useNavigate();
    const client = useQueryClient();

    const { data, isLoading, isFetching, error } = use_single_exercise_query(exercise_id);

    if (isLoading && isFetching) {
        return <LoadingPage/>;
    }

    if (error != null) {
        return <ErrorView>
            <p>There was an error when attempting to load the requested exercise.</p>
            <Link to="/create/exercise">
                <Button type="button">Back to exercises</Button>
            </Link>
        </ErrorView>;
    }

    if (data == null) {
        return <ErrorView title="Exercise Not Found">
            <p>The exercise was not found.</p>
            <Link to="/create/exercise">
                <Button type="button">Back to exercises</Button>
            </Link>
        </ErrorView>;
    }

    return <ExerciseEdit
        exercise={data}
        on_updated={record => client.setQueryData(
            single_exercise_query_key(record.uid),
            record,
        )}
        on_deleted={() => navigate("/create/exercise")}
        on_cancel={() => navigate("/create/exercise")}
    />;
}

interface ExerciseForm {
    uid: number,
    title: string,
    difficulty: string,
    prompt: string,
    topic: string,
    tags: string[],
    language: string,
    referenceTest: string,
    starterCode: string,
}

type FormAction = "send" | "delete";

interface FormMeta {
    action: FormAction,
}

function blank_form(): ExerciseForm {
    return {
        uid: -1,
        prompt: "",
        topic: "",
        tags: [],
        language: "java",
        referenceTest: "",
        starterCode: "",
        title: "",
        difficulty: "",
    };
}

function exercise_to_form(exercise: ExerciseResponse): ExerciseForm {
    return {
        uid: exercise.uid,
        title: exercise.title?.slice() ?? "",
        difficulty: exercise.difficulty?.slice() ?? "",
        prompt: exercise.prompt.slice(),
        topic: exercise.topic.slice(),
        tags: exercise.tags.map(tag => tag.slice()),
        language: exercise.language.slice(),
        referenceTest: exercise.referenceTest.slice(),
        starterCode: exercise.starterCode?.slice() ?? "",
    };
}

interface ExerciseEditProps {
    exercise: ExerciseResponse | null,
    on_created?: (exercise: ExerciseResponse) => void,
    on_updated?: (exercise: ExerciseResponse) => void,
    on_deleted?: () => void,
    on_cancel?: () => void,
}
/*
 * there are multiple ts-ignores in this component as for some reason TS is
 * unable to deduce the types for them when they should be defined. not sure
 * what is the cause as I have done this exact same thing in another project and
 * TS did not complain.
 *
 * TODO: figure out the reason for TS not be able to deduce the types for the
 * various form components below
 */
function ExerciseEdit({
    exercise,
    on_created = () => {},
    on_updated = () => {},
    on_deleted = () => {},
    on_cancel = () => {},
}: ExerciseEditProps) {
    const create_exercise = useMutation({
        mutationFn: async (payload: any) => {
            let result = await axios.post<ExerciseResponse>("/api/exercises", payload, { withCredentials: true });

            return result.data;
        },
        onSuccess: (data, vars, ctx) => {
            toast.success(`Created Exercise: ${data.title ?? data.uid}`);

            on_created(data);
        },
        onError: (err, vars, ctx) => {
            toast.error(`Failed to create exericse`);
        },
    });

    const update_exercise = useMutation({
        mutationFn: async ({ uid, payload }: {uid: number, payload: any}) => {
            let result = await axios.patch<ExerciseResponse>(`/api/exercises/${uid}`, payload, { withCredentials: true });

            return result.data;
        },
        onSuccess: (data, vars, ctx) => {
            toast.success(`Updated Exercise: ${data.title ?? data.uid}`);

            on_updated(data);
        },
        onError: (err, vars, ctx) => {
            toast.error(`Failed to update exercise`);
        },
    });

    const delete_exercise = useMutation({
        mutationFn: async ({ uid }: {uid: number}) => {
            let result = await axios.delete(`/api/exercises/${uid}`, { withCredentials: true });

            return result.data;
        },
        onSuccess: (data, vars, ctx) => {
            toast.success(`Deleted Exercise: ${data.title ?? data.uid}`);

            on_deleted();
        },
        onError: (error, vars, ctx) => {
            toast.error("Failed to delete exercise");
        }
    });

    const form = useAppForm({
        defaultValues: exercise != null ? exercise_to_form(exercise) : blank_form(),
        onSubmitMeta: {
            action: "send"
        } as FormMeta,
        onSubmit: async ({value, meta, formApi}) => {
            if (meta.action === "send") {
                let body = {
                    prompt: value.prompt,
                    topic: value.topic,
                    title: value.title.length === 0 ? undefined : value.title,
                    language: value.language,
                    difficulty: value.difficulty.length === 0 ? undefined : value.difficulty,
                    tags: value.tags,
                    referenceTest: value.referenceTest,
                    starterCode: value.starterCode,
                };

                if (exercise == null) {
                    await create_exercise.mutateAsync(body);
                } else {
                    await update_exercise.mutateAsync({uid: exercise.uid, payload: body});
                }
            } else if (meta.action === "delete") {
                if (exercise != null) {
                    await delete_exercise.mutateAsync({uid: exercise.uid});
                }
            }
        },
        validators: {},
    });

    useEffect(() => {
        if (exercise == null) {
            form.reset(blank_form(), {keepDefaultValues: false});
        } else {
            form.reset(exercise_to_form(exercise), {keepDefaultValues: false});
        }
    }, [exercise?.uid, exercise?.updatedAt])

    return <div className="mx-auto flex flex-col p-6 max-w-6xl gap-4">
        <form.AppForm>
            <form onSubmit={ev => {
                ev.preventDefault();
                ev.stopPropagation();

                form.handleSubmit();
            }}>
                <div className="flex flex-row flex-nowrap items-center gap-x-2 pb-2">
                    <form.ConfirmAway on_away={() => on_cancel()}/>
                    <h2 className="text-4xl font-bold text-heading">
                        {exercise != null ? "Edit Exercise" : "Create Exercise"}
                    </h2>
                    <div className="flex-1"/>
                    <form.SubmitButton/>
                    <form.ConfirmReset on_reset={() => form.reset()}/>
                    {exercise != null ?
                        <form.ConfirmDelete on_delete={() => form.handleSubmit({action: "delete"})}/>
                        :
                        null
                    }
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                        <form.AppField name="title">
                            {/*@ts-ignore*/}
                            {field => <div className="space-y-2 col-span-2">
                                <Label htmlFor={field.name}>Title (optional)</Label>
                                <TextInput
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    disabled={field.form.state.isSubmitting}
                                    onBlur={field.handleBlur}
                                    onChange={ev => field.handleChange(ev.target.value.trim())}
                                />
                            </div>}
                        </form.AppField>
                        <form.AppField name="difficulty">
                            {/*@ts-ignore*/}
                            {field => <div className="space-y-2">
                                <Label htmlFor={field.name}>Difficulty (optional)</Label>
                                <Select
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    disabled={field.form.state.isSubmitting}
                                    onBlur={field.handleBlur}
                                    onChange={ev => field.handleChange(ev.target.value)}
                                >
                                    <option value="">— None —</option>
                                    <option value="easy">easy</option>
                                    <option value="hard">hard</option>
                                    <option value="worked example">worked example</option>
                                </Select>
                            </div>}
                        </form.AppField>
                        <div/>
                        <form.AppField name="topic">
                            {/*@ts-ignore*/}
                            {field => <div className="space-y-2">
                                <Label htmlFor={field.name}>Topic</Label>
                                <ReactSelect
                                    id={field.name}
                                    name={field.name}
                                    value={{
                                        label: field.state.value,
                                        value: field.state.value
                                    }}
                                    options={topic_options}
                                    styles={SelectStyles}
                                    onBlur={field.handleBlur}
                                    onChange={value => {
                                        if (value != null) {
                                            if (typeof value === "string") {
                                                field.handleChange(value);
                                            } else {
                                                field.handleChange(value.value);
                                            }
                                        }
                                    }}
                                />
                            </div>}
                        </form.AppField>
                        <form.AppField name="language">
                            {/*@ts-ignore*/}
                            {field => <div className="space-y-2">
                                <Label htmlFor={field.name}>Language</Label>
                                <Select
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    disabled={field.form.state.isSubmitting}
                                    onBlur={field.handleBlur}
                                    onChange={ev => field.handleChange(ev.target.value)}
                                >
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                    <option value="python">Python</option>
                                </Select>
                            </div>}
                        </form.AppField>
                        <div className="col-span-2"/>
                        <form.AppField name="tags">
                            {/*@ts-ignore*/}
                            {field => <div className="space-y-2 col-span-2">
                                <Label htmlFor={field.name}>Tags</Label>
                                <CreatableSelect
                                    id={field.name}
                                    name={field.name}
                                    /*@ts-ignore*/
                                    value={field.state.value.map(v => ({label: v, value: v}))}
                                    onBlur={field.handleBlur}
                                    onChange={(value, action) => {
                                        if (value == null) {
                                            return;
                                        }

                                        field.handleChange(value.map(({value}) => value));
                                    }}
                                    styles={SelectStyles}
                                    isMulti
                                />
                            </div>}
                        </form.AppField>
                    </div>
                    <form.AppField name="prompt">
                        {/*@ts-ignore*/}
                        {field => <div className="space-y-2">
                            <Label htmlFor={field.name}>Prompt</Label>
                            <MDEditor
                                id={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={value => field.handleChange(value)}
                                height="300px"
                                data-testid="prompt"
                            />
                        </div>}
                    </form.AppField>
                    {/*@ts-ignore*/}
                    <form.Subscribe selector={state => state.values.language}>
                        {/*@ts-ignore*/}
                        {language => <>
                            <form.AppField name="referenceTest">
                                {/*@ts-ignore*/}
                                {field => <div className="space-y-2">
                                    <Label htmlFor={field.name}>Reference Test</Label>
                                    <Editor
                                        height="300px"
                                        language={language}
                                        value={field.state.value}
                                        onChange={value => field.handleChange(value ?? "")}
                                        theme="vs-dark"
                                    />
                                </div>}
                            </form.AppField>
                            <form.AppField name="starterCode">
                                {/*@ts-ignore*/}
                                {field => <div className="space-y-2">
                                    <Label htmlFor={field.name}>Starter Code</Label>
                                    <Editor
                                        height="300px"
                                        language={language}
                                        value={field.state.value}
                                        onChange={value => field.handleChange(value ?? "")}
                                        theme="vs-dark"
                                    />
                                </div>}
                            </form.AppField>
                        </>}
                    </form.Subscribe>
                </div>
            </form>
            {/*@ts-ignore*/}
            <form.Subscribe selector={state => ({
                language: state.values.language,
                skeleton: state.values.starterCode,
                reference_test: state.values.referenceTest,
            })}>
                {/*@ts-ignore*/}
                {({language, skeleton, reference_test}) => <ExerciseTest
                    language={language}
                    skeleton={skeleton}
                    reference_test={reference_test}
                />}
            </form.Subscribe>
        </form.AppForm>
    </div>;
}

interface ExerciseTestProps {
    language: string,
    skeleton: string,
    reference_test: string,
}

function ExerciseTest({
    language,
    skeleton,
    reference_test,
}: ExerciseTestProps) {
    const [test_input, set_test_input] = useState(skeleton);

    const { mutate, data, isPending, error } = useMutation({
        mutationFn: async (code: string) => {
            let body = {
                code,
                language,
                reference_test,
            };

            let result = await axios.post("/api/exercises/test", body, { withCredentials: true });

            return result.data;
        },
        onSuccess: (data, vars, ctx) => {
        },
        onError: (err, vars, ctx) => {
        },
    });

    return <div className="space-y-2">
        <div>
            <h3 className="text-3xl font-bold text-heading">Test Exercise</h3>
            <p className="text-body">Run a small test with the current exercise inputs to validate it will run as expected</p>
        </div>
        <div className="flex flex-col gap-2">
            <Editor
                height="300px"
                language={language}
                value={test_input}
                onChange={value => set_test_input(value ?? "")}
                theme="vs-dark"
            />
            <div className="flex flex-row gap-4">
                <Button type="button" disabled={isPending} onClick={() => mutate(test_input)}>
                    Submit
                </Button>
                <Button type="button" color="dark" disabled={isPending} onClick={() => set_test_input(skeleton)}>
                    Reset
                </Button>
            </div>
            <h4 className="text-2xl font-bold text-heading">Results</h4>
            <div className="px-4 w-full min-h-64 overflow-auto">
                {data != null ?
                    <>
                        <div>state: {data.state}</div>
                        <div>tests</div>
                        <div className="pl-6">
                            <div>passed: {data.passed}</div>
                            <div>failed: {data.failed}</div>
                            <div>total: {data.tests_run}</div>
                        </div>
                        <div>exceeded execution time: {data.execution_time_exceeded ? "true" : "false"}</div>
                        <div>exceeded memory: {data.memory_exceeded ? "true" : "false"}</div>
                        {data.failure_details?.length !== 0 ?
                            <>
                                <div>failure details</div>
                                <div className="pl-6">
                                    {data.failure_details.map((v: any) => {
                                        return <FailureDetail key={v.test_case} {...v}/>;
                                    })}
                                </div>
                            </>
                            :
                            null
                        }
                        {data.compilation_error?.length !== 0 ?
                            <>
                                <div>compilation error</div>
                                <pre>{data.compilation_error}</pre>
                            </>
                            :
                            null
                        }
                        {data.runtime_error?.length !== 0 ?
                            <>
                                <div>runtime error</div>
                                <pre>{data.runtime_error}</pre>
                            </>
                            :
                            null
                        }
                    </>
                    :
                    <span>no data</span>
                }
            </div>
        </div>
    </div>;
}

interface FailureDetailProps {
    test_case: string,
    expected: string,
    received: string,
    error_message: string,
    rawout: string,
}

function FailureDetail({
    test_case,
    expected,
    received,
    error_message,
    rawout
}: FailureDetailProps) {
    return <>
        <pre>{test_case}</pre>
        <div className="pl-6">
            <div>expected: {expected} recieved: {received}</div>
            <div>error message</div>
            <pre>{error_message}</pre>
        </div>
    </>;
}
