import {useState, useEffect} from 'react';
import SubmitBtn from '../components/form/SubmitButton';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
import ExistingTable from '../components/form/ExistingTable';

interface Resource {
  url: string;
  title: string;
  source: string;
  likes: number;
  uid?: number
}


const ResourceForm = (): JSX.Element => {
  const [resource, setResource] = useState<Resource>({
    url: '',
    title: '',
    source: '',
    likes: 1,
  });
  const [existingResources, setExistingResources] = useState<Resource[]>([]); 
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedResources = JSON.parse(localStorage.getItem('resources') || '[]');
    setExistingResources(storedResources);
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResource({
      ...resource,
      [name]: value
    });
  };

  const handleEdit = (uid: number) => {
    const editResource = existingResources.find((res) => res.uid === uid);
    if (editResource) {
      setIsEditing(true);
      setResource(editResource);
    }
  } 
  
  const handleDelete = (uid: number) => {
    const updatedResources = existingResources.filter((res) => res.uid !== uid);
    setExistingResources(updatedResources);
  }
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditing) {
      const updatedResources = existingResources.map((res) => res.uid === resource.uid ? resource : res);
      localStorage.setItem('resources', JSON.stringify(updatedResources));
      setExistingResources(updatedResources);
      setResource({ url: '', title: '', source: '', likes: 1, uid: -1 });
      setIsEditing(false);
    } else {
      const newResource = { ...resource, uid: Date.now() };
      const updatedResources = [...existingResources, newResource];
      localStorage.setItem('resources', JSON.stringify(updatedResources));
      setExistingResources(updatedResources);
      console.log('submitted', newResource);
      setResource({ url: '', title: '', source: '', likes: 1, uid: -1 });
    }
  }

  return (
    <div className="flex gap-2 justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create Resource</h2>
        <div>
          <InputLabel htmlFor="title">Title</InputLabel>
          <TextInput id="title" value={resource.title} name="title" placeholder="Enter Title" onChange={handleChange} required />
        </div>
        <div>
          <InputLabel htmlFor="url">URL</InputLabel>
          <TextInput id="url" value={resource.url} name="url" placeholder="Enter URL" onChange={handleChange} required />
        </div>
        <div>
          <InputLabel htmlFor="source">Source</InputLabel>
          <TextInput id="source" value={resource.source} name="source" placeholder="Enter Source" onChange={handleChange} required />
        </div>
        <SubmitBtn 
          disabled={resource.url === '' || resource.title === '' || resource.source === ''}
          text={isEditing ? 'Confirm Edit' : 'Create'} 
        />
      </form>
      <ExistingTable
        items={existingResources}
        name="Resources"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ResourceForm;