import {useState, useEffect} from 'react';
import SubmitBtn from '../components/form/SubmitButton';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
import Error from '../components/error/Error';
import ExistingTable from '../components/form/ExistingTable';
import { Resource } from '@codewit/interfaces';
import {
  usePostResource,
  usePatchResource,
  useFetchResources,
  useDeleteResource
} from '../hooks/resourcehooks/useResourceHooks';

const ResourceForm = (): JSX.Element => {
  const { fetchResources } = useFetchResources();
  const { deleteResource } = useDeleteResource();
  const { postResource } = usePostResource();
  const { patchResource } = usePatchResource();
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
    const fResource = async () => {
      try {
        const res = await fetchResources();
        setExistingResources(res);
      } catch (err) {
        console.error("Error fetching resources: ", err);
        setError(true);
      }
    };
    fResource();
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
    try {
      await deleteResource(uid);
      const updatedResources = existingResources.filter((res) => res.uid !== uid);
      setExistingResources(updatedResources);    
    } catch (error) {
      setError(true);
      console.error('Error deleting resource: ', error);
    }
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // axios patch request /resources/:id
        const response = await patchResource(resource, resource.uid ?? -1);
        const updatedResources = existingResources.map((res) => res.uid === resource.uid ? response : res);
        setExistingResources(updatedResources);
        setResource({ url: '', title: '', source: '', likes: 1 });
        setIsEditing(false);
      } else {
        // axios post request /resources
        const response = await postResource(resource);
        setExistingResources([...existingResources, response]);
        setResource({ url: '', title: '', source: '', likes: 1 });
      }
    } catch (err) {
      console.error("Error submitting resource: ", err);
      setError(true);
    }
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex justify-center items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 bg-opacity-50 w-full h-full p-6 space-y-6">
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