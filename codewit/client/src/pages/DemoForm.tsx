import React, { useEffect, useState } from 'react';
import VideoSelect from '../components/form/VideoSelect';
import Error from '../components/error/Error';
import { DemoResponse, DemoFormData } from '@codewit/interfaces';
import { useNavigate } from 'react-router-dom';
import ExerciseSelect from '../components/form/ExerciseSelect';
import TagSelect from '../components/form/TagSelect';
import LanguageSelect from '../components/form/LanguageSelect';
import SubmitBtn from '../components/form/SubmitButton';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
import ExistingTable from '../components/form/ExistingTable';
import {
  usePatchDemo,
  usePatchDemoExercise,
  usePostDemo,
  useFetchDemos,
  useDeleteDemo
} from '../hooks/useDemo';

const CreateDemo = (): JSX.Element => {
  const navigate = useNavigate();
  const { data: demos, loading, error: fetchError, setData: setDemos } = useFetchDemos();
  const postDemo = usePostDemo();
  const patchDemo = usePatchDemo();
  const patchDemoExercise = usePatchDemoExercise();
  const deleteDemo = useDeleteDemo();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<DemoFormData>({
    uid: undefined,
    youtube_id: '',
    title: '',
    topic: '',
    tags: [],
    language: 'cpp',
    exercises: []
  });

  useEffect(() => {
    if (!loading && fetchError) {
      console.error('Error fetching demos:', fetchError);
    }
  }, [loading, fetchError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { uid, ...demoData } = formData;
      const response = isEditing && uid
        ? await patchDemo(demoData, uid)
        : await postDemo(demoData);

      if (response && response.uid) {
        await patchDemoExercise({ exercises: formData.exercises }, response.uid);
        navigate('/');
      }
    } catch (error) {
      console.error('Error processing the form:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: DemoFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoSelect = (videoId: string) => {
    setFormData((prev: DemoFormData) => ({ ...prev, youtube_id: videoId }));
  };

  const handleTagSelect = (tags: { label: string, value: string }[]) => {
    setFormData((prev: DemoFormData) => ({ ...prev, tags: tags.map(tag => tag.value) }));
  };

  const handleTopicSelect = (topic: { label: string, value: string }) => {
    setFormData((prev: DemoFormData) => ({ ...prev, topic: topic.value }));
  };

  const updateExercises = (selectedIds: string[]) => {
    setFormData((prev: DemoFormData) => ({ ...prev, exercises: selectedIds }));
  };

  const handleEdit = (demoUid: number) => {
    const demoToEdit = demos.find(demo => demo.uid === demoUid);
    if (demoToEdit) {
      setIsEditing(true);
      setFormData({
        uid: demoToEdit.uid,
        title: demoToEdit.title,
        youtube_id: demoToEdit.youtube_id,
        topic: demoToEdit.topic,
        tags: demoToEdit.tags.map((tag: { name: string; }) => tag.name),
        language: demoToEdit.language.name,
        exercises: demoToEdit.exercises.map((ex: { uid: number; }) => ex.uid)
      });
    }
  };

  const handleDelete = async (demoUid: number) => {
    try {
      await deleteDemo(demoUid);
      if (demos) {
        setDemos(demos.filter((demo: { uid: number; }) => demo.uid !== demoUid));
      }
    } catch (error) {
      console.error('Error deleting demo:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (fetchError) return <Error />;

  return (
    <div className="flex justify-center items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 bg-opacity-50 w-full h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">{isEditing ? 'Edit Demo Exercise' : 'Create Demo Exercise'}</h2>
        <InputLabel htmlFor="title">Title</InputLabel>
        <TextInput id="title" name="title" value={formData.title} placeholder="Enter title" onChange={handleInputChange} required />
        <VideoSelect onSelectVideo={handleVideoSelect} selectedVideoId={formData.youtube_id} />
        <ExerciseSelect onSelectExercises={updateExercises} initialExercises={formData.exercises} />
        <div className="flex flex-row w-full gap-3">
          <TagSelect selectedTags={formData.tags.map(tag => ({ label: tag, value: tag }))} setSelectedTags={handleTagSelect} isMulti={true} />
          <LanguageSelect handleChange={handleInputChange} initialLanguage={formData.language} />
        </div>
        <TagSelect selectedTags={[{ value: formData.topic, label: formData.topic }]} setSelectedTags={handleTopicSelect} isMulti={false} />
        <SubmitBtn disabled={formData.title === '' || formData.youtube_id === '' || formData.tags.length === 0 || formData.topic === ''} text={isEditing ? 'Confirm Edit' : 'Create'} />
      </form>
      <ExistingTable items={demos || []} name="Demos" onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default CreateDemo;
