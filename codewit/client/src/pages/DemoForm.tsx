// codewit/client/src/pages/DemoForm.tsx
import React, { useState } from "react";
import ReusableModal from "../components/form/ReusableModal";
import ReusableTable from "../components/form/ReusableTable";
import { toast } from "react-toastify";
import VideoSelect from "../components/form/VideoSelect";
import ExerciseSelect from "../components/form/ExerciseSelect";
import TagSelect from "../components/form/TagSelect";
import LanguageSelect from "../components/form/LanguageSelect";
import CreateButton from "../components/form/CreateButton";
import { useFetchDemos, usePostDemo, usePatchDemo, useDeleteDemo } from "../hooks/useDemo";
import { DemoResponse } from "@codewit/interfaces";
import { isFormValid } from "../utils/formValidationUtils";
import LoadingPage from "../components/loading/LoadingPage";

const DemoForm = (): JSX.Element => {
  const { data: demos, setData: setDemos } = useFetchDemos();
  const postDemo = usePostDemo();
  const patchDemo = usePatchDemo();
  const deleteDemo = useDeleteDemo();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    uid: undefined as number | undefined,
    title: "",
    youtube_id: "",
    youtube_thumbnail: "",
    topic: "",
    language: "cpp",
    tags: [],
    exercises: [],
  });

  const handleModalClose = () => {
    setModalOpen(false);
    setFormData({
      uid: undefined,
      title: "",
      youtube_id: "",
      youtube_thumbnail: "",
      topic: "",
      language: "cpp",
      tags: [],
      exercises: [],
    });
    setIsEditing(false);
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        const updatedDemo = await patchDemo(formData, formData.uid as unknown as number);
        setDemos((prev) => prev.map((demo) => (demo.uid === formData.uid ? updatedDemo : demo)));
        toast.success("Demo successfully updated!");
      } else {
        const newDemo = await postDemo(formData);
        setDemos((prev) => [...prev, newDemo]);
        toast.success("Demo successfully created!");
      }
      handleModalClose();
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

 const handleEdit = (demo: DemoResponse) => {
    setFormData(demo);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (demo: DemoResponse) => {
    try {
      await deleteDemo(demo.uid);
      setDemos((prev) => prev.filter((d) => d.uid !== demo.uid));
      toast.success("Demo successfully deleted!");
    } catch {
      toast.error("An error occurred while deleting.");
    }
  };

  const requiredFields = ["title", "youtube_id", "youtube_thumbnail", "topic"];
  const isValid = isFormValid(formData, requiredFields);

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Topic", accessor: "topic" },
    { header: "Language", accessor: "language" },
  ];

  if (!demos) return <LoadingPage />;

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      <CreateButton onClick={() => setModalOpen(true)} title="Create Demo" />
      <ReusableTable columns={columns} data={demos} onEdit={handleEdit} onDelete={handleDelete} />
      <ReusableModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={isEditing ? "Edit Demo" : "Create Demo"}
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
              {isEditing ? "Update" : "Create"}
            </button>
            <button onClick={handleModalClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">
              Cancel
            </button>
          </>
        }
      >
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-400">Title</label>
          <input
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="block w-full p-2 rounded-md bg-gray-700 text-white"
            placeholder="Enter demo title"
          />
        </div>
        <VideoSelect
          selectedVideoId={formData.youtube_id}
          onSelectVideo={(id, thumbnail) => {
            handleInputChange("youtube_id", id);
            handleInputChange("youtube_thumbnail", thumbnail);
          }}
        />
        <ExerciseSelect
          initialExercises={formData.exercises}
          onSelectExercises={(exercises) => handleInputChange("exercises", exercises)}
        />
        <div className="grid grid-cols-2 gap-4">
          <TagSelect
            selectedTags={formData.tags.map((tag) => ({ label: tag, value: tag }))}
            setSelectedTags={(tags) =>
              handleInputChange(
                "tags",
                tags.map((tag) => tag.value)
              )
            }
            isMulti
          />
          <LanguageSelect
            initialLanguage={formData.language}
            handleChange={(e) => handleInputChange("language", e.target.value)}
          />
        </div>
        <TagSelect
          selectedTags={[{ value: formData.topic, label: formData.topic }]}
          setSelectedTags={(topic) => handleInputChange("topic", topic.value)}
          isMulti={false}
        />
      </ReusableModal>
    </div>
  );
};

export default DemoForm;