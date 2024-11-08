import React, { useState, useEffect } from 'react';
import SubmitBtn from '../components/form/SubmitButton';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
import Error from '../components/error/Error';
import ExistingTable from '../components/form/ExistingTable';
import Loading from '../components/loading/LoadingPage';
import { Resource } from '@codewit/interfaces';
import {
  usePostResource,
  usePatchResource,
  useFetchResources,
  useDeleteResource
} from '../hooks/useResource';

const ResourceForm = (): JSX.Element => {
  const { data: existingResources, error: fetchError, loading: fetchLoading, setData: setExistingResources } = useFetchResources();
  const postResource = usePostResource();
  const patchResource = usePatchResource();
  const deleteResource = useDeleteResource();

  const [resource, setResource] = useState<Resource>({ url: '', title: '', source: '', likes: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (fetchError) {
      setError('Failed to fetch resources.');
    }
  }, [fetchError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResource(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (uid: number) => {
    const resourceToEdit = existingResources.find(res => res.uid === uid);
    if (resourceToEdit) {
      setIsEditing(true);
      setResource(resourceToEdit);
    }
  };

  const handleDelete = async (uid: number) => {
    try {
      await deleteResource(uid);
      setExistingResources(prev => prev.filter(res => res.uid !== uid));
    } catch {
      setError('Failed to delete resource.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (isEditing && resource.uid) {
        const updatedResource = await patchResource(resource, resource.uid);
        setExistingResources(prev => prev.map(res => (res.uid === resource.uid ? updatedResource : res)));
        setIsEditing(false);
      } else {
        const newResource = await postResource(resource);
        setExistingResources(prev => [...prev, newResource]);
      }
      setResource({ url: '', title: '', source: '', likes: 0 });
    } catch (err) {
      setError('Failed to submit resource.');
    }
  };

  if (error) {
    return <Error message={error} />;
  }

  if (fetchLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-full bg-zinc-900 p-6 gap-6 overflow">
      {/* Form Section */}
      <div className="w-1/3 min-w-[450px]">
        <form onSubmit={handleSubmit} className="bg-gray-800/90 rounded-xl shadow-lg p-6 h-full">
          <h2 className="text-xl font-bold text-white mb-6">
            {isEditing ? 'Edit Resource' : 'Create Resource'}
          </h2>
          
          <div className="space-y-6">
            <div>
              <InputLabel htmlFor="title">Title</InputLabel>
              <TextInput 
                id="title" 
                value={resource.title} 
                name="title" 
                placeholder="Enter Title" 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <InputLabel htmlFor="url">URL</InputLabel>
              <TextInput 
                id="url" 
                value={resource.url} 
                name="url" 
                placeholder="Enter URL" 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <InputLabel htmlFor="source">Source</InputLabel>
              <TextInput 
                id="source" 
                value={resource.source} 
                name="source" 
                placeholder="Enter Source" 
                onChange={handleChange} 
                required 
              />
            </div>

            <SubmitBtn 
              disabled={!resource.url || !resource.title || !resource.source} 
              text={isEditing ? 'Update' : 'Create'} 
            />
          </div>
        </form>
      </div>

      {/* Existing Resources Table */}
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
