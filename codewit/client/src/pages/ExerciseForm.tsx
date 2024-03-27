import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Error from "../components/error/Error";
import MDEditor from "@uiw/react-markdown-editor";
import { ExerciseResponse, SelectedTag } from "@codewit/interfaces";
import TagSelect from "../components/form/TagSelect";
import LanguageSelect from "../components/form/LanguageSelect";
import SubmitBtn from "../components/form/SubmitButton";
import ExistingTable from "../components/form/ExistingTable";

interface FormData {
  exercise: { prompt: string };
  isEditing: boolean;
  editingUid: number;
  selectedLanguage: string;
  selectedTags: {label: string, value: string}[];
}

const ExerciseForms = (): JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    exercise: { prompt: "" },
    isEditing: false,
    editingUid: -1,
    selectedLanguage: "cpp",
    selectedTags: [],
  });
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data } = await axios.get("/exercises");
        setExercises(data as ExerciseResponse[]);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        setError(true);
      }
    };

    fetchExercises();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const {
        exercise,
        selectedLanguage,
        selectedTags,
        editingUid,
        isEditing,
      } = formData;
      if (!exercise.prompt.trim()) return;

      const exerciseData = {
        ...exercise,
        tags: selectedTags.map((tag: { value: string }) => tag.value),
        language: selectedLanguage,
      };

      try {
        let response: ExerciseResponse;
        if (isEditing && editingUid) {
          const { data } = await axios.patch(
            `/exercises/${editingUid}`,
            exerciseData
          );
          response = data;
        } else {
          const { data } = await axios.post("/exercises", exerciseData);
          response = data;
        }
        setExercises((prev) =>
          isEditing
            ? prev.map((ex) => (ex.uid === editingUid ? response : ex))
            : [...prev, response]
        );
        setFormData((prev) => ({
          ...prev,
          exercise: { prompt: "" },
          selectedTags: [],
          selectedLanguage: "cpp",
          isEditing: false,
          editingUid: -1,
        }));
      } catch (error) {
        setError(true);
        console.error("Error saving the exercise:", error);
      }
    },
    [formData]
  );

  const handleEditorChange = useCallback((value: string | undefined) => {
    setFormData((prev) => ({ ...prev, exercise: { prompt: value || "" } }));
  }, []);

  const handleEdit = useCallback(
    (exerciseUID: number) => {
      console.log(exerciseUID)
      const exerciseToEdit = exercises.find((ex) => ex.uid === exerciseUID);
      if (!exerciseToEdit) {
        console.error("Exercise with UID not found:", exerciseUID);
        return;
      }
      setFormData({
        ...formData,
        exercise: { prompt: exerciseToEdit.prompt },
        isEditing: true,
        editingUid: exerciseUID as number,
        selectedTags: exerciseToEdit.tags.map((tag) => ({
          label: typeof tag === "string" ? tag : tag.name,
          value: typeof tag === "string" ? tag : tag.name,
        })),
        selectedLanguage:
          typeof exerciseToEdit.language === "string"
            ? exerciseToEdit.language
            : exerciseToEdit.language.name,
      });
    },
    [exercises, formData]
  );

  const handleDelete = useCallback(
    async (exerciseId: number) => {
      try {
        await axios.delete(`/exercises/${exerciseId}`);
        setExercises(exercises.filter((ex) => ex.uid !== exerciseId));
      } catch (error) {
        console.error("Error deleting exercise:", error);
        setError(true);
      }
    },
    [exercises]
  );

  const handleTagSelect = useCallback((tags: SelectedTag[]) => {
    console.log(tags);
    setFormData(prev => ({ ...prev, selectedTags: tags }));
  }, []);

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, selectedLanguage: e.target.value }));
    },
    []
  );

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex gap-2 justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
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
        <SubmitBtn
          disabled={
            formData.exercise.prompt === "" ||
            formData.selectedTags.length === 0 ||
            !formData.selectedLanguage
          }
          text={formData.isEditing ? "Confirm Edit" : "Create"}
        />
      </form>
      <ExistingTable
        items={exercises}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ExerciseForms;
