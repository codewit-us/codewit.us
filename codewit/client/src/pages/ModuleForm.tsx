import React, { useState, useEffect } from "react";
import Select, { MultiValue } from "react-select";
import LanguageSelect from "../components/form/LanguageSelect";
import TopicSelect from "../components/form/TagSelect";
import ResourceSelect from "../components/form/ResourceSelect";
import CreateButton from "../components/CreateButton";
import ReusableTable from "../components/ReusableTable";
import ReusableModal from "../components/ReusableModal";
import Error from "../components/error/Error";
import Loading from "../components/loading/LoadingPage";
import { SelectedTag, Module } from "@codewit/interfaces";
import { useFetchResources } from "../hooks/useResource";
import {
  usePostModule,
  useFetchModules,
  useDeleteModule,
  usePatchModule,
} from "../hooks/useModule";

const ModuleForm = (): JSX.Element => {
  const { data: existingResources, error: fetchResourceError } = useFetchResources();
  const { data: existingModules, setData: setExistingModules, error: fetchModuleError } = useFetchModules();

  const postModule = usePostModule();
  const patchModule = usePatchModule();
  const deleteModule = useDeleteModule();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Module>({
    language: "cpp",
    topic: "",
    resources: [],
  });

  const [resourceOptions, setResourceOptions] = useState<SelectedTag[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchResourceError || fetchModuleError) {
      setError("Failed to fetch resources or modules.");
    }

    const resourceOptions = existingResources.map((resource: any) => ({
      value: resource.uid,
      label: resource.title,
    }));
    setResourceOptions(resourceOptions);
  }, [existingResources, fetchResourceError, fetchModuleError]);

  const handleResourceChange = (selectedOptions: MultiValue<SelectedTag>) => {
    const resources = selectedOptions.map((option) => option.value);
    setFormData((prev) => ({ ...prev, resources }));
  };

  const handleTopicSelect = (topics: SelectedTag | SelectedTag[]) => {
    const topic = Array.isArray(topics) ? topics[0].value : topics.value;
    setFormData((prev) => ({ ...prev, topic }));
  };

  const handleEdit = (module: Module) => {
    setFormData({
      ...module,
      language: module.language.name,
      topic: module.topic,
      resources: module.resources.map((resource) => resource.uid),
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (module: Module) => {
    try {
      await deleteModule(module.uid);
      setExistingModules((prev) => prev.filter((mod) => mod.uid !== module.uid));
    } catch (err) {
      setError("Error deleting module.");
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        const updatedModule = await patchModule(formData, formData.uid as number);
        setExistingModules((prev) =>
          prev.map((mod) => (mod.uid === formData.uid ? updatedModule : mod))
        );
        setIsEditing(false);
      } else {
        const newModule = await postModule(formData);
        setExistingModules((prev) => [...prev, newModule]);
      }
      setFormData({ language: "cpp", topic: "", resources: [] });
      setModalOpen(false);
    } catch (err) {
      setError("Error saving module.");
    }
  };

  const columns = [
    { header: "Topic", accessor: "topic" },
    { header: "Language", accessor: "language.name" },
    { header: "Resources", accessor: "resources.length" }, // Number of resources
  ];

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      {/* Create Module Button */}
      <CreateButton onClick={() => setModalOpen(true)} title="Create Module" />

      {/* Existing Modules Table */}
      <ReusableTable
        columns={columns}
        data={existingModules}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal for Creating/Editing Module */}
      <ReusableModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setIsEditing(false);
          setFormData({ language: "cpp", topic: "", resources: [] });
        }}
        title={isEditing ? "Edit Module" : "Create Module"}
        footerActions={
          <>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              {isEditing ? "Save Changes" : "Create Module"}
            </button>
            <button
              onClick={() => {
                setModalOpen(false);
                setIsEditing(false);
                setFormData({ language: "cpp", topic: "", resources: [] });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <TopicSelect
            selectedTags={[{ value: formData.topic, label: formData.topic }]}
            setSelectedTags={handleTopicSelect}
            isMulti={false}
          />

          <LanguageSelect
            handleChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                language: e.target.value,
              }))
            }
            initialLanguage={formData.language}
          />

          <ResourceSelect
            resourceOptions={resourceOptions}
            selectedResources={formData.resources}
            handleResourceChange={handleResourceChange}
          />
        </div>
      </ReusableModal>
    </div>
  );
};

export default ModuleForm;