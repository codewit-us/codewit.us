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
} from '../hooks/useCourse';
import { useFetchModules } from '../hooks/useModule';
import { useFetchUsers } from '../hooks/useUsers';

const CourseForm = (): JSX.Element => {
  const { fetchModules } = useFetchModules();
  const { fetchCourses } = useFetchCourses();
  const { deleteCourse } = useDeleteCourse();
  const { patchCourse } = usePatchCourse();
  const { postCourse } = usePostCourse();
  const { fetchUsers } = useFetchUsers();

  const [course, setCourse] = useState<Course>({
    title: '',
    language: 'cpp',
    modules: [],
    id: '',
    instructors: [],
    roster: []
  });

  const [moduleOptions, setModuleOptions] = useState<SelectedTag[]>([]);
  const [userOptions, setUserOptions] = useState<SelectedTag[]>([]);
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
        const users = await fetchUsers();
        const userOptions = users.map((user: any) => ({
          value: user.uid,
          label: user.username
        }));
        setUserOptions(userOptions);
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

const handleSelectChange = (selectedOption: MultiValue<SelectedTag>, name: string) => {
  if (name === 'modules') {
    setCourse(prev => ({
      ...prev,
      modules: selectedOption ? selectedOption.map(option => option.value) : [],
    }));
  } else if (name === 'instructors') {
    setCourse(prev => ({
      ...prev,
      instructors: selectedOption ? selectedOption.map(option => parseInt(option.value)) : [],
    }));
  } else if (name === 'roster') {
    setCourse(prev => ({
      ...prev,
      roster: selectedOption ? selectedOption.map(option => parseInt(option.value)) : [],
    }));
  }
};

  const handleEdit = (id: string | number) => {
    setIsEditing(true);
    const foundCourse = courses.find(course => course.id === id);
    if (foundCourse) {
      const arrayOfModuleIds = foundCourse.modules.map(module => (module.uid));
      const arrayOfInstrIds = foundCourse.instructors.map(instr => (instr.uid));
      const arrayOfRosterIds = foundCourse.roster.map(roster => (roster.uid));
      const courseToEdit = {
        title: foundCourse.title,
        language: foundCourse.language.name,
        modules: arrayOfModuleIds,
        id: foundCourse.id,
        instructors: arrayOfInstrIds,
        roster: arrayOfRosterIds
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
        setCourse({ title: '', language: 'cpp', modules: [], id: '', instructors: [], roster: []});
      } else {
        const res = await postCourse(course);
        setCourses(prev => [...prev, res]);
        setCourse({ title: '', language: 'cpp', modules: [], id: '', instructors: [], roster: []});
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
            onChange={(selectedOption: MultiValue<SelectedTag>) => handleSelectChange(selectedOption, 'modules')}
            value={moduleOptions.filter((option) => course.modules.includes(option.value))}
          />
        </div>
        <div>
          <InputLabel htmlFor="instructors">Instructors</InputLabel>
          <Select 
            id = "instructors"
            isMulti
            options={userOptions}
            className="text-sm bg-blue text-white border-none w-full rounded-lg"
            styles={SelectStyles}
            onChange={(selectedOption: MultiValue<SelectedTag>) => handleSelectChange(selectedOption, 'instructors')}
            value={userOptions.filter((option) => course.instructors.includes(parseInt(option.value)))}
          />
        </div>
        <div>
          <InputLabel htmlFor="roster">Roster</InputLabel>
          <Select 
            id = "roster"
            isMulti
            options={userOptions}
            className="text-sm bg-blue text-white border-none w-full rounded-lg"
            styles={SelectStyles}
            onChange={(selectedOption: MultiValue<SelectedTag>) => handleSelectChange(selectedOption, 'roster')}
            value={userOptions.filter((option) => course.roster.includes(parseInt(option.value)))}
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
