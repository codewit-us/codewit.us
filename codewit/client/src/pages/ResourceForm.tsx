import {useState, useEffect} from 'react';
import SubmitBtn from '../components/form/SubmitButton';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
import Error from '../components/error/Error';
import axios from 'axios';
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

  const [error, setError] = useState<boolean>(false);
  const [existingResources, setExistingResources] = useState<Resource[]>([]); 
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`/resources`);
        setExistingResources(res.data);
      } catch (err) {
        console.error("Error fetching resources: ", err);
        setError(true);
      }
    };
    fetchResources();
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
  
  const handleDelete = async (uid: number) => {
    await axios.delete(`/resources/${uid}`);
    const updatedResources = existingResources.filter((res) => res.uid !== uid);
    setExistingResources(updatedResources);
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditing) {
      // axios patch request /resources/:id
      const response = await axios.patch(`/resources/${resource.uid}`, resource);
      const updatedResources = existingResources.map((res) => res.uid === resource.uid ? response.data : res);
      setExistingResources(updatedResources);
      setResource({ url: '', title: '', source: '', likes: 1 });
      setIsEditing(false);
    } else {
      // axios post request /resources
      const response = await axios.post('/resources', resource);
      setExistingResources([...existingResources, response.data]);
      setResource({ url: '', title: '', source: '', likes: 1 });
    }
  }

  if (error) {
    return <Error />;
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