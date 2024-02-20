import React, { useEffect, useState } from 'react';
import Demo from '../components/demos/demos'; 
import { Demo as DemoType } from 'client/src/interfaces/demo.interface';
import { useNavigate } from 'react-router-dom';

const Home = (): JSX.Element => {
  const [demos, setDemo] = useState<DemoType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedDemos = localStorage.getItem('demos');

    if (storedDemos) {
      const allDemos: DemoType[] = JSON.parse(storedDemos);
      setDemo(allDemos);
    }
  }, []);

  /* v8 ignore next 3 */
  const handleEdit = (demoUid: number) => {
    const demoToEdit = demos.find((demo) => demo.uid === demoUid);
    if (demoToEdit) {
      navigate('/create', { state: { demo: demoToEdit, isEditing: true } });
    }
  };

  const handleDelete = (demoUid: number) => {
    const newDemos = demos.filter((demo) => demo.uid !== demoUid);
    setDemo(newDemos);
    localStorage.setItem('demos', JSON.stringify(newDemos));
  };

  return (
<>
  <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
    <div className="h-58 md:h-52 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-4 p-3">
      {demos.map((demo) => (
        <Demo
          key={demo.uid}
          title={demo.title}
          uid={demo.uid}
          amountExercises={demo.exercises.length}
          handleEdit={() => handleEdit(demo.uid)}
          handleDelete={() => handleDelete(demo.uid)}
        />
      ))}
    </div>
  </div>
</>

  );

};

export default Home;
