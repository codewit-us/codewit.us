import {useState} from 'react';
import LanguageSelect from '../components/form_demo/LanguageSelect';

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
    console.log(course);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('submitted', course);
  }

  return (
    <div className="flex justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create Course</h2>

        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-200">Title</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            className="w-full p-2.5 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Enter Title" 
            onChange = {handleChange}
            required 
          />
        </div>

        <LanguageSelect 
            handleChange={handleChange}
            initialLanguage={course.language}
        />

        <div className="flex justify-end py-2">
          <button 
            type="submit"
            data-testid="submitbtn" 
            className="text-white w-full bg-accent-500 hover:bg-accent-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm py-2 px-3 text-center transition-colors duration-200"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}

export default CourseForm;