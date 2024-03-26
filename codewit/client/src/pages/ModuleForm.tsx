import LanguageSelect from "../components/form/LanguageSelect";
import SubmitBtn from "../components/form/SubmitButton";
import TopicSelect from "../components/form/TagSelect";
import {useState} from 'react';

interface Tag {
  value: string;
  label: string;
}

const ModuleForm = ():JSX.Element => {

  const [module, setModule] = useState({
    language: 'cpp',
    topic: '',
    demos: [],
    resources:[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {name, value} = e.target;
    setModule(prev => ({...prev, [name]: value}));
  }

  const handleTagSelect = (tag: Tag | Tag[]) => {
    const selectedTag = Array.isArray(tag) ? tag[0] : tag;
    setModule(prev => ({...prev, topic: selectedTag.value}));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

  return (
    <div className="flex justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Create Module</h2>
          <div className = "flex flex-row w-full gap-3 mb-8">
            <TopicSelect 
              selectedTags={[{value: module.topic, label: module.topic}]} 
              setSelectedTags={handleTagSelect}
              isMulti={false}
            />
            <LanguageSelect 
              handleChange={handleChange}
              initialLanguage={module.language}
            />
          </div>
          <SubmitBtn text={'Create'} />
        </form>
    </div>
  )
}

export default ModuleForm;