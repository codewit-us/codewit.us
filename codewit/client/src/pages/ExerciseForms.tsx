import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Error from "../components/error/Error";
import MDEditor from '@uiw/react-markdown-editor';
import { ExerciseResponse } from '@codewit/interfaces';

const ExerciseForms = (): JSX.Element => {
  const [exercise, setExercise] = useState({ prompt: '' });
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUid, setEditingUid] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data } = await axios.get('/exercises');
        setExercises(data as ExerciseResponse[]);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError(true);
      }
    };

    fetchExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!exercise.prompt.trim()) return;
    let response: ExerciseResponse;
    try {
      if (isEditing && editingUid) {
        const {data} = await axios.patch(`/exercises/${editingUid}`, exercise);
        response = data;
      } else {
        const {data} = await axios.post('/exercises', exercise);
        response = data;
      }
      setExercises((prev) => [...prev, response]);
      setExercise({ prompt: '' });
      setIsEditing(false); 
      setEditingUid(null); 
    } catch (error) {
      setError(true);
      console.error('Error saving the exercise:', error);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setExercise({ prompt: value || '' });
  };

  const handleEdit = (exercise: ExerciseResponse) => {
    setIsEditing(true);
    setEditingUid(exercise.uid);
    setExercise({ prompt: exercise.prompt });
  };

  const handleDelete = async (exerciseId: number) => {
    try {
      await axios.delete(`/exercises/${exerciseId}`);
      setExercises(exercises.filter((ex) => ex.uid !== exerciseId) as ExerciseResponse[]);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      setError(true);
    }
  };

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex flex-col justify-start items-center w-full h-full bg-zinc-900 overflow-auto p-2 gap-2">
      <form onSubmit={handleSubmit} className="bg-zinc-900 w-full max-w-4xl mt-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white">{isEditing ? 'Edit Exercise' : 'Create New Exercise'}</h2>
        <div>
          <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gray-200">Prompt</label>
          <MDEditor
            value={exercise.prompt}
            onChange={handleEditorChange}
            height="300px"
            data-testid="prompt"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="submit"
            className="text-white bg-accent-500 hover:bg-accent-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm py-2 px-3 text-center transition-colors duration-200"
          >
            {isEditing ? 'update' : 'create'}
          </button>
        </div>
      </form>
      <div className="w-full max-w-4xl overflow-x-auto rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-2">Existing Exercises</h2>
        <table className="w-full text-white">
          <thead className="bg-gray-900 ">
            <tr>
              <th className="px-4 py-2 text-left">Exercise Prompt</th>
              <th className="px-4 py-2 text-right">Edit</th>
              <th className="px-4 py-2 text-right">Delete</th> 
            </tr>
          </thead>
          <tbody>
            {exercises.map((ex, index) => (
              <tr key={ex.uid} className="bg-gray-800 border-b border-gray-700">
                <td className="px-4 py-2">
                  <div className="max-w-md md:max-w-2xl whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {ex.prompt}
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <button data-testid={`edit-${index}`} onClick={() => handleEdit(ex)} className="text-blue-500 hover:text-blue-700">
                    Edit
                  </button>
                </td>
                <td className="px-4 py-2 text-right">
                  <button data-testid={`delete-${index}`} onClick={() => handleDelete(ex.uid)} className="text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExerciseForms;
