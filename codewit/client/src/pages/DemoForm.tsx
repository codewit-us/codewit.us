import React, { useState } from 'react';
import VideoSelect from '../components/form/VideoSelect';
import Error from '../components/error/Error';
import { DemoResponse, Tag } from '@codewit/interfaces';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExerciseSelect from '../components/form/ExerciseSelect';
import TagSelect from '../components/form/TagSelect';
import LanguageSelect from '../components/form/LanguageSelect';
import SubmitBtn from '../components/form/SubmitButton';
import InputLabel from '../components/form/InputLabel';
import TextInput from '../components/form/TextInput';
 
import {
  usePatchDemo,
  usePatchDemoExercise,
  usePostDemo,
  useDeleteDemoExercise
} from '../hooks/demohooks/useDemoHooks';

const CreateDemo = (): JSX.Element => {
  const { postDemo } = usePostDemo();
  const { patchDemo } = usePatchDemo();
  const { patchDemoExercise } = usePatchDemoExercise();
  const { deleteDemoExercise } = useDeleteDemoExercise();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [selectedExercises, setSelectedExercises] = useState<string[]>(() => {
    if (location.state?.isEditing && location.state?.demo?.exercises) {
      return location.state.demo.exercises.map((exercise: { uid: string; }) => exercise.uid);
    }
    return [];
  });

  const [selectedTags, setSelectedTags] = useState(() => {
    if (location.state?.isEditing && location.state?.demo?.tags) {
      return location.state.demo.tags.map((tag: Tag) => (
        { value: tag.name, label: tag.name }
      ));
    }
    return [];
  });

  const [demo, setDemo] = useState<DemoResponse>(() => {
    const demoState: DemoResponse = location.state?.demo || {
      youtube_id: '',
      title: '',
      topic: '',
      tags: [],
      language: 'cpp'
    };
    if (location.state?.isEditing) {
      setIsEditing(true);
    }
    return demoState;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let response;
      const demoTemplate = {
        title: demo.title,
        youtube_id: demo.youtube_id,
        topic: demo.topic,
      };
      if (isEditing) {
        const tagNames = demo.tags.map(tag => typeof tag === 'string' ? tag : tag.name);
        const language = typeof demo.language === 'string' ? demo.language : demo.language.name;
        response = await patchDemo({
          ...demoTemplate,
          tags: tagNames,
          language: language
        }, demo.uid);
      } else {
        response = await postDemo({
          ...demoTemplate,
          tags: demo.tags,
          language: demo.language
        });
      }
      if(response) {
        await patchDemoExercise({
          exercises: selectedExercises
        }, response.uid,);
        navigate('/'); 
      } 
    } catch (error) {
      setError(true);
      console.error('Error processing the form:', error);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDemo((prevDemo) => ({
      ...prevDemo,
      [name]: value,
    }));
  };

  const handleVideoSelect = (videoId: string) => {
    setDemo(currentDemo => ({ ...currentDemo, youtube_id: videoId }));
  };

  const handleTagSelect = (tags: {label: string, value: string}[]) => {
    setSelectedTags(tags);
    setDemo(prevDemo => ({
      ...prevDemo,
      tags: tags.map(tag => tag.value) 
    }));
  };

  const handleTopicSelect = (topics: {label: string, value: string}[] | {label: string, value: string}) => {
    const topic = Array.isArray(topics) ? topics[0].value : topics.value;
    setDemo(prev => ({ ...prev, topic: topic }));
  };

  const updateExercises = async (selectedIds: string[]) => {
    const exercises = selectedExercises.filter(exercise => !selectedIds.includes(exercise));
    if(isEditing && selectedIds.length < selectedExercises.length) {
      try {
        await deleteDemoExercise({exercises: exercises}, demo.uid);
      } catch (error) {
        setError(true);
        console.error('Error deleting exercises:', error);
      }
    }
    setSelectedExercises(selectedIds);
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="justify-center items-start h-full bg-zinc-900 overflow-auto w-full">
      <form onSubmit={handleSubmit} className=" bg-gray-800 bg-opacity-50 w-full h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create Demo Exercise</h2>

        <div>
          <InputLabel htmlFor="title">Title</InputLabel>
          <TextInput id="title" name="title" value = {demo.title} placeholder="Enter title" onChange={handleInputChange} required />
        </div>

        <VideoSelect
          onSelectVideo={handleVideoSelect}
          selectedVideoId={demo.youtube_id}
        />
        
        <ExerciseSelect 
          onSelectExercises={updateExercises} 
          initialExercises={selectedExercises} 
        />

        <div className = "flex flex-row w-full gap-3">
          <TagSelect 
            selectedTags={selectedTags} 
            setSelectedTags={handleTagSelect}
            isMulti={true}
          />
          <LanguageSelect 
            handleChange={handleInputChange}
            initialLanguage={typeof demo.language === 'string' ? demo.language : demo.language.name}
          />
        </div>
        <TagSelect 
            selectedTags={[{value: demo.topic, label: demo.topic}]} 
            setSelectedTags={handleTopicSelect}
            isMulti={false}
        />
        <SubmitBtn 
          disabled={demo.title === '' || demo.youtube_id === '' || demo.tags.length === 0 || demo.topic === ''}
          text={isEditing ? 'Confirm Edit' : 'Create'} 
        />
      </form>
    </div>
  );
};

export default CreateDemo;
