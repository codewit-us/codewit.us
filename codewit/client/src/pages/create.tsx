import React, { useState } from 'react';
import VideoSelect from '../components/form/videoselect';
import ExerciseList from '../components/form/exercisesTextArea';
import Error from '../components/error/error';
import { Demo as DemoType } from 'client/src/interfaces/demo.interface';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Create = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [demo, setDemo] = useState<DemoType>(() => {
    const demoState: DemoType = location.state?.demo || {
      youtube_id: '',
      title: '',
      exercises: [],
    };
    if (location.state?.isEditing) {
      setIsEditing(true);
    }
    return demoState;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await axios.patch(`/demos/${demo.uid}`, {
          title: demo.title,
          youtube_id: demo.youtube_id,
          exercises: demo.exercises,
        });
      } else {
        await axios.post('/demos', {
          title: demo.title,
          youtube_id: demo.youtube_id,
          exercises: demo.exercises,
        });
      }
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
      [name]: value
    }));
  };

  const handleExerciseChange = (index: number, value: string) => {
    setDemo((prevDemo) => ({
      ...prevDemo,
      exercises: prevDemo.exercises.map((exercise, i) =>
        i === index ? { ...exercise, prompt: value } : exercise
      ),
    }));
  };

  const addExercise = () => {
    setDemo((prevDemo) => ({
      ...prevDemo,
      exercises: [...prevDemo.exercises, { demo_uid: prevDemo.exercises.length + 1, prompt: '' }],
    }));
  };

  const removeExercise = (indexToRemove: number) => {
    setDemo((prevDemo) => ({
      ...prevDemo,
      exercises: prevDemo.exercises.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleVideoSelect = (videoId: string) => {
    setDemo({ ...demo, youtube_id: videoId });
  };

  if(error) {
    return <Error />;
  }

  return (
      <form onSubmit={handleSubmit} className=" bg-zinc-900 w-full h-container-full overflow-x-hidden shadow-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create Demo Exercise</h2>
  
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-200">Title</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            className="w-full p-2.5 text-sm bg-gray-700 border border-gray-600 text-white rounded-sm focus:ring-blue-500 focus:border-blue-500" 
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
  
        <div className="max-h-96 overflow-auto">
          <ExerciseList
            exercises={demo.exercises}
            onAdd={addExercise}
            onRemove={removeExercise}
            onChange={handleExerciseChange}
          />
        </div>
  
        <button 
          type="submit"
          data-testid="submitbtn" 
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-sm text-sm px-5 py-2.5 text-center transition-colors duration-200"
        >
          {isEditing ? 'Confirm Edit' : 'Create'}
        </button>

      </form>
  );  
};

export default Create;
