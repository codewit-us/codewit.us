import {useState} from 'react';
import LanguageSelect from '../components/form/LanguageSelect';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
import SubmitBtn from '../components/form/SubmitButton';

const CourseForm = ():JSX.Element => {

  const [course, setCourse] = useState({
    title: '',
    language: 'cpp',
    modules: [],
    id: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target as HTMLInputElement;
    setCourse({
      ...course,
      [name]: value
    });
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

  return (
    <div className="flex justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create Course</h2>
        <div>
          <InputLabel htmlFor="title">Title</InputLabel>
          <TextInput id="title" name="title" value = {course.title} placeholder="Enter title" onChange={handleChange} required />
        </div>
        <LanguageSelect 
            handleChange={handleChange}
            initialLanguage={course.language}
        />
        <SubmitBtn text={'Create'} />
      </form>
    </div>
  )
}

export default CourseForm;