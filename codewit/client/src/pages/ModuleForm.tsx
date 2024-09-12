import { useState, useEffect } from 'react';
import Select, { MultiValue } from 'react-select';
import LanguageSelect from "../components/form/LanguageSelect";
import SubmitBtn from "../components/form/SubmitButton";
import TopicSelect from "../components/form/TagSelect";
import { SelectStyles } from '../utils/styles';
import Error from '../components/error/Error';
import { SelectedTag } from '@codewit/interfaces';
import ExistingTable from '../components/form/ExistingTable';
import { Module } from '@codewit/interfaces';
import { useFetchResources } from '../hooks/useResource';
import { usePostModule, useFetchModules, useDeleteModule, usePatchModule } from '../hooks/useModule';

const ModuleForm = (): JSX.Element => {
  const { data: existingResources, error: fetchResourceError } = useFetchResources();
  const { data: existingModules, setData: setExistingModules, error: fetchModuleError } = useFetchModules();
  
  const postModule = usePostModule();
  const patchModule = usePatchModule();
  const deleteModule = useDeleteModule();

  const [module, setModule] = useState<Module>({
    language: 'cpp',
    topic: '',
    resources: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [resourceOptions, setResourceOptions] = useState<SelectedTag[]>([]);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (fetchResourceError || fetchModuleError) {
      setError(true);
    }

    const resourceOptions = existingResources.map((resource: any) => ({
      value: resource.uid,
      label: resource.title,
    }));
    setResourceOptions(resourceOptions);
  }, [existingResources, fetchResourceError, fetchModuleError]);

  const handleResourceChange = (selectedOptions: MultiValue<SelectedTag>) => {
    const resources = selectedOptions.map(option => option.value);
    setModule(prev => ({ ...prev, resources }));
  };

  const handleTopicSelect = (topics: SelectedTag | SelectedTag[]) => {
    const topic = Array.isArray(topics) ? topics[0].value : topics.value;
    setModule(prev => ({ ...prev, topic }));
  };

  const handleEdit = (uid: number) => {
    const editModule = existingModules.find(module => module.uid === uid);
    if (editModule) {
      setIsEditing(true);
      const resourceIds = editModule.resources.map(resource => resource.uid);
      setModule({ ...editModule, resources: resourceIds });
    }
  };

  const handleDelete = async (uid: number) => {
    try {
      await deleteModule(uid);
      setExistingModules(prev => prev.filter(module => module.uid !== uid));
    } catch (err) {
      console.error('Error removing module', err);
      setError(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const resources = module.resources;
        const topic = module.topic;
        const language = module.language.name;
        const updatedModule = {
          language,
          topic,
          resources
        };
        const res = await patchModule(updatedModule, module.uid as number);
        setExistingModules(prev => prev.map(mod => mod.uid === module.uid ? res : mod));
        setIsEditing(false);
      } else {
        const res = await postModule(module);
        setExistingModules(prev => [...prev, res]);
      }
      setModule({ language: 'cpp', topic: '', resources: [] });
    } catch (err) {
      console.error('Error creating/updating module', err);
      setError(true);
    }
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex justify-center items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 bg-opacity-50 w-full h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">{isEditing ? 'Edit Module' : 'Create Module'}</h2>
        <div className="flex flex-row w-full gap-3 mb-8">
          <TopicSelect
            selectedTags={[{ value: module.topic, label: module.topic }]}
            setSelectedTags={handleTopicSelect}
            isMulti={false}
          />
          <LanguageSelect
            handleChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModule(prev => ({ ...prev, language: e.target.value }))}
            initialLanguage={module.language.name || module.language}
          />
        </div>
        <div>
          <label htmlFor="resource-select" className="block text-sm mb-2 font-medium text-white">Select Resources</label>
          <Select
            id="resource-select"
            value={resourceOptions.filter(option => module.resources.includes(option.value))}
            onChange={handleResourceChange}
            options={resourceOptions}
            className="text-sm bg-blue text-white border-none w-full rounded-lg"
            styles={SelectStyles}
            isMulti
            placeholder="Select..."
          />
        </div>
        <SubmitBtn
          text={isEditing ? 'Confirm Edit' : 'Create'}
          disabled={module.topic === '' || module.language === ''}
        />
      </form>
      <ExistingTable
        items={existingModules}
        name="Modules"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ModuleForm;
