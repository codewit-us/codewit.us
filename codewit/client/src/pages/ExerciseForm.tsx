// codewit/client/src/pages/ExerciseForm.tsx
import React, { useState } from "react";
import MDEditor from "@uiw/react-markdown-editor";
import { Editor } from "@monaco-editor/react";
import { ExerciseResponse, SelectedTag } from "@codewit/interfaces";
import TagSelect from "../components/form/TagSelect";
import LanguageSelect from "../components/form/LanguageSelect";
import CreateButton from "../components/form/CreateButton";
import ReusableTable from "../components/form/ReusableTable";
import ReusableModal from "../components/form/ReusableModal";
import { toast } from "react-toastify";
import {
  usePostExercise,
  usePatchExercise,
  useFetchExercises,
  useDeleteExercise,
} from "../hooks/useExercise";
import InputLabel from "../components/form/InputLabel";
import { isFormValid } from "../utils/formValidationUtils";

const ExerciseForms = (): JSX.Element => {
  const { data: exercises, setData: setExercises } = useFetchExercises();
  const postExercise = usePostExercise();
  const patchExercise = usePatchExercise();
  const deleteExercise = useDeleteExercise();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    prompt: "",
    topic: "",
    selectedLanguage: "cpp",
    selectedTags: [] as SelectedTag[],
    referenceTest: "",
    isEditing: false,
    editingUid: -1,
  });

  const handleSubmit = async () => {
    const { editingUid, isEditing } = formData;

    const exerciseData = {
      prompt: formData.prompt.trim(),
      topic: formData.topic,
      tags: formData.selectedTags.map((tag) => tag.value),
      language: formData.selectedLanguage,
      referenceTest: formData.referenceTest,
    };

    try {
      let response: ExerciseResponse;
      if (isEditing && editingUid !== -1) {
        response = await patchExercise(exerciseData, editingUid);
        setExercises((prev) =>
          prev.map((ex) => (ex.uid === editingUid ? response : ex))
        );
        toast.success("Exercise successfully updated!");
      } else {
        response = await postExercise(exerciseData);
        setExercises((prev) => [...prev, response]);
        toast.success("Exercise successfully created!");
      }

      resetForm();
      setModalOpen(false);
    } catch (error) {
      toast.error("Error saving the exercise. Please try again.");
      console.error("Error saving the exercise:", error);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, prompt: value || "" }));
  };

  const handleScriptChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, referenceTest: value || "" }));
  };

  const handleEdit = (exercise: ExerciseResponse) => {
    setFormData({
      prompt: exercise.prompt,
      topic: exercise.topic,
      selectedTags: exercise.tags.map((tag) => ({
        label: typeof tag === "string" ? tag : tag.name,
        value: typeof tag === "string" ? tag : tag.name,
      })),
      selectedLanguage:
        typeof exercise.language === "string"
          ? exercise.language
          : exercise.language.name,
      referenceTest: exercise.referenceTest || "",
      isEditing: true,
      editingUid: exercise.uid,
    });
    setModalOpen(true);
  };

  const handleDelete = async (exercise: ExerciseResponse) => {
    try {
      await deleteExercise(exercise.uid);
      setExercises((prev) => prev.filter((ex) => ex.uid !== exercise.uid));
      toast.success("Exercise successfully deleted!");
    } catch (error) {
      toast.error("Error deleting exercise.");
      console.error("Error deleting exercise:", error);
    }
  };

  const handleTagSelect = (tags: SelectedTag[]) => {
    setFormData((prev) => ({ ...prev, selectedTags: tags }));
  };

  const handleTopicSelect = (
    topics: { label: string; value: string }[] | { label: string; value: string }
  ) => {
    const topic = Array.isArray(topics) ? topics[0].value : topics.value;
    setFormData((prev) => ({ ...prev, topic }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, selectedLanguage: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      prompt: "",
      topic: "",
      selectedLanguage: "cpp",
      selectedTags: [],
      referenceTest: "",
      isEditing: false,
      editingUid: -1,
    });
  };

  const requiredFields = ["prompt", "referenceTest", "topic"];
  const isValid = isFormValid(formData, requiredFields);

  const columns = [
    { header: "Prompt", accessor: "prompt" },
    { header: "Topic", accessor: "topic" },
    { header: "Language", accessor: "language.name" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      <CreateButton onClick={() => setModalOpen(true)} title="Create Exercise" />

      <ReusableTable
        columns={columns}
        data={exercises}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
            selectedTags={[{ value: formData.topic, label: formData.topic }]}
            setSelectedTags={handleTopicSelect}
            isMulti={false}
          />
        </div>
      </ReusableModal>
    </div>
  );
};

export default ExerciseForms;