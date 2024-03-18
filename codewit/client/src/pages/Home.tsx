import React, { useEffect, useState } from 'react';
import Demo from '../components/demos/Demos';
import { DemoResponse } from '@codewit/interfaces';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/loading/LoadingPage';
import Error from '../components/error/Error';
import { PlusCircleIcon } from '@heroicons/react/24/solid'

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
        console.log(res.data);
        setDemo(res.data as DemoResponse[]);
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
            <PlusCircleIcon 
              className="h-4 w-4 text-white"
            />
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
