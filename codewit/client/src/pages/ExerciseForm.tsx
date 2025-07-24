// codewit/client/src/pages/ExerciseForm.tsx
import React, { useState } from "react";
import MDEditor from "@uiw/react-markdown-editor";
import { Editor } from "@monaco-editor/react";
import { 
  ExerciseInput,
  ExerciseResponse,
  SelectedTag 
} from "@codewit/interfaces";
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

interface ExerciseFormState extends ExerciseInput {
  /** UI helper: language in <select> before saving */
  selectedLanguage: string;
  /** UI helper: tags in react-select before saving */
  selectedTags: SelectedTag[];
  /* local flags */
  isEditing: boolean;
  editingUid: number;
}

const ExerciseForms = (): JSX.Element => {
  const { data: exercises, setData: setExercises } = useFetchExercises();
  console.log(exercises);
  const postExercise = usePostExercise();
  const patchExercise = usePatchExercise();
  const deleteExercise = useDeleteExercise();
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
   });
  
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async () => {
    const { editingUid, isEditing } = formData;

    const exerciseData = {
      prompt: formData.prompt.trim(),
      topic: formData.topic,
      tags: formData.selectedTags.map((tag) => String(tag.value)),
      language: formData.selectedLanguage,
      referenceTest: formData.referenceTest,
      starterCode: formData.starterCode,
    };

    try {
      let response: ExerciseResponse;
      if (isEditing && editingUid !== -1) {
        // still full Exercise on PATCH
        response = await patchExercise(          
        // add uid for server
        { ...exerciseData, uid: editingUid },  
          editingUid
        );
        setExercises((prev) =>
          prev.map((ex) => (ex.uid === editingUid ? response : ex))
        );
        toast.success("Exercise successfully updated!");
      } else {
        console.log(exerciseData);
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

  const handleStarterCodeChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, starterCode: value || "" }));
  };

  const handleEdit = (exercise: ExerciseResponse) => {
    setFormData({
      prompt: exercise.prompt,
      topic: exercise.topic,
      selectedTags: exercise.tags.map((tag) => ({ label: tag, value: Number(tag) })),
      selectedLanguage: exercise.language || "java",
      referenceTest: exercise.referenceTest || "",
      starterCode: exercise.starterCode || "",
      isEditing: true,
      editingUid: exercise.uid,
      tags: exercise.tags,
      language: exercise.language,
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
    });
  };

  const requiredFields = ["prompt", "referenceTest", "topic"];
  const isValid = isFormValid(formData, requiredFields);

  const columns = [
    { header: "Prompt", accessor: "prompt" },
    { header: "Topic", accessor: "topic" },
    { header: "Language", accessor: "language" },
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
              selectedTags={formData.selectedTags.map((tag) => ({ ...tag, value: String(tag.value) }))}
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