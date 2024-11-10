// codewit/client/src/pages/Home.tsx
import { useFetchStudentCourses } from '../hooks/useCourse';
import Error from '../components/error/Error';
import Loading from '../components/loading/LoadingPage';

const Home = (): JSX.Element => {

  const { data, loading, error } = useFetchStudentCourses();

  if (loading) return <Loading />;
  if (error) return <Error message="Failed to fetch courses. Please try again later." />;
  
  console.log(data);

  return (
    <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
      <div className="flex justify-center items-center h-container-full bg-zinc-900">
        <img src = "/hexicon.png" alt="codewitus bulb" className=" opacity-75 w-25 h-20" />
        <div className="text-left opacity-75">
          <h2 className = "font-medium text-white">Home Page</h2>
        </div>
      </div> 
    </div>
  );
  
};

export default Home;