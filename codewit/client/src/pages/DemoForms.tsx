import React, { useState } from 'react';
import VideoSelect from '../components/form_demo/VideoSelect';
import Error from '../components/error/Error';
import { DemoResponse, Tag } from '@codewit/interfaces';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExerciseSelect from '../components/form_demo/ExerciseSelect';
import TagSelect from '../components/form_demo/TagSelect';
import LanguageSelect from '../components/form_demo/LanguageSelect';

const CreateDemo = (): JSX.Element => {
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
      if (isEditing) {
        console.log('demo', demo);
        const tagNames = demo.tags.map(tag => typeof tag === 'string' ? tag : tag.name);
        const language = typeof demo.language === 'string' ? demo.language : demo.language.name;
        response = await axios.patch(`/demos/${demo.uid}`, {
          title: demo.title,
          youtube_id: demo.youtube_id,
          tags: tagNames,
          language: language
        });
      } else {
        response = await axios.post('/demos', {
          title: demo.title,
          youtube_id: demo.youtube_id,
          tags: demo.tags,
          language: demo.language
        });
      }
      const uid = response.data.uid
      await axios.patch(`/demos/${uid}/exercises`, {
        exercises: selectedExercises,
      });
      navigate('/'); 
    } catch (error) {
      setError(true);
      console.error('Error saving the demo:', error);
    }
  };

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

  const handleLanguageChange = (language: string) => {
    setDemo(prevDemo => ({
      ...prevDemo,
      language: language
    }));
  }

  const updateExercises = (selectedIds: string[]) => {
    const exerciseToBeDeleted = selectedExercises.filter(exercise => !selectedIds.includes(exercise));
    if(isEditing && selectedIds.length < selectedExercises.length) {
      axios.delete(`/demos/${demo.uid}/exercises`, {
        data: {
          exercises: exerciseToBeDeleted
        }
      })
    }
    setSelectedExercises(selectedIds);
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex justify-center p-4 items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md bg-opacity-50 w-full max-w-4xl h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create Demo Exercise</h2>

        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-200">Title</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            className="w-full p-2.5 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Enter title" 
            value={demo.title} 
            onChange={handleInputChange} 
            required 
          />
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
          />
          <LanguageSelect 
            handleLanguageChange={handleLanguageChange}
            initialLanguage={typeof demo.language === 'string' ? demo.language : demo.language.name}
          />
        </div>

        <div className="flex justify-end py-2">
          <button 
            type="submit"
            data-testid="submitbtn" 
            className="text-white w-full bg-accent-500 hover:bg-accent-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm py-2 px-3 text-center transition-colors duration-200"
          >
            {isEditing ? 'confirm edit' : 'create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDemo;
