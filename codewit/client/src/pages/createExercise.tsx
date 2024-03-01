import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Error from "../components/error/error";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CreateExercise = (): JSX.Element => {
  const [exercise, setExercise] = useState({ prompt: '' });
  const [error, setError] = useState<boolean>(false);
  const [preview, setPreview] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('/exercises', exercise);
      navigate('/');
    } catch (error) {
      setError(true);
      console.error('Error saving the exercise:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExercise((prevExercise) => ({
      ...prevExercise,
      [name]: value,
    }));
  };

  const togglePreview = () => setPreview(!preview);

  const components = {
    'br': () => <br />,
  };

  if(error) {
    return <Error />;
  }

  return (
    <div className="flex justify-center items-start h-full bg-zinc-900 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-zinc-900 w-full max-w-4xl h-full p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Create New Exercise</h2>
        <div>
          <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gray-200">Prompt</label>
          <div className="w-full h-[300px] bg-gray-700 border border-gray-600 text-white rounded-lg">
            {preview ? (
              <div className = "overflow-auto h-full p-2">
                <ReactMarkdown 
                  className="prose text-white font-code p-0 m-0" 
                  components={components}
                  remarkPlugins={[remarkGfm]}
                >
                    {exercise.prompt}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                id="prompt"
                name="prompt"
                className="w-full h-full p-2 text-sm bg-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter exercise prompt"
                value={exercise.prompt}
                onChange={handleInputChange}
                required
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={togglePreview}
            className="text-white bg-accent-500 hover:bg-accent-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm py-2 px-3 text-center transition-colors duration-200"
          >
            {preview ? 'edit' : 'preview'}
          </button>
          <button
            type="submit"
            className="text-white bg-accent-500 hover:bg-accent-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm py-2 px-3 text-center transition-colors duration-200"
          >
            create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExercise;
