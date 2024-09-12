import { useState, useEffect } from 'react';
import Select, { MultiValue } from 'react-select';
import LanguageSelect from "../components/form/LanguageSelect";
import SubmitBtn from "../components/form/SubmitButton";
import TopicSelect from "../components/form/TagSelect";
import axios from 'axios';
import { SelectStyles } from '../utils/styles';
import Error from '../components/error/Error';
import { SelectedTag } from '@codewit/interfaces';
import ExistingTable from '../components/form/ExistingTable';
import { Module } from '@codewit/interfaces';
import { useFetchResources } from '../hooks/useResource';
import { usePostModule, useFetchModules, useDeleteModule, usePatchModule } from '../hooks/useModule';
const ModuleForm = (): JSX.Element => {
  const { data: existingResources, error: fetchError, loading: fetchLoading, setData: setExistingResources } = useFetchResources();
  const { fetchModules } = useFetchModules();
  const { deleteModule } = useDeleteModule();
  const { patchModule } = usePatchModule();
  const { postModule } = usePostModule();
  const [module, setModule] = useState<Module>({
    language: 'cpp',
    topic: '',
    resources: []
  });
  const [existingModules, setExistingModules] = useState<Module[]>();
  const [isEditing, setIsEditing] = useState(false);
  const [resourceOptions, setResourceOptions] = useState<SelectedTag[]>([]);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const resModules = await fetchModules();
        setExistingModules(resModules);
        const options = existingResources.map((resource: any) => ({
          value: resource.uid,
          label: resource.title
        }));
        setResourceOptions(options);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    }
    fetchItems();
  }, []);

  const handleChange = (selectedOptions: MultiValue<SelectedTag>) => {
    const resources = selectedOptions.map(option => option.value);
    setModule(prev => ({ ...prev, resources }));
  }

  const handleTopicSelect = (topics: SelectedTag | SelectedTag[]) => {
    const topic = Array.isArray(topics) ? topics[0].value : topics.value;
    setModule(prev => ({ ...prev, topic }));
  };

  const handleEdit = (uid: number) => {
    const editModule = existingModules.find(module => module.uid === uid);
    if (editModule) {
      setIsEditing(true);
      setModule(editModule);
      // get an array of select resources id
      const options = editModule.resources.map(resource => (resource.uid));
      setModule(prev => ({ ...prev, resources: options }));
    }
  }
  
  const handleDelete = async (uid: number) => {
    try {
      await deleteModule(uid);
      const updatedModules = existingModules.filter(module => module.uid !== uid);
      setExistingModules(updatedModules);
    } catch (err) {
      console.error('Error removing module', err);
      setError(true);
    }
  }; 
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditing) {
      const resources = module.resources ? module.resources : module.resources.map(resource => (resource.uid));
      const topic = module.topic;
      const language = module.language.name ? module.language.name : module.language;
      const editedModule = {
        language: language,
        topic: topic,
        resources: resources
      }
      const res = await patchModule(editedModule, module.uid as number);
      const updatedModules = existingModules.map(mod => mod.uid === module.uid ? res : mod);
      setExistingModules(updatedModules);
      setModule({ language: 'cpp', topic: '', resources: [] });
      setIsEditing(false);
    } else {
      const response = await postModule(module);
      setExistingModules([...existingModules, response]);
    }
    setModule({ language: 'cpp', topic: '', resources: [] });
  }; 

  if (error) {
    return (<Error />)
  }

  return (
      <div className="flex justify-center items-start h-full bg-zinc-900 overflow-auto">
        <form onSubmit={handleSubmit} className=" bg-gray-800 bg-opacity-50 w-full h-full p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Create Module</h2>
          <div className="flex flex-row w-full gap-3 mb-8">
            <TopicSelect 
              selectedTags={[{value: module.topic, label: module.topic}]} 
              setSelectedTags={handleTopicSelect}
              isMulti={false}
            />
            <LanguageSelect 
              handleChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModule(prev => ({...prev, language: e.target.value}))}
              initialLanguage={module.language}
            />
          </div>
          <div>
            <label htmlFor="resource-select" className="block text-sm mb-2 font-medium text-white"> Select Resources </label>
            <Select
              id='resource-select'
              value={resourceOptions.filter(option => module.resources.includes(option.value))}
              onChange={handleChange}
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
          <div>
            {module.demos &&  (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Linked Demos</h3>
                <ul className="list-disc pl-5 text-white">
                  {module.demos.map((demo) => (
                    <li key={demo.uid}>
                      {demo.title}
                    </li>
                  ))}
                </ul>
              </div>
            ) }
          </div>
        </form>
        <ExistingTable 
          items={existingModules} 
          name="Modules" 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
    </div>
  );
}

export default ModuleForm;
