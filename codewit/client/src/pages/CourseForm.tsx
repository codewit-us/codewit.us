import { useState, useEffect, ChangeEvent } from 'react';
import Select, { MultiValue } from 'react-select';
import LanguageSelect from '../components/form/LanguageSelect';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
import SubmitBtn from '../components/form/SubmitButton';
import { SelectStyles } from '../utils/styles';
import { SelectedTag } from '@codewit/interfaces';
import ExistingTable from '../components/form/ExistingTable';

interface Course {
  title: string;
  language: string;
  modules: string[];
  uid: string | number;
}

const CourseForm = (): JSX.Element => {
  const [course, setCourse] = useState<Course>({
    title: '',
    language: 'cpp',
    modules: [],
    uid: '',
  });

  const [moduleOptions, setModuleOptions] = useState<SelectedTag[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const storedModules = JSON.parse(localStorage.getItem('modules') || '[]');
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    setCourses(storedCourses);
    const options: SelectedTag[] = storedModules.map((module: { uid: string }) => ({
      value: module.uid,
      label: module.uid,
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

  const handleModuleChange = (selectedOption: MultiValue<SelectedTag>) => {
    setCourse((prev) => ({
      ...prev,
      modules: selectedOption ? selectedOption.map((option) => option.value) : [],
    }));
  };

  const handleEdit = (uid: number) => {
    setIsEditing(true);
    const foundCourse = courses.find(course => course.uid === uid);
    if (foundCourse) {
      setCourse(foundCourse);
    }
  }
  
  const handleDelete = (uid: number) => {
    const updatedCourses = courses.filter(course => course.uid !== uid);
    setCourses(updatedCourses);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
  }
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(isEditing) {
      const updatedCourses = courses.map(c => c.uid === course.uid ? course : c);
      setCourses(updatedCourses);
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      setIsEditing(false);
    } else {
      const newCourse = {
        ...course,
        uid: Date.now(),
      };
      const newCoursesArray = [...courses, newCourse];
      setCourses(newCoursesArray);
      localStorage.setItem('courses', JSON.stringify(newCoursesArray));
      setCourse({ title: '', language: 'cpp', modules: [], uid: '' }); 
    }
  };

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
