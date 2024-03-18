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
      setExercises((prev) => isEditing ? prev.map(ex => ex.uid === editingUid ? response : ex) : [...prev, response]);
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
    <div className="flex flex-col md:flex-row justify-start items-start w-full h-full bg-zinc-900 overflow-auto p-4 gap-4">
      <div className=" shadow-lg h-full rounded-sm p-4 w-full max-w-4xl bg-gray-800 bg-opacity-50">
        <form onSubmit={handleSubmit} className="w-full">
          <h2 className="text-xl font-semibold text-white mb-2">{isEditing ? 'Edit Exercise' : 'Create New Exercise'}</h2>
          <div className="mb-2 h-full">
           <MDEditor
              value={exercise.prompt}
              onChange={handleEditorChange}
              height="500px"
              data-testid="prompt"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="text-white w-full bg-accent-600 hover:bg-accent-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2 transition-colors duration-200"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      <div className="w-full max-w-4xl h-full rounded-sm shadow-lg p-4 overflow-auto bg-gray-800 bg-opacity-50">
        <h2 className="text-xl font-semibold text-white mb-2">Existing Exercises</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-white">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th className="px-6 py-3">Exercise Prompt</th>
                <th className="px-6 py-3 text-right">Edit</th>
                <th className="px-6 py-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex, index) => (
                <tr key={ex.uid} className="border-b border-gray-700 ">
                  <td className="px-6 py-4">
                    <div className="max-w-md md:max-w-2xl whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {ex.prompt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button data-testid={`edit-${index}`} onClick={() => handleEdit(ex)} className="text-blue-400 hover:text-blue-600">
                      Edit
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button data-testid={`delete-${index}`} onClick={() => handleDelete(ex.uid)} className="text-red-400 hover:text-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExerciseForms;
