import { useNavigate } from 'react-router-dom';
import { useFetchDemos } from '../hooks/demohooks/useFetchDemos';
import { useDeleteDemo } from '../hooks/demohooks/useDeleteDemo';
import Loading from '../components/loading/LoadingPage';
import Error from '../components/error/Error';
import Demo from '../components/demos/Demos';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const Home = (): JSX.Element => {
  const { demos, loading, error: fetchError, setDemos } = useFetchDemos();
  
  const onSuccess = (demoUid: number) => {
    setDemos(demos => demos.filter(demo => demo.uid !== demoUid));
  };
  
  const { deleteDemo, isDeleting, error: deleteError } = useDeleteDemo(onSuccess);

  const navigate = useNavigate();
  const handleEdit = (demoUid: number) => {
    const demoToEdit = demos.find((demo) => demo.uid === demoUid);
    if (demoToEdit) {
      navigate('/create', { state: { demo: demoToEdit, isEditing: true } });
    }
  };

  if (loading) return <Loading />;
  if (fetchError || deleteError) return <Error />;

  return (
    <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
      {demos.length === 0 ? (
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
      ) : (
        <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
          <div className="h-58 md:h-52 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-4 p-3">
            {demos.map((demo) => (
              <Demo
                key={demo.uid}
                title={demo.title}
                uid={demo.uid ?? 0}
                amountExercises={demo.exercises.length}
                handleEdit={() => handleEdit(demo.uid ?? 0)}
                isDeleting={isDeleting[demo.uid ?? 0]}
                handleDelete={() => deleteDemo(demo.uid ?? 0)}
                />
            ))}
          </div>
      </div>
      )}
    </div>
  );
};

export default Home;