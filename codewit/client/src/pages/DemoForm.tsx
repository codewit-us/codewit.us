import React, { useState } from "react";
import { Button, Modal, Table } from "flowbite-react";
import VideoSelect from "../components/form/VideoSelect";
import ExerciseSelect from "../components/form/ExerciseSelect";
import TagSelect from "../components/form/TagSelect";
import LanguageSelect from "../components/form/LanguageSelect";
import Error from "../components/error/Error";
import Loading from "../components/loading/LoadingPage";
import {
  useFetchDemos,
  usePostDemo,
  usePatchDemo,
  useDeleteDemo,
} from "../hooks/useDemo";
import { DemoResponse } from "@codewit/interfaces";

const DemoForm = (): JSX.Element => {
  const { data: demos, loading, error, setData: setDemos } = useFetchDemos();
  const postDemo = usePostDemo();
  const patchDemo = usePatchDemo();
  const deleteDemo = useDeleteDemo();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    uid: undefined,
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
        const updatedDemo = await patchDemo(formData, formData.uid as number);
        setDemos((prev) =>
          prev.map((demo) => (demo.uid === formData.uid ? updatedDemo : demo))
        );
      } else {
        const newDemo = await postDemo(formData);
        setDemos((prev) => [...prev, newDemo]);
      }
      handleModalClose();
    } catch (err) {
      console.error("Error creating or updating demo:", err);
    }
  };

  const handleEdit = (demo: DemoResponse) => {
    setFormData({
      uid: demo.uid,
      title: demo.title,
      youtube_id: demo.youtube_id,
      youtube_thumbnail: demo.youtube_thumbnail,
      topic: demo.topic.name,
      tags: demo.tags.map((tag) => tag.name),
      language: demo.language.name,
      exercises: demo.exercises.map((ex) => ex.uid),
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (uid: number) => {
    try {
      await deleteDemo(uid);
      setDemos((prev) => prev.filter((demo) => demo.uid !== uid));
    } catch (err) {
      console.error("Error deleting demo:", err);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      <div className="flex justify-end mb-2">
        <Button
          size="sm"
          className="bg-foreground-500 text-accent-500 hover:bg-gray-100"
          onClick={() => setModalOpen(true)}
        >
          Create Demo
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <Table hoverable striped className="border-gray-700 shadow-md rounded-lg">
          <Table.Head className="bg-gray-800 text-white">
            <Table.HeadCell className="text-gray-300 font-semibold">Title</Table.HeadCell>
            <Table.HeadCell className="text-gray-300 font-semibold">Topic</Table.HeadCell>
            <Table.HeadCell className="text-gray-300 font-semibold">Language</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Actions</span>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-gray-900 divide-y divide-gray-700">
            {demos.map((demo) => (
              <Table.Row
                key={demo.uid}
                className="bg-gray-900 hover:bg-gray-800 transition-colors duration-300"
              >
                <Table.Cell className="whitespace-nowrap text-gray-300 font-medium">
                  {demo.title}
                </Table.Cell>
                <Table.Cell className="text-gray-400">{demo.topic}</Table.Cell>
                <Table.Cell className="text-gray-400">{demo.language.name}</Table.Cell>
                <Table.Cell className="text-right space-x-2">
                  <button
                    onClick={() => handleEdit(demo)}
                    className="text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline transition-all rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(demo.uid)}
                    className="text-sm font-medium text-red-500 hover:text-red-400 hover:underline transition-all rounded-md"
                  >
                    Delete
                  </button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal
          show={modalOpen}
          onClose={handleModalClose}
          className="flex items-center justify-center"
        >
          <div className="relative bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
            <Modal.Header className="bg-gray-700 text-highlight-100 px-6 py-3 rounded-t-lg">
              {isEditing ? "Edit Demo" : "Create Demo"}
            </Modal.Header>
            <Modal.Body className="p-6 space-y-6 bg-gray-800">
              {/* Title Input */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-400">
                  Title
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="block w-full mt-1 p-2 rounded-md  placeholder-white bg-gray-700 border border-gray-500 text-white"
                  placeholder="Enter demo title"
                />
                
              </div>

              {/* Video Select */}
              <VideoSelect
                selectedVideoId={formData.youtube_id}
                onSelectVideo={(id, thumbnail) => {
                  handleInputChange("youtube_id", id);
                  handleInputChange("youtube_thumbnail", thumbnail);
                }}
              />

              {/* Exercise Select */}
              <ExerciseSelect
                initialExercises={formData.exercises}
                onSelectExercises={(exercises) =>
                  handleInputChange("exercises", exercises)
                }
              />

              {/* Tags and Language */}
              <div className="grid grid-cols-2 gap-4">
                <TagSelect
                  selectedTags={formData.tags.map((tag) => ({
                    label: tag,
                    value: tag,
                  }))}
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
                  handleChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                />
              </div>

              {/* Topic Select */}
              <TagSelect
                selectedTags={[{ value: formData.topic, label: formData.topic }]}
                setSelectedTags={(topic) =>
                  handleInputChange("topic", topic.value)
                }
                isMulti={false}
              />
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer className="bg-gray-800 px-6 py-3 flex justify-end rounded-b-lg">
              <Button
                onClick={handleSubmit}
                className="bg-accent-500 hover:bg-accent-600 text-white"
              >
                {isEditing ? "Update Demo" : "Create Demo"}
              </Button>
              <Button
                onClick={handleModalClose}
                className = "bg-red-500 hover:bg-red-600 text-white"
              >
                Cancel
              </Button>
            </Modal.Footer>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DemoForm;