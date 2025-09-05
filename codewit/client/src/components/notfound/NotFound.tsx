// codewit/client/src/components/notfound/NotFound.tsx
import { Link } from "react-router-dom";

const NotFoundPage = (): JSX.Element => {
  return (
    <div className = "flex justify-center items-center bg-zinc-900 flex-col w-full h-full">
      <p className="text-lg font-bold text-pink-800">404 ERROR</p>
      <h1 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Page not found</h1>
      <p className="mt-4 text-center text-gray-500 dark:text-gray-400">Sorry, the page you are looking for doesn't exist. Here are some helpful links:</p>
      <Link to="/"className="w-[150px] my-3 text-center px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-accent-500 rounded-lg shrink-0">
          Take me home
      </Link>
   </div>
  );
};

export default NotFoundPage;
