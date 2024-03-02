import React, { useEffect, useState } from 'react';
import Demo from '../components/demos/Demos';
import { DemoResponse } from '@codewit/validations';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/loading/LoadingPage';
import Error from '../components/error/Error';

const Home = (): JSX.Element => {
  const [demos, setDemo] = useState<DemoResponse[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<{ [uid: number]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/demos`);
        setDemo(res.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDemos();
  }, []);

  const handleEdit = (demoUid: number) => {
    const demoToEdit = demos.find((demo) => demo.uid === demoUid);
    if (demoToEdit) {
      navigate('/create', { state: { demo: demoToEdit, isEditing: true } });
    }
  };

  const handleDelete = async (demoUid: number) => {
    setDeleting(prev => ({ ...prev, [demoUid]: true }));
    try {
      await axios.delete(`/demos/${demoUid}`);
      setDemo(prevDemos => prevDemos.filter(demo => demo.uid !== demoUid));
    } catch (err) {
      alert("Failed to delete the demo. Please try again.");
    } finally {
      setDeleting(prev => ({ ...prev, [demoUid]: false }));
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  if (demos.length === 0) {
    return (
      <div className="flex justify-center items-center h-container-full bg-zinc-900">
        <img src = "/hexicon.png" alt="codewitus bulb" className=" opacity-75 w-25 h-20" />
        <div className="text-left opacity-75">
          <h2 className = "font-medium text-white">Theres Nothing Here!</h2>
          <Link to="/create" className="cursor-pointer hover:underline inline-flex justify-center items-center gap-1 font-small text-sm text-left tracking-wide text-white transition-colors">
            Create a Video!
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
      <div className="h-58 md:h-52 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-4 p-3">
        {demos.map((demo) => (
          <Demo
            key={demo.uid}
            title={demo.title}
            uid={demo.uid ?? 0}
            amountExercises={demo.exercises.length}
            handleEdit={() => handleEdit(demo.uid ?? 0)}
            isDeleting={deleting[demo.uid ?? 0]}
            handleDelete={() => handleDelete(demo.uid ?? 0)}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
