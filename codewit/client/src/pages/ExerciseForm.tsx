import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Error from "../components/error/Error";
import MDEditor from '@uiw/react-markdown-editor';
import { ExerciseResponse } from '@codewit/interfaces';
import TagSelect from '../components/form/TagSelect';
import LanguageSelect from '../components/form/LanguageSelect';
import SubmitBtn from '../components/form/SubmitButton';

const ExerciseForms = (): JSX.Element => {
  const [exercise, setExercise] = useState({ prompt: ''});
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUid, setEditingUid] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [selectedTags, setSelectedTags] = useState<{label: string, value: string}[]>();

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
    if (!exercise.prompt.trim()) return;
  
    const exerciseData = {
      ...exercise,
      tags: selectedTags ? (selectedTags as {value:string,label: string}[]).map((tag: {value:string,label: string}) => tag.value) : [], 
      language: selectedLanguage,
    };
  
    let response: ExerciseResponse;
    try {
      if (isEditing && editingUid) {
        const { data } = await axios.patch(`/exercises/${editingUid}`, exerciseData);
        response = data;
      } else {
        const { data } = await axios.post('/exercises', exerciseData);
        response = data;
      }
      setExercises(prev => isEditing ? prev.map(ex => ex.uid === editingUid ? response : ex) : [...prev, response]);
      setExercise({ prompt: ''});
      setSelectedTags([]);
      setSelectedLanguage('');
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
    const tagNames = exercise.tags.map(tag => typeof tag === 'string' ? tag : tag.name);
    const language = typeof exercise.language === 'string' ? exercise.language : exercise.language.name;
    setExercise({prompt: exercise.prompt});
    setSelectedTags(tagNames.map(tagName => ({ label: tagName, value: tagName })));
    setSelectedLanguage(language);
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

  const handleTagSelect = (tags: {label: string, value: string}[]) => {
    setSelectedTags(tags);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setSelectedLanguage(value);
  }
  

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex flex-col md:flex-row justify-start items-start w-full h-full bg-zinc-900 overflow-auto p-4 gap-4">
      <div className=" shadow-lg h-full rounded-md p-4 w-full max-w-4xl bg-gray-800 bg-opacity-50">
        <form onSubmit={handleSubmit} className="w-full">
          <h2 className="text-xl font-semibold text-white mb-2">{isEditing ? 'Edit Exercise' : 'Create New Exercise'}</h2>
          <div className="mb-2 h-full overflow-auto">
           <MDEditor
              value={exercise.prompt}
              onChange={handleEditorChange}
              height="300px"
              data-testid="prompt"
            />
          </div>
          <div className = "flex flex-row w-full gap-3 mb-6">
            <TagSelect 
              selectedTags={selectedTags} 
              setSelectedTags={handleTagSelect}
              isMulti={true}
            />
            <LanguageSelect 
              handleChange={handleLanguageChange}
              initialLanguage={selectedLanguage}
            />
        </div>
        <SubmitBtn 
          disabled={exercise.prompt === '' || selectedTags?.length === 0 || !selectedLanguage}
          text={isEditing ? 'Confirm Edit' : 'Create'} 
        />
        </form>
      </div>
      <div className="w-full max-w-4xl h-full rounded-md shadow-lg p-4 overflow-auto bg-gray-800 bg-opacity-50">
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
