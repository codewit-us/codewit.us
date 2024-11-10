import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-markdown-editor";
import { Editor } from "@monaco-editor/react";
import {
  ExerciseResponse,
  SelectedTag,
  ExerciseFormData,
} from "@codewit/interfaces";
import TagSelect from "../components/form/TagSelect";
import LanguageSelect from "../components/form/LanguageSelect";
import CreateButton from "../components/CreateButton";
import ReusableTable from "../components/ReusableTable";
import ReusableModal from "../components/ReusableModal";
import Loading from "../components/loading/LoadingPage";
import Error from "../components/error/Error";
import {
  usePostExercise,
  usePatchExercise,
  useFetchExercises,
  useDeleteExercise,
} from "../hooks/useExercise";
import InputLabel from "../components/form/InputLabel";

const ExerciseForms = (): JSX.Element => {
  const { data: exercises, setData: setExercises, loading: loadingEx, error: fetchError } = useFetchExercises();
  const postExercise = usePostExercise();
  const patchExercise = usePatchExercise();
  const deleteExercise = useDeleteExercise();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>({
    exercise: { prompt: "" },
    isEditing: false,
    editingUid: -1,
    topic: "",
    selectedLanguage: "cpp",
    selectedTags: [],
    referenceTest: "",
  });

  const [error, setError] = useState(false);

  useEffect(() => {
    if (fetchError) {
      setError(true);
    }
  }, [fetchError]);

  const handleSubmit = async () => {
    const { editingUid, isEditing } = formData;

    const exerciseData = {
      prompt: formData.exercise.prompt.trim(),
      topic: formData.topic,
      tags: formData.selectedTags.map((tag) => tag.value),
      language: formData.selectedLanguage,
      referenceTest: formData.referenceTest,
    };
    console.log(exerciseData);
    try {
      let response: ExerciseResponse;
      if (isEditing && editingUid !== -1) {
        response = await patchExercise(exerciseData, editingUid);
      } else {
        console.log("POSTING?")
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
        topic: "",
        selectedLanguage: "cpp",
        selectedTags: [],
        referenceTest: "",
      });
      setModalOpen(false);
    } catch (error) {
      setError(true);
      console.error("Error saving the exercise:", error);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, exercise: { prompt: value || "" } }));
  };

  const handleScriptChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, referenceTest: value || "" }));
  };

  const handleEdit = (exercise: ExerciseResponse) => {
    setFormData({
      exercise: { prompt: exercise.prompt },
      isEditing: true,
      editingUid: exercise.uid,
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
    });
    setModalOpen(true);
  };

  const handleDelete = async (exercise: ExerciseResponse) => {
    try {
      await deleteExercise(exercise.uid);
      setExercises((prev) => prev.filter((ex) => ex.uid !== exercise.uid));
    } catch (error) {
      console.error("Error deleting exercise:", error);
      setError(true);
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

  const columns = [
    { header: "Prompt", accessor: "prompt" },
    { header: "Topic", accessor: "topic" },
    { header: "Language", accessor: "language.name" },
  ];

  if (loadingEx) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      {/* Create Exercise Button */}
      <CreateButton onClick={() => setModalOpen(true)} title="Create Exercise" />

      {/* Existing Exercises Table */}
      <ReusableTable
        columns={columns}
        data={exercises}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal for Creating/Editing Exercise */}
      <ReusableModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormData({
            exercise: { prompt: "" },
            isEditing: false,
            editingUid: -1,
            topic: "",
            selectedLanguage: "cpp",
            selectedTags: [],
            referenceTest: "",
          });
        }}
        title={formData.isEditing ? "Edit Exercise" : "Create Exercise"}
        footerActions={
          <>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              {formData.isEditing ? "Save Changes" : "Create Exercise"}
            </button>
            <button
              onClick={() => {
                setModalOpen(false);
                setFormData({
                  exercise: { prompt: "" },
                  isEditing: false,
                  editingUid: -1,
                  topic: "",
                  selectedLanguage: "cpp",
                  selectedTags: [],
                  referenceTest: "",
                });
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
            value={formData.exercise.prompt}
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