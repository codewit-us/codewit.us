// codewit/client/src/pages/ModuleForm.tsx
import React, { useState, useEffect } from "react";
import Select, { MultiValue } from "react-select";
import LanguageSelect from "../components/form/LanguageSelect";
import TopicSelect from "../components/form/TagSelect";
import ResourceSelect from "../components/form/ResourceSelect";
import CreateButton from "../components/form/CreateButton";
import ReusableTable, { Column } from "../components/form/ReusableTable";
import ReusableModal from "../components/form/ReusableModal";
import { toast } from "react-toastify";
import { SelectedTag, Module } from "@codewit/interfaces";
import { isFormValid } from "../utils/formValidationUtils";
import { useFetchResources } from "../hooks/useResource";
import {
  usePostModule,
  useFetchModules,
  useDeleteModule,
  usePatchModule,
} from "../hooks/useModule";

type ModuleDraft = Omit<Module, "completion">;

const ModuleForm = (): JSX.Element => {
  const { data: existingResources } = useFetchResources();
  const { data: existingModules, setData: setExistingModules } = useFetchModules();

  const postModule = usePostModule();
  const patchModule = usePatchModule();
  const deleteModule = useDeleteModule();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ModuleDraft>({
    demos: [],
    uid: undefined,
    language: "cpp",
    topic: "",
    resources: []
  });

  const [resourceOptions, setResourceOptions] = useState<SelectedTag[]>([]);

  useEffect(() => {
    const options = existingResources.map((resource: any) => ({
      value: resource.uid,
      label: resource.title,
    }));
    setResourceOptions(options);
  }, [existingResources]);

  const handleResourceChange = (selectedOptions: MultiValue<SelectedTag>) => {
    const resources = selectedOptions.map((option) => option.value);
    // @ts-ignore
    setFormData((prev) => ({ ...prev, resources }));
  };

  const handleTopicSelect = (topics: SelectedTag | SelectedTag[]) => {
    const topic = Array.isArray(topics) ? topics[0].value : topics.value;
    setFormData((prev) => ({ ...prev, topic: String(topic) }));
  };

  const handleEdit = (module: Module) => {
    setFormData({
      ...module,
      language: module.language,
      topic: module.topic,
      // @ts-ignore
      resources: module.resources.map((resource) => resource.uid),
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (module: Module) => {
    try {
      if (module.uid !== undefined) {
        await deleteModule(module.uid);
      } else {
        toast.error("Module UID is undefined. Cannot delete module.");
      }
      setExistingModules((prev) =>
        prev.filter((mod) => mod.uid !== module.uid)
      );
      toast.success("Module successfully deleted!");
    } catch (error) {
      toast.error("Failed to delete module. Please try again.");
      console.error("Error deleting module:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        const updatedModule = await patchModule(formData, formData.uid as number);
        setExistingModules((prev) =>
          prev.map((mod) =>
            mod.uid === formData.uid ? updatedModule : mod
          )
        );
        toast.success("Module successfully updated!");
      } else {
        const newModule = await postModule(formData);
        setExistingModules((prev) => [...prev, newModule]);
        toast.success("Module successfully created!");
      }
      resetForm();
      setModalOpen(false);
    } catch (error) {
      toast.error("Failed to save module. Please try again.");
      console.error("Error saving module:", error);
    }
  };

  const resetForm = () => {
    setFormData({ demos: [], uid: undefined, language: "cpp", topic: "", resources: [] });
    setIsEditing(false);
  };

  const requiredFields = ["topic", "language"];
  const isValid = isFormValid(formData, requiredFields);

  const columns: Column<Module>[] = [
    { header: "Topic", accessor: "topic" },
    { header: "Language", accessor: (row) => row.language },
    { header: "Resources", accessor: (row) => row.resources.length },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      <CreateButton onClick={() => setModalOpen(true)} title="Create Module" />

      <ReusableTable
        columns={columns}
        data={existingModules}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ReusableModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={isEditing ? "Edit Module" : "Create Module"}
        footerActions={
          <>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              data-testid="submit-button"
              className={`px-4 py-2 rounded-md ${
                isValid
                  ? "bg-blue-500 text-white"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
            >
              {isEditing ? "Save Changes" : "Create Module"}
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