import React, { useState, useEffect } from "react";
import Error from "../components/error/Error";
import MDEditor from "@uiw/react-markdown-editor";
import { ExerciseResponse, SelectedTag } from "@codewit/interfaces";
import TagSelect from "../components/form/TagSelect";
import LanguageSelect from "../components/form/LanguageSelect";
import SubmitBtn from "../components/form/SubmitButton";
import ExistingTable from "../components/form/ExistingTable";
import {
  usePostExercise,
  usePatchExercises,
  useFetchExercises,
  useDeleteExercise,
} from "../hooks/exercisehooks/useExerciseHooks";
import { Editor } from "@monaco-editor/react";
import { exit } from "process";

interface FormData {
  exercise: { prompt: string };
  isEditing: boolean;
  editingUid: number;
  selectedLanguage: string;
  topic: string;
  selectedTags: { label: string, value: string }[];
  testingScript: string;
}

const ExerciseForms = (): JSX.Element => {
  const { fetchExercises } = useFetchExercises();
  const { postExercise } = usePostExercise();
  const { patchExercises } = usePatchExercises();
  const { deleteExercise } = useDeleteExercise();
  const [formData, setFormData] = useState<FormData>({
    exercise: { prompt: "" },
    isEditing: false,
    editingUid: -1,
    topic: '',
    selectedLanguage: "cpp",
    selectedTags: [],
    testingScript: "",
  });
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await fetchExercises();
        setExercises(data as unknown as ExerciseResponse[]);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        setError(true);
      }
    };
    loadExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { editingUid, isEditing } = formData;

    const exerciseData = {
      prompt: formData.exercise.prompt.trim(),
      topic: formData.topic,
      tags: formData.selectedTags.map((tag) => tag.value),
      language: formData.selectedLanguage,
      testingScript: formData.testingScript,
    };

    try {
      let response: ExerciseResponse;
      if (isEditing && editingUid !== -1) {
        response = await patchExercises(exerciseData, editingUid);
      } else {
        response = await postExercise(exerciseData);
      }

      setExercises((prev) =>
        isEditing
          ? prev.map((ex) => (ex.uid === editingUid ? response : ex))
          : [...prev, response]
      );

      // Reset form after successful submission
      setFormData({
        exercise: { prompt: "" },
        isEditing: false,
        editingUid: -1,
        topic: '',
        selectedLanguage: "cpp",
        selectedTags: [],
        testingScript: "",
      });
    } catch (error) {
      setError(true);
      console.error("Error saving the exercise:", error);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, exercise: { prompt: value || "" } }));
  };

  const handleScriptChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, testingScript: value || "" }));
  };

  const handleEdit = (exerciseUID: number) => {
    const exerciseToEdit = exercises.find((ex) => ex.uid === exerciseUID);
    if (!exerciseToEdit) {
      console.error("Exercise with UID not found:", exerciseUID);
      return;
    }

    setFormData({
      exercise: { prompt: exerciseToEdit.prompt },
      isEditing: true,
      editingUid: exerciseUID,
      topic: exerciseToEdit.topic,
      selectedTags: exerciseToEdit.tags.map((tag) => ({
        label: typeof tag === "string" ? tag : tag.name,
        value: typeof tag === "string" ? tag : tag.name,
      })),
      selectedLanguage:
        typeof exerciseToEdit.language === "string"
          ? exerciseToEdit.language
          : exerciseToEdit.language.name,
      testingScript: exerciseToEdit.testingScript || "",
    });
  };

  const handleDelete = async (exerciseId: number) => {
    try {
      await deleteExercise(exerciseId);
      setExercises((prev) => prev.filter((ex) => ex.uid !== exerciseId));
    } catch (error) {
      console.error("Error deleting exercise:", error);
      setError(true);
    }
  };

  const handleTagSelect = (tags: SelectedTag[]) => {
    setFormData((prev) => ({ ...prev, selectedTags: tags }));
  };

  const handleTopicSelect = (topics: { label: string, value: string }[] | { label: string, value: string }) => {
    const topic = Array.isArray(topics) ? topics[0].value : topics.value;
    setFormData((prev) => ({ ...prev, topic }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, selectedLanguage: e.target.value }));
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex justify-center items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          {formData.isEditing ? "Edit Exercise" : "Create New Exercise"}
        </h2>
        <div className="mb-2 overflow-auto">
          <MDEditor
            value={formData.exercise.prompt}
            onChange={handleEditorChange}
            height="300px"
            data-testid="prompt"
          />
        </div>
        <div className="mb-2 overflow-auto">
          <Editor
            height="200px"
            language={formData.selectedLanguage}
            value={formData.testingScript}
            onChange={handleScriptChange}
            theme="vs-dark"
          />
        </div>
        <div className="flex flex-row w-full gap-3 mb-6">
          <TagSelect
            selectedTags={formData.selectedTags}
            setSelectedTags={handleTagSelect}
            isMulti={true}
          />
          <LanguageSelect
            handleChange={handleLanguageChange}
            initialLanguage={formData.selectedLanguage}
          />
        </div>
        <TagSelect
          selectedTags={[{ value: formData.topic, label: formData.topic }]}
          setSelectedTags={handleTopicSelect}
          isMulti={false}
        />
        <SubmitBtn
          disabled={
            formData.exercise.prompt === "" ||
            formData.selectedTags.length === 0 ||
            formData.topic === '' ||
            formData.testingScript === ""
          }
          text={formData.isEditing ? "Confirm Edit" : "Create"}
        />
      </form>
      <ExistingTable items={exercises} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ExerciseForms;
