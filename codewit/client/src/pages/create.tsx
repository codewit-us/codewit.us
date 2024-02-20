import React, { useState } from 'react';
import VideoSelect from '../components/form/videoselect';
import ExerciseList from '../components/form/exercisesTextArea';
import { Demo as DemoType } from 'client/src/interfaces/demo.interface';
import { useLocation, useNavigate } from 'react-router-dom';

const Create = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [demo, setDemo] = useState<DemoType>(() => {
    const demoState: DemoType = location.state?.demo || {
      uid: parseInt(localStorage.getItem('uid') || '1'),
      youtube_id: '',
      title: '',
      likes: 1,
      exercises: [],
    };
    if (location.state?.isEditing) {
      setIsEditing(true);
    }
    return demoState;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const demos = JSON.parse(localStorage.getItem('demos') || '[]');

    if (isEditing) {
      const updatedDemos = demos.map((d: DemoType) => d.uid === demo.uid ? demo : d);
      localStorage.setItem('demos', JSON.stringify(updatedDemos));
    } else {
      const newUid = Math.max(0, ...demos.map((d: DemoType) => d.uid)) + 1;
      demo.uid = newUid;
      localStorage.setItem('uid', newUid.toString());
      localStorage.setItem('demos', JSON.stringify([...demos, { ...demo, uid: newUid }]));
    }

    navigate('/'); 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDemo((prevDemo) => ({
      ...prevDemo, 
      [name]: name === 'likes' ? parseInt(value, 10) : value
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
      exercises: [...prevDemo.exercises, { uid: prevDemo.exercises.length + 1, prompt: '' }],
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
  
        <div className="flex flex-wrap -mx-2">
          <div className="w-full px-2 mb-5">
            <label htmlFor="likes" className="block mb-2 text-sm font-medium text-gray-200">Likes</label>
            <input 
              type="number" 
              id="likes" 
              name="likes" 
              className="w-full p-2.5 text-sm bg-gray-700 border border-gray-600 text-white rounded-sm focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Number of likes" 
              value={demo.likes} 
              onChange={handleInputChange} 
              required 
            />
          </div>
  
          <div className="w-full px-2">
            <label htmlFor="uid" className="block mb-2 text-sm font-medium text-gray-200">UID (Disabled)</label>
            <input 
              type="text" 
              id="uid" 
              name="uid" 
              className="w-full p-2.5 text-sm bg-gray-600 border border-gray-600 text-gray-400 rounded-sm cursor-not-allowed" 
              placeholder="UID" 
              value={demo.uid} 
              data-testid="uidbtn"
              disabled 
            />
          </div>
        </div>
  
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
