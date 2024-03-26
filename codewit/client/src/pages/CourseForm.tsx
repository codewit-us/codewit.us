import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Select, { MultiValue } from 'react-select';
import LanguageSelect from '../components/form/LanguageSelect';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
import SubmitBtn from '../components/form/SubmitButton';
import { SelectStyles } from '../utils/styles';

interface ModuleOption {
  value: string;
  label: string;
}

interface Course {
  title: string;
  language: string;
  modules: string[];
  id: string | number;
}

const CourseForm = (): JSX.Element => {
  const [course, setCourse] = useState<Course>({
    title: '',
    language: 'cpp',
    modules: [],
    id: '',
  });

  const [moduleOptions, setModuleOptions] = useState<ModuleOption[]>([]);

  useEffect(() => {
    const storedModules = JSON.parse(localStorage.getItem('modules') || '[]');
    console.log(storedModules);
    const options: ModuleOption[] = storedModules.map((module: { id: string }) => ({
      value: module.id,
      label: module.id,
    }));
    setModuleOptions(options);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModuleChange = (selectedOption: MultiValue<ModuleOption>) => {
    setCourse((prev) => ({
      ...prev,
      modules: selectedOption ? selectedOption.map((option) => option.value) : [],
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const storedCourses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
    const newCourse = {
      ...course,
      id: Date.now(),
    };
    localStorage.setItem('courses', JSON.stringify([...storedCourses, newCourse]));
    setCourse({ title: '', language: 'cpp', modules: [], id: '' });
  };

  return (
    <div className="flex justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create Course</h2>
        <div>
          <InputLabel htmlFor="title">Title</InputLabel>
          <TextInput id="title" name="title" value={course.title} placeholder="Enter title" onChange={handleChange} required />
        </div>
        <LanguageSelect
          handleChange={handleChange}
          initialLanguage={course.language}
        />
        <div>
          <InputLabel htmlFor="modules">Modules</InputLabel>
          <Select
            id="modules"
            isMulti
            options={moduleOptions}
            className="text-sm bg-blue text-white border-none w-full rounded-lg"
            styles={SelectStyles}
            onChange={handleModuleChange}
            value={moduleOptions.filter((option) => course.modules.includes(option.value))}
          />
        </div>
        <SubmitBtn
          text={'Create'}
          disabled={course.title === '' || course.modules.length === 0}
        />
      </form>
    </div>
  );
};

export default CourseForm;
