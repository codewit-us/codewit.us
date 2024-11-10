import React, { useState, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import ReusableModal from "../components/ReusableModal";
import SubmitBtn from "../components/form/SubmitButton";
import InputLabel from "../components/form/InputLabel";
import TextInput from "../components/form/TextInput";
import Loading from "../components/loading/LoadingPage";
import Error from "../components/error/Error";
import CreateButton from "../components/CreateButton";
import { Resource } from "@codewit/interfaces";
import {
  usePostResource,
  usePatchResource,
  useFetchResources,
  useDeleteResource,
} from "../hooks/useResource";

interface ResourceWithId extends Resource {
  id?: string | number;
}

const ResourceForm = (): JSX.Element => {
  const { data: existingResources, error: fetchError, loading: fetchLoading, setData: setExistingResources } =
    useFetchResources();
  const postResource = usePostResource();
  const patchResource = usePatchResource();
  const deleteResource = useDeleteResource();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Resource>({
    uid: undefined,
    url: "",
    title: "",
    source: "",
    likes: 0,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchError) {
      setError("Failed to fetch resources.");
    }
  }, [fetchError]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (resource: Resource) => {
    setFormData(resource);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (item: { uid?: string | number }) => {
    console.log("here")
    console.log(existingResources)
    if (item.uid === undefined) return;
    try {
      await deleteResource(item.uid as number);
      setExistingResources((prev) => prev.filter((res) => res.uid !== item.uid));
    } catch {
      setError("Failed to delete resource.");
    }
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      if (isEditing && formData.uid) {
        const updatedResource = await patchResource(formData, formData.uid);
        setExistingResources((prev) =>
          prev.map((res) => (res.uid === formData.uid ? updatedResource : res))
        );
        setIsEditing(false);
      } else {
        const newResource = await postResource(formData);
        setExistingResources((prev) => [...prev, newResource]);
      }
      setModalOpen(false);
      setFormData({ uid: undefined, url: "", title: "", source: "", likes: 0 });
    } catch (err) {
      setError("Failed to submit resource.");
    }
  };

  if (fetchLoading) {
    return <Loading />;
  }

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "URL", accessor: "url" },
    { header: "Source", accessor: "source" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      {/* Create Resource Button */}
      <CreateButton onClick={() => setModalOpen(true)} title="Create Resource"/>
      {/* Existing Resources Table */}
      <ReusableTable
        columns={columns}
        data={existingResources}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal for Creating/Editing Resources */}
      <ReusableModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setIsEditing(false);
          setFormData({ uid: undefined, url: "", title: "", source: "", likes: 0 });
        }}
        title={isEditing ? "Edit Resource" : "Create Resource"}
        footerActions={
          <>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              {isEditing ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setModalOpen(false);
                setIsEditing(false);
                setFormData({ uid: undefined, url: "", title: "", source: "", likes: 0 });
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
              onChange={(e) => handleChange("title", e.target.value)}
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
              onChange={(e) => handleChange("url", e.target.value)}
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
              onChange={(e) => handleChange("source", e.target.value)}
              required
            />
          </div>
        </div>
      </ReusableModal>

      {/* Error Message */}
      {error && <Error message={error} />}
    </div>
  );
};

export default ResourceForm;
