import React, { useEffect, useState } from 'react';
import Demo from '../components/demos/demos'; 
import { Demo as DemoType } from 'client/src/interfaces/demo.interface';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/loading/loadingPage';
import Error from '../components/error/error';

const Home = (): JSX.Element => {
  const [demos, setDemo] = useState<DemoType[]>([]);
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
        return null;
      } finally {
        setLoading(false);
      }
    };
    fetchDemos();
  }, []);

  /* v8 ignore next 3 */
  const handleEdit = (demoUid: number) => {
    const demoToEdit = demos.find((demo) => demo.uid == demoUid);
    if (demoToEdit) {
      navigate('/create', { state: { demo: demoToEdit, isEditing: true } });
    }
  };

  const handleDelete = async (demoUid: number) => {
    setDeleting(prev => ({ ...prev, [demoUid]: true }));  
    try {
      await axios.delete(`/demos/${demoUid}`);  
      setDemo(prevDemos => prevDemos.filter(demo => demo.uid != demoUid));  
    } catch (err) {
      alert("Failed to delete the demo. Please try again.");
    } finally {
      setDeleting(prev => ({ ...prev, [demoUid]: false }));
    }
  };
  

  if(loading) {
    return <Loading />
  }

  if(error) {
    return <Error />
  }

  return (
    <>
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
    </>
  );
};

export default Home;
