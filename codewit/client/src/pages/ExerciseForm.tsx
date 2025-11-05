// codewit/client/src/pages/ExerciseForm.tsx
import React, { useState } from "react";
import MDEditor from "@uiw/react-markdown-editor";
import { Editor } from "@monaco-editor/react";
import { 
  ExerciseInput,
  ExerciseResponse,
} from "@codewit/interfaces";
import TagSelect from "../components/form/TagSelect";
import LanguageSelect from "../components/form/LanguageSelect";
import CreateButton from "../components/form/CreateButton";
import ReusableTable from "../components/form/ReusableTable";
import ReusableModal from "../components/form/ReusableModal";
import { toast } from "react-toastify";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useExercisesQuery, EXERCISES_KEY } from '../hooks/useExercises';
import ImportExercisesPanel from './ImportExercisesPanel';
import axios from "axios";
import InputLabel from "../components/form/InputLabel";
import { isFormValid } from "../utils/formValidationUtils";
import { Column } from "../components/form/ReusableTable";

type UiTag = { label: string; value: string };
type Difficulty = 'easy' | 'hard' | 'worked example';

interface ExerciseFormState extends ExerciseInput {
  /** UI helper: language in <select> before saving */
  selectedLanguage: string;
  /** UI helper: tags in react-select before saving */
  selectedTags: UiTag[];
  /* local flags */
  isEditing: boolean;
  editingUid: number;

  title?: string;
  difficulty?: Difficulty;
}

const ExerciseForms = (): JSX.Element => {
  const qc = useQueryClient();

  const { data: exercises = [], isLoading, isFetching, error } = useExercisesQuery();

  const [formData, setFormData] = useState<ExerciseFormState>({
    prompt: "",
    topic: "",
    language: "java",
    tags: [],                 
    referenceTest: "",
    starterCode: "",
    selectedLanguage: "java",
    selectedTags: [],
    isEditing: false,
    editingUid: -1,
    title: "",
    difficulty: undefined,
  });
  const [modalOpen, setModalOpen] = useState(false);

  // --- Mutations (write paths) ---------------------------------------------

  const postExercise = useMutation<ExerciseResponse, Error, any>({
    mutationFn: (payload) =>
      axios.post<ExerciseResponse>("/api/exercises", payload, { withCredentials: true }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: EXERCISES_KEY }),
  });

  const patchExercise = useMutation<ExerciseResponse, Error, { uid: number; payload: any }>({
    mutationFn: ({ uid, payload }) =>
      axios.patch<ExerciseResponse>(`/api/exercises/${uid}`, payload, { withCredentials: true }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: EXERCISES_KEY }),
  });

  const deleteExercise = useMutation<unknown, Error, number>({
    mutationFn: (uid) =>
      axios.delete(`/api/exercises/${uid}`, { withCredentials: true }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: EXERCISES_KEY }),
  });

  const handleSubmit = async () => {
    const { editingUid, isEditing } = formData;

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
      if (isEditing && editingUid !== -1) {
        await patchExercise.mutateAsync({ uid: editingUid, payload: exerciseData });
        toast.success("Exercise successfully updated!");
      } else {
        await postExercise.mutateAsync(exerciseData);
        toast.success("Exercise successfully created!");
      }

      resetForm();
      setModalOpen(false);
    } catch (err) {
      toast.error("Error saving the exercise. Please try again.");
      console.error("Error saving the exercise:", err);
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

  const handleEdit = (exercise: ExerciseResponse) => {
    setFormData({
      prompt: exercise.prompt,
      topic: exercise.topic,
      selectedTags: exercise.tags.map((tag) => ({ label: tag, value: tag })),
      selectedLanguage: exercise.language || "java",
      referenceTest: exercise.referenceTest || "",
      starterCode: exercise.starterCode || "",
      isEditing: true,
      editingUid: exercise.uid,
      tags: exercise.tags,
      language: exercise.language,
      title: exercise.title || "",
      difficulty: exercise.difficulty,
    });
    setModalOpen(true);
  };

  const handleDelete = async (exercise: ExerciseResponse) => {
    try {
      await deleteExercise.mutateAsync(exercise.uid);
      toast.success("Exercise successfully deleted!");
    } catch (err) {
      toast.error("Error deleting exercise.");
      console.error("Error deleting exercise:", err);
    }
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

  const resetForm = () => {
    setFormData({
      prompt: "",
      topic: "",
      language: "java",
      tags: [],
      selectedLanguage: "java",
      selectedTags: [],
      referenceTest: "",
      starterCode: "",
      isEditing: false,
      editingUid: -1,
      title: "",
      difficulty: undefined,
    });
  };

  const requiredFields = ["prompt", "referenceTest", "topic"];
  const isValid = isFormValid(formData, requiredFields);

  const columns: Column<ExerciseResponse>[] = [
    { 
      header: "Title",
      accessor: (r) => r.title?.trim() || r.prompt || `#${r.uid}`,
    },
    { header: "Prompt", accessor: "prompt" },
    { header: "Topic", accessor: "topic" },
    { header: "Language", accessor: "language" },
    { 
      header: "Difficulty",
      accessor: (r) =>
        r.difficulty ? (r.difficulty === "worked example" ? "worked example" : r.difficulty) : "",
    }
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      <CreateButton onClick={() => setModalOpen(true)} title="Create Exercise" />

      <div className="mb-4">
        <ImportExercisesPanel
          onImported={() => qc.invalidateQueries({ queryKey: EXERCISES_KEY })}
        />
      </div>

      {isLoading || isFetching ? (
        <div className="text-gray-300 mt-4">Loading…</div>
      ) : error ? (
        <div className="text-red-500 mt-4">Failed to load exercises.</div>
      ) : (
        <ReusableTable
          columns={columns}
          data={exercises}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ReusableModal
        isOpen={modalOpen}
        onClose={() => {
          resetForm();
          setModalOpen(false);
        }}
        title={formData.isEditing ? "Edit Exercise" : "Create Exercise"}
        footerActions={
          <>
            <button
              onClick={handleSubmit}
              data-testid="submit-button"
              disabled={!isValid}
              className={`px-4 py-2 rounded-md ${
                isValid ? "bg-blue-500 text-white" : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
            >
              {formData.isEditing ? "Save Changes" : "Create Exercise"}
            </button>
            <button
              onClick={() => {
                resetForm();
                setModalOpen(false);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <InputLabel htmlFor="title">Title (optional)</InputLabel>
          <input
            id="title"
            className="w-full rounded-md bg-zinc-800 text-gray-100 px-3 py-2"
            value={formData.title ?? ""}
            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
          />

          <InputLabel htmlFor="difficulty">Difficulty (optional)</InputLabel>
          <select
            id="difficulty"
            className="w-full rounded-md bg-zinc-800 text-gray-100 px-3 py-2"
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
          </select>

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
      </ReusableModal>
    </div>
  );
};

export default ExerciseForms;