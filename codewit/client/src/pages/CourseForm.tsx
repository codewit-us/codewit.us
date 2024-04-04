import { useState, useEffect, ChangeEvent } from 'react';
import Select, { MultiValue } from 'react-select';
import LanguageSelect from '../components/form/LanguageSelect';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
import SubmitBtn from '../components/form/SubmitButton';
import { SelectStyles } from '../utils/styles';
import Error from '../components/error/Error';
import { SelectedTag } from '@codewit/interfaces';
import ExistingTable from '../components/form/ExistingTable';
import axios from 'axios';

interface Course {
  title: string;
  language: string;
  modules: string[];
  id?: string | number;
}

const CourseForm = (): JSX.Element => {
  const [course, setCourse] = useState<Course>({
    title: '',
    language: 'cpp',
    modules: [],
    id: '',
  });

  const [moduleOptions, setModuleOptions] = useState<SelectedTag[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    axios.get('/modules').then(res => {
      const options: SelectedTag[] = res.data.map((module: any) => ({
        value: module.uid, 
        label: `Module ${module.uid}` 
      }));
      setModuleOptions(options);
    }).catch(err => {
      console.error(err);
      setError(true);
    })

    axios.get('/courses').then(res => {
      setCourses(res.data);
    }).catch(err => {
      console.error(err);
      setError(true);
    })

  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModuleChange = (selectedOption: MultiValue<SelectedTag>) => {
    setCourse((prev) => ({
      ...prev,
      modules: selectedOption ? selectedOption.map((option) => option.value) : [],
    }));
  };

  const handleEdit = (id: string | number) => {
    setIsEditing(true);
    const foundCourse = courses.find(course => course.id === id);
    if (foundCourse) {
      const arrayOfModuleIds = foundCourse.modules.map(module => (module.uid));
      console.log(arrayOfModuleIds)
      const courseToEdit = {
        title: foundCourse.title,
        language: foundCourse.language.name,
        modules: arrayOfModuleIds,
        id: foundCourse.id,
      }
      setCourse(courseToEdit);
    }
  }
  
  const handleDelete = (id: string | number) => {
    axios.delete(`/courses/${id}`);
    const updatedCourses = courses.filter(course => course.id !== id);
    setCourses(updatedCourses);
  }
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(isEditing) {
      console.log(course)
      axios.patch(`/courses/${course.id}`, course);
      const updatedCourses = courses.map(c => c.id === course.id ? course : c);
      setCourses(updatedCourses);
      setIsEditing(false);
      setCourse({ title: '', language: 'cpp', modules: [], id: '' });
    } else {
      axios.post('/courses', course).then(res => {
        setCourses(prev => [...prev, res.data]);
      });
      setCourse({ title: '', language: 'cpp', modules: [], id: '' }); 
    }
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex gap-2 justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
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
          text={isEditing ? 'Confirm Edit' : 'Create'}
          disabled={course.title === '' || course.modules.length === 0}
        />
      </form>
      <ExistingTable
        items={courses}
        name="Courses"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CourseForm;
