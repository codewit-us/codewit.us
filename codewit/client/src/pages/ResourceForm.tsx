import {useState} from 'react';

const ResourceForm = ():JSX.Element => {

  const [resource, setResource] = useState({
    url: '',
    title: '',
    source: '',
    likes: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target as HTMLInputElement;
    setResource({
      ...resource,
      [name]: value
    });
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('submitted', resource);
  }

  return (
    <div className="flex justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create Resource</h2>

        <div>
          <label htmlFor="url" className="block mb-2 text-sm font-medium text-gray-200">URL</label>
          <input 
            type="text" 
            id="url" 
            name="url" 
            className="w-full p-2.5 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Enter URL" 
            onChange = {handleChange}
            required 
          />
        </div>

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

        <div>
          <label htmlFor="source" className="block mb-2 text-sm font-medium text-gray-200">Source</label>
          <input 
            type="text" 
            id="source" 
            name="source" 
            className="w-full p-2.5 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Enter Source" 
            onChange = {handleChange}
            required 
          />
        </div>

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

export default ResourceForm;