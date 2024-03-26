import Select from 'react-select';
import LanguageSelect from "../components/form/LanguageSelect";
import SubmitBtn from "../components/form/SubmitButton";
import TopicSelect from "../components/form/TagSelect";
import axios from 'axios';
import { DemoResponse } from '@codewit/interfaces';
import { useEffect, useState } from 'react';
import { SelectStyles } from '../utils/styles';

interface Tag {
  value: string;
  label: string;
}

interface ResourceOption {
  value: string;
  label: string;
}

interface ModuleState {
  language: string;
  topic: string;
  demos: DemoResponse[];
  resources: string[]; 
}

const ModuleForm = (): JSX.Element => {
  const [module, setModule] = useState<ModuleState>({
    language: 'cpp',
    topic: '',
    demos: [],
    resources: []
  });

  const [demos, setDemos] = useState<DemoResponse[]>([]);
  const [resourceOptions, setResourceOptions] = useState<ResourceOption[]>([]);

  useEffect(() => {
    axios.get('/demos')
      .then(res => {
        setDemos(res.data);
      })
    .catch(err => console.error(err));
    const storedResources = JSON.parse(localStorage.getItem('resources') || '[]');
    const options = storedResources.map((res: any) => ({
      value: res.id, 
      label: res.title 
    }));
    setResourceOptions(options);
  }, []);

  useEffect(() => {
    if (module.language && module.topic) {
      const filteredDemos = demos.filter(demo => (demo.language as { name: string }).name === module.language && demo.tags.some(tag => tag.name === module.topic));
      setModule(prev => ({
        ...prev,
        demos: filteredDemos
      }));
    }
  }, [module.language, module.topic, demos]);  

  const handleChange = (selectedOptions: any) => {
    setModule(prev => ({
      ...prev,
      resources: selectedOptions ? selectedOptions.map((option: ResourceOption) => option.value) : []
    }));
  };

  const handleTagSelect = (tag: Tag | Tag[]) => {
    const selectedTag = Array.isArray(tag) ? tag[0] : tag;
    setModule(prev => ({...prev, topic: selectedTag.value}));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    const newModule = { ...module, id: Date.now() };
    const existingModules = JSON.parse(localStorage.getItem('modules') || '[]');
    existingModules.push(newModule);
    localStorage.setItem('modules', JSON.stringify(existingModules));
    console.log('submitted', newModule);
  };

  return (
    <div className="flex justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Create Module</h2>
          <div className="flex flex-row w-full gap-3 mb-8">
            <TopicSelect 
              selectedTags={[{value: module.topic, label: module.topic}]} 
              setSelectedTags={handleTagSelect}
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
            text={'Create'} 
            disabled={module.topic === '' || module.language === ''}
          />
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Demos</h3>
            {module.demos.length > 0 ? (
              <ul className="list-disc pl-5 text-white">
                {module.demos.map((demo) => (
                  <li key={demo.uid}>
                    {demo.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white">No demos found for the selected language and topic.</p>
            )}
          </div>
        </form>
    </div>
  );
}

export default ModuleForm;
