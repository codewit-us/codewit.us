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
import { Course } from '@codewit/interfaces';
import { 
  usePostCourse, 
  usePatchCourse, 
  useFetchCourses, 
  useDeleteCourse  
} from '../hooks/coursehooks/useCourseHook';
import { useFetchModules } from '../hooks/modulehooks/useModuleHooks';

const CourseForm = (): JSX.Element => {
  const { fetchModules } = useFetchModules();
  const { fetchCourses } = useFetchCourses();
  const { deleteCourse } = useDeleteCourse();
  const { patchCourse } = usePatchCourse();
  const { postCourse } = usePostCourse();

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
    const fetchItems = async () => {
      try {
        const resModules = await fetchModules();
        const options = resModules.map((module: any) => ({
          value: module.uid,
          label: module.uid
        }));
        setModuleOptions(options);
        const resCourses = await fetchCourses();
        setCourses(resCourses);

      } catch (err) {
        console.error(err);
        setError(true);
      }
    }
    fetchItems();
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
      const courseToEdit = {
        title: foundCourse.title,
        language: foundCourse.language.name,
        modules: arrayOfModuleIds,
        id: foundCourse.id,
      }
      setCourse(courseToEdit);
    }
  }
  
  const handleDelete = async (id: string | number) => {
    try {
      await deleteCourse(id);
      const updatedCourses = courses.filter(course => course.id !== id);
      setCourses(updatedCourses);
    } catch (err) {
      console.error("Failed to delete course", err)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if(isEditing) {
        await patchCourse(course, course.id ?? -1);
        const updatedCourses = courses.map(c => c.id === course.id ? course : c);
        setCourses(updatedCourses);
        setIsEditing(false);
        setCourse({ title: '', language: 'cpp', modules: [], id: '' });
      } else {
        const res = await postCourse(course);
        setCourses(prev => [...prev, res]);
        setCourse({ title: '', language: 'cpp', modules: [], id: '' }); 
      }
    } catch (err) {
      console.error('Error creating/updating course', err);
      setError(true);
    }
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex justify-center items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
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
