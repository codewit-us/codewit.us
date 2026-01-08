// codewit/client/src/pages/ExerciseForm.tsx
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Editor } from "@monaco-editor/react";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import MDEditor from "@uiw/react-markdown-editor";
import axios from "axios";
import { Button, Select, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  ExerciseInput,
  ExerciseResponse,
} from "@codewit/interfaces";

import LoadingPage from "../../../components/loading/LoadingPage";
import { ErrorView } from "../../../components/error/Error";
import TagSelect from "../../../components/form/TagSelect";
import LanguageSelect from "../../../components/form/LanguageSelect";
import ReusableModal from "../../../components/form/ReusableModal";
import InputLabel from "../../../components/form/InputLabel";
import { isFormValid } from "../../../utils/formValidationUtils";
import { cn } from "../../../utils/styles";
import { use_single_exercise_query, single_exercise_query_key } from "../../../hooks/useExercise";

type UiTag = { label: string; value: string };
type Difficulty = 'easy' | 'hard' | 'worked example';

interface ExerciseFormState extends ExerciseInput {
  /** UI helper: language in <select> before saving */
  selectedLanguage: string;
  /** UI helper: tags in react-select before saving */
  selectedTags: UiTag[];
  uid: number;

  title?: string;
  difficulty?: Difficulty;
}

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
      on_created={record => navigate(`/create/exercise/${record.uid}`)}
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
  />;
}

function exercise_to_form(exercise: ExerciseResponse | null): ExerciseFormState {
  let language = exercise?.language ?? "java";
  let tags = exercise?.tags ?? [];

  return {
      prompt: exercise?.prompt ?? "",
      topic: exercise?.topic ?? "",
      selectedTags: tags.map((tag) => ({ label: tag, value: tag })),
      selectedLanguage: language,
      referenceTest: exercise?.referenceTest ?? "",
      starterCode: exercise?.starterCode ?? "",
      uid: exercise?.uid ?? -1,
      tags: exercise?.tags ?? [],
      language,
      title: exercise?.title || "",
      difficulty: exercise?.difficulty,
  };
}

interface ExerciseEditProps {
  exercise: ExerciseResponse | null,
  on_created?: (exercise: ExerciseResponse) => void,
  on_updated?: (exercise: ExerciseResponse) => void,
  on_deleted?: () => void,
}

function ExerciseEdit({
  exercise,
  on_created = () => {},
  on_updated = () => {},
  on_deleted = () => {},
}: ExerciseEditProps) {
  const [formData, setFormData] = useState(exercise_to_form(exercise));

  // --- Mutations (write paths) ---------------------------------------------

  const postExercise = useMutation({
    mutationFn: async (payload: any) => {
      let result = await axios.post<ExerciseResponse>("/api/exercises", payload, { withCredentials: true });

      return result.data;
    },
  });

  const patchExercise = useMutation({
    mutationFn: async ({ uid, payload }: {uid: number, payload: any}) => {
      let result = await axios.patch<ExerciseResponse>(`/api/exercises/${uid}`, payload, { withCredentials: true });

      return result.data;
    },
  });

  const deleteExercise = useMutation({
    mutationFn: async ({ uid }: {uid: number}) => {
      let result = await axios.delete(`/api/exercises/${uid}`, { withCredentials: true });

      return result.data;
    },
    onSuccess: (data, vars, ctx) => {
      toast.success("Exercise Deleted");

      on_deleted();
    },
    onError: (err, vars, ctx) => {
      toast.error("Failed to delete Exercise");

      console.error("failed to delete exercise:", err);
    },
  });

  const handleSubmit = async () => {
    const exerciseData = {
      prompt: formData.prompt.trim(),
      topic: formData.topic,
      tags: formData.selectedTags.map((t) => t.value),
      language: formData.selectedLanguage,
      referenceTest: formData.referenceTest,
      starterCode: formData.starterCode,
      title: formData.title?.trim() || undefined,
      difficulty: formData.difficulty,
    };

    try {
      if (exercise != null) {
        let result = await patchExercise.mutateAsync({
          uid: exercise.uid,
          payload: exerciseData
        });

        toast.success("Exercise successfully updated!");

        resetForm(result);

        on_updated(result);
      } else {
        let result = await postExercise.mutateAsync(exerciseData);

        toast.success("Exercise successfully created!");

        resetForm(result);

        on_created(result);
      }
    } catch(err) {
      console.error("Error saving the exercise:", err);

      toast.error("Error saving the exercise. Please try again.");
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, prompt: value || "" }));
  };

  const handleScriptChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, referenceTest: value || "" }));
  };

  const handleStarterCodeChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, starterCode: value || "" }));
  };

  const handleTagSelect = (tags: UiTag[]) => {
    setFormData((prev) => ({ ...prev, selectedTags: tags }));
  };

  const handleTopicSelect = (
    topics: { label: string; value: string }[] | { label: string; value: string }
  ) => {
    const topic = Array.isArray(topics) ? topics[0].value : topics.value;
    setFormData((prev) => ({ ...prev, topic }));
  };

  const handleLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setFormData((prev) => ({ ...prev, selectedLanguage: e.target.value }));
  };

  const resetForm = (exercise: ExerciseResponse | null = null) => {
    setFormData(exercise_to_form(exercise));
  };

  const requiredFields = ["prompt", "referenceTest", "topic"];
  const isValid = isFormValid(formData, requiredFields);

  return <div className="mx-auto flex flex-col p-6 max-w-6xl">
    <div className="flex flex-row flex-nowrap items-center gap-x-2 pb-2">
      <Link to="/create/exercise" className="">
        <Button type="button" color="light">
          <ArrowLeftIcon className="w-6 h-6"/>
        </Button>
      </Link>
      <h2 className="text-4xl font-bold text-heading">
        {exercise != null ? "Edit Exercise" : "Create Exercise"}
      </h2>
      <div className="flex-1"/>
      <Button
        type="button"
        data-testid="submit-button"
        disabled={!isValid || deleteExercise.isPending || postExercise.isPending || patchExercise.isPending}
        onClick={handleSubmit}
      >
        {exercise != null ? "Update" : "Create"}
      </Button>
      {exercise != null ?
        <Button
          type="button"
          color="red"
          disabled={deleteExercise.isPending || patchExercise.isPending}
          onClick={() => deleteExercise.mutate({uid: exercise.uid})}
        >
          <TrashIcon/> Delete
        </Button>
        :
        null
      }
    </div>
    <div className="space-y-4">
      <div className="flex flex-row flex-nowrap items-center gap-x-2">
        <div className="w-1/2 space-y-2">
          <InputLabel htmlFor="title">Title (optional)</InputLabel>
          <TextInput
            id="title"
            value={formData.title ?? ""}
            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
          />
        </div>
        <div className="w-1/4 space-y-2">
          <InputLabel htmlFor="difficulty">Difficulty (optional)</InputLabel>
          <Select
            id="difficulty"
            value={formData.difficulty ?? ""}
            onChange={(e) =>
              setFormData(p => ({
                ...p,
                difficulty: (e.target.value || undefined) as Difficulty | undefined,
              }))
            }
          >
            <option value="">— None —</option>
            <option value="easy">easy</option>
            <option value="hard">hard</option>
            <option value="worked example">worked example</option>
          </Select>
        </div>
      </div>
      <InputLabel htmlFor="prompt">Prompt</InputLabel>
      <MDEditor
        value={formData.prompt}
        onChange={handleEditorChange}
        height="300px"
        data-testid="prompt"
      />
      <InputLabel htmlFor="referenceTest">Reference Test</InputLabel>
      <Editor
          height="200px"
          language={formData.selectedLanguage}
          value={formData.referenceTest}
          onChange={handleScriptChange}
          theme="vs-dark"
      />
      <InputLabel htmlFor="starterCode">Starter Code</InputLabel>
      <Editor
          height="200px"
          language={formData.selectedLanguage}
          value={formData.starterCode}
          onChange={handleStarterCodeChange}
          theme="vs-dark"
      />
      <div className="flex flex-row gap-3">
        <TagSelect
          selectedTags={formData.selectedTags}
          setSelectedTags={handleTagSelect}
          isMulti
        />
        <LanguageSelect
          handleChange={handleLanguageChange}
          initialLanguage={formData.selectedLanguage}
        />
      </div>
      <div className="w-1/2">
        <TagSelect
          selectedTags={
            formData.topic
              ? [{ label: formData.topic, value: formData.topic }]
              : []
          }
          setSelectedTags={handleTopicSelect}
          isMulti={false}
        />
      </div>
    </div>
  </div>;
}
