import React, { useState, useEffect } from "react";
import ReusableTable from "../components/form/ReusableTable";
import ReusableModal from "../components/form/ReusableModal";
import InputLabel from "../components/form/InputLabel";
import TextInput from "../components/form/TextInput";
import CreateButton from "../components/form/CreateButton";
import { toast } from "react-toastify";
import { Resource } from "@codewit/interfaces";
import { isFormValid } from "../utils/formValidationUtils";
import {
  usePostResource,
  usePatchResource,
  useFetchResources,
  useDeleteResource,
} from "../hooks/useResource";

const ResourceForm = (): JSX.Element => {
  const { data: existingResources, setData: setExistingResources } =
    useFetchResources();
  const postResource = usePostResource();
  const patchResource = usePatchResource();
  const deleteResource = useDeleteResource();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Resource>({
    uid: undefined,
    url: "",
    title: "",
    source: "",
    likes: 0,
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && formData.uid) {
        const updatedResource = await patchResource(formData, formData.uid);
        setExistingResources((prev) =>
          prev.map((res) => (res.uid === formData.uid ? updatedResource : res))
        );
        toast.success("Resource successfully updated!");
      } else {
        const newResource = await postResource(formData);
        setExistingResources((prev) => [...prev, newResource]);
        toast.success("Resource successfully created!");
      }
      resetForm();
      setModalOpen(false);
    } catch (error) {
      toast.error("Failed to save resource. Please try again.");
      console.error("Error saving resource:", error);
    }
  };

  const handleEdit = (resource: Resource) => {
    setFormData(resource);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (resource: Resource) => {
    try {
      if (resource.uid === undefined) return;
      await deleteResource(resource.uid);
      setExistingResources((prev) =>
        prev.filter((res) => res.uid !== resource.uid)
      );
      toast.success("Resource successfully deleted!");
    } catch (error) {
      toast.error("Failed to delete resource.");
      console.error("Error deleting resource:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      uid: undefined,
      url: "",
      title: "",
      source: "",
      likes: 0,
    });
    setIsEditing(false);
  };

  const requiredFields = ["url", "title", "source"];
  const isValid = isFormValid(formData, requiredFields);

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "URL", accessor: "url" },
    { header: "Source", accessor: "source" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      <CreateButton onClick={() => setModalOpen(true)} title="Create Resource" />

      <ReusableTable
        columns={columns}
        data={existingResources}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ReusableModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Edit Resource" : "Create Resource"}
        footerActions={
          <>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`px-4 py-2 rounded-md ${
                isValid ? "bg-blue-500 text-white" : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
            >
              {isEditing ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <InputLabel htmlFor="title">Title</InputLabel>
            <TextInput
              id="title"
              name="title"
              value={formData.title}
              placeholder="Enter resource title"
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div>
            <InputLabel htmlFor="url">URL</InputLabel>
            <TextInput
              id="url"
              name="url"
              value={formData.url}
              placeholder="Enter resource URL"
              onChange={(e) => handleInputChange("url", e.target.value)}
              required
            />
          </div>

          <div>
            <InputLabel htmlFor="source">Source</InputLabel>
            <TextInput
              id="source"
              name="source"
              value={formData.source}
              placeholder="Enter resource source"
              onChange={(e) => handleInputChange("source", e.target.value)}
              required
            />
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default ResourceForm;