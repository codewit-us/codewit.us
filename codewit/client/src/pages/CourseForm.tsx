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
  const { data: modules, error: fetchModuleError } = useFetchModules();
  const { data: courses, setData: setCourses, error: fetchCoursesError } = useFetchCourses();
  const { data: users, error: fetchUsersError } = useFetchUsers();
  
  const postCourse = usePostCourse();
  const patchCourse = usePatchCourse();
  const deleteCourse = useDeleteCourse();

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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (fetchModuleError || fetchCoursesError || fetchUsersError) {
      setError(true);
    }

    const options = modules.map((module: any) => ({
      value: module.uid,
      label: module.uid
    }));
    setModuleOptions(options);

    const userOptions = users.map((user: any) => ({
      value: user.uid,
      label: user.username
    }));
    setUserOptions(userOptions);

  }, [modules, courses, users, fetchModuleError, fetchCoursesError, fetchUsersError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (selectedOption: MultiValue<SelectedTag>, name: string) => {
    const selectedValues = selectedOption ? selectedOption.map(option => option.value) : [];
    setCourse((prev) => ({ ...prev, [name]: selectedValues }));
  };

  const handleEdit = (id: string | number) => {
    setIsEditing(true);
    const foundCourse = courses.find(course => course.id === id);
    if (foundCourse) {
      const arrayOfModuleIds = foundCourse.modules.map(module => module.uid);
      const arrayOfInstrIds = foundCourse.instructors.map(instr => instr.uid);
      const arrayOfRosterIds = foundCourse.roster.map(roster => roster.uid);
      setCourse({
        title: foundCourse.title,
        language: foundCourse.language.name ? foundCourse.language.name : foundCourse.language,
        modules: arrayOfModuleIds,
        id: foundCourse.id,
        instructors: arrayOfInstrIds,
        roster: arrayOfRosterIds,
      });
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((course) => course.id !== id));
    } catch (err) {
      console.error("Failed to delete course", err);
      setError(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await patchCourse(course, course.id ?? -1);
        const updatedCourses = courses.map((c) => (c.id === course.id ? course : c));
        setCourses(updatedCourses);
        setIsEditing(false);
        window.location.reload();
      } else {
        const newCourse = await postCourse(course);
        setCourses((prev) => [...prev, newCourse]);
        setCourse({
          title: '',
          language: 'cpp',
          modules: [],
          id: '',
          instructors: [],
          roster: []
        });
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
    <div className="flex h-full bg-zinc-900 p-6 gap-6">
      <div className="w-1/3 min-w-[450px]">
        <form onSubmit={handleSubmit} className="bg-gray-800/90 rounded-xl shadow-lg p-6 h-full overflow-auto">
          <h2 className="text-xl font-bold text-white mb-6">
            {isEditing ? "Edit Course" : "Create Course"}
          </h2>
          
          <div className="space-y-6">
            <div>
              <InputLabel htmlFor="title">Title</InputLabel>
              <TextInput 
                id="title" 
                name="title" 
                value={course.title} 
                placeholder="Enter title" 
                onChange={handleChange} 
                required 
              />
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
                onChange={(selectedOption: MultiValue<SelectedTag>) => 
                  handleSelectChange(selectedOption, 'modules')}
                value={moduleOptions.filter((option) => 
                  course.modules.includes(option.value))}
              />
            </div>

            <div>
              <InputLabel htmlFor="instructors">Instructors</InputLabel>
              <Select 
                id="instructors"
                isMulti
                options={userOptions}
                className="text-sm bg-blue text-white border-none w-full rounded-lg"
                styles={SelectStyles}
                onChange={(selectedOption: MultiValue<SelectedTag>) => 
                  handleSelectChange(selectedOption, 'instructors')}
                value={userOptions.filter((option) => 
                  course.instructors.includes(parseInt(option.value)))}
              />
            </div>

            <div>
              <InputLabel htmlFor="roster">Roster</InputLabel>
              <Select 
                id="roster"
                isMulti
                options={userOptions}
                className="text-sm bg-blue text-white border-none w-full rounded-lg"
                styles={SelectStyles}
                onChange={(selectedOption: MultiValue<SelectedTag>) => 
                  handleSelectChange(selectedOption, 'roster')}
                value={userOptions.filter((option) => 
                  course.roster.includes(parseInt(option.value)))}
              />
            </div>

            <SubmitBtn
              text={isEditing ? 'Confirm Edit' : 'Create'}
              disabled={course.title === '' || course.modules.length === 0}
            />
          </div>
        </form>
      </div>

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
