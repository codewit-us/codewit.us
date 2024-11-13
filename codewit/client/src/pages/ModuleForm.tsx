import { useState, useEffect } from 'react';
import Select, { MultiValue } from 'react-select';
import LanguageSelect from "../components/form/LanguageSelect";
import SubmitBtn from "../components/form/SubmitButton";
import TopicSelect from "../components/form/TagSelect";
import { SelectStyles } from '../utils/styles';
import Error from '../components/error/Error';
import ExistingTable from '../components/form/ExistingTable';
import { useFetchResources } from '../hooks/useResource';
import { SelectedTag, Module } from '@codewit/interfaces';
import { usePostModule, useFetchModules, useDeleteModule, usePatchModule } from '../hooks/useModule';
import ResourceSelect from '../components/form/ResourceSelect';

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
    <div className="flex h-full bg-zinc-900 p-6 gap-6 overflow-hidden">
      <div className="w-1/3 min-w-[450px]">
        <form onSubmit={handleSubmit} className="bg-gray-800/90 rounded-xl shadow-lg p-6 h-full">
          <h2 className="text-xl font-bold text-white mb-6">
            {isEditing ? 'Edit Module' : 'Create Module'}
          </h2>
          
          <div className="space-y-6">
              <TopicSelect
                selectedTags={[{ value: module.topic, label: module.topic }]}
                setSelectedTags={handleTopicSelect}
                isMulti={false}
              />
            
              <LanguageSelect
                handleChange={(e) => setModule(prev => ({ 
                  ...prev, 
                  language: e.target.value 
                }))}
                initialLanguage={module.language.name || module.language}
              />

              <ResourceSelect
                resourceOptions={resourceOptions}
                selectedResources={module.resources}
                handleResourceChange={handleResourceChange}
              />

              <SubmitBtn
                text={isEditing ? 'Save Changes' : 'Create Module'}
                disabled={module.topic === '' || module.language === ''}
              />
          </div>
        </form>
      </div>

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
