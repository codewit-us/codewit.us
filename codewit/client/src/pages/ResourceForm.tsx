import {useState} from 'react';
import SubmitBtn from '../components/form/SubmitButton';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';

const ResourceForm = (): JSX.Element => {
  const [resource, setResource] = useState({
    url: '',
    title: '',
    source: '',
    likes: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResource({
      ...resource,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newResource = { ...resource, id: Date.now() };
    const existingResources = JSON.parse(localStorage.getItem('resources') || '[]');
    existingResources.push(newResource);
    localStorage.setItem('resources', JSON.stringify(existingResources));
    console.log('submitted', newResource);
    setResource({ url: '', title: '', source: '', likes: 1 });
  };


  return (
    <div className="flex justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create Resource</h2>
        <div>
          <InputLabel htmlFor="url">URL</InputLabel>
          <TextInput id="url" value={resource.url} name="url" placeholder="Enter URL" onChange={handleChange} required />
        </div>
        <div>
          <InputLabel htmlFor="title">Title</InputLabel>
          <TextInput id="title" value={resource.title} name="title" placeholder="Enter Title" onChange={handleChange} required />
        </div>
        <div>
          <InputLabel htmlFor="source">Source</InputLabel>
          <TextInput id="source" value={resource.source} name="source" placeholder="Enter Source" onChange={handleChange} required />
        </div>
        <SubmitBtn 
          disabled={resource.url === '' || resource.title === '' || resource.source === ''}
          text={'Create'} 
        />
      </form>
    </div>
  );
};

export default ResourceForm;