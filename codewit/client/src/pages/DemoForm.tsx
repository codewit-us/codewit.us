import React, { useEffect, useState } from 'react';
import VideoSelect from '../components/form/VideoSelect';
import Error from '../components/error/Error';
import { DemoResponse } from '@codewit/interfaces';
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
  const { postDemo } = usePostDemo();
  const { patchDemo } = usePatchDemo();
  const { patchDemoExercise } = usePatchDemoExercise();
  const { deleteDemo } = useDeleteDemo();
  const { fetchDemos } = useFetchDemos();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [demos, setDemos] = useState<DemoResponse[]>([]);
  const [formData, setFormData] = useState({
    uid: undefined,
    youtube_id: '',
    title: '',
    topic: '',
    tags: [],
    language: 'cpp',
    exercises: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchDemos();
        setDemos(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching demos:', error);
        setError(true);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let response;
      const { uid, title, youtube_id, topic, tags, language, exercises } = formData;
      const demoTemplate = { title, youtube_id, topic, tags, language };

      if (isEditing && uid !== undefined) {
        console.log(demoTemplate, uid)
        response = await patchDemo(demoTemplate, uid);
      } else {
        console.log(demoTemplate)
        response = await postDemo(demoTemplate);
      }
      if (response) {
        await patchDemoExercise({ exercises }, response.uid);
        navigate('/');
      }
    } catch (error) {
      setError(true);
      console.error('Error processing the form:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoSelect = (videoId: string) => {
    setFormData(prev => ({ ...prev, youtube_id: videoId }));
  };

  const handleTagSelect = (tags: { label: string, value: string }[]) => {
    setFormData(prev => ({ ...prev, tags: tags.map(tag => tag.value) }));
  };

  const handleTopicSelect = (topics: { label: string, value: string }[] | { label: string, value: string }) => {
    const topic = Array.isArray(topics) ? topics[0].value : topics.value;
    setFormData(prev => ({ ...prev, topic }));
  };

  const updateExercises = (selectedIds: string[]) => {
    setFormData(prev => ({ ...prev, exercises: selectedIds }));
  };

  const handleEdit = (demoUid: number) => {
    const demoToEdit = demos.find(demo => demo.uid === demoUid);
    if (demoToEdit) {
      setFormData({
        uid: demoToEdit.uid,
        title: demoToEdit.title,
        youtube_id: demoToEdit.youtube_id,
        topic: demoToEdit.topic,
        tags: demoToEdit.tags.map(tag => typeof tag === 'string' ? tag : tag.name),
        language: typeof demoToEdit.language === 'string' ? demoToEdit.language : demoToEdit.language.name,
        exercises: demoToEdit.exercises.map(exercise => exercise.uid)
      });
      setIsEditing(true);
    }
  };

  const handleDelete = async (demoUid: number) => {
    try {
      await deleteDemo(demoUid);
      setDemos(demos.filter(demo => demo.uid !== demoUid));
    } catch (error) {
      console.error('Error deleting demo:', error);
      setError(true);
    }
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex justify-center items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className=" bg-gray-800 bg-opacity-50 w-full h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">
          {isEditing ? 'Edit Demo Exercise' : 'Create Demo Exercise'}
        </h2>

        <div>
          <InputLabel htmlFor="title">Title</InputLabel>
          <TextInput
            id="title"
            name="title"
            value={formData.title}
            placeholder="Enter title"
            onChange={handleInputChange}
            required
          />
        </div>

        <VideoSelect onSelectVideo={handleVideoSelect} selectedVideoId={formData.youtube_id} />

        <ExerciseSelect onSelectExercises={updateExercises} initialExercises={formData.exercises} />

        <div className="flex flex-row w-full gap-3">
          <TagSelect selectedTags={formData.tags.map(tag => ({ label: tag, value: tag }))} setSelectedTags={handleTagSelect} isMulti={true} />
          <LanguageSelect handleChange={handleInputChange} initialLanguage={formData.language} />
        </div>
        <TagSelect selectedTags={[{ value: formData.topic, label: formData.topic }]} setSelectedTags={handleTopicSelect} isMulti={false} />

        <SubmitBtn disabled={formData.title === '' || formData.youtube_id === '' || formData.tags.length === 0 || formData.topic === ''} text={isEditing ? 'Confirm Edit' : 'Create'} />
      </form>
      <ExistingTable items={demos} name="Demos" onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default CreateDemo;
