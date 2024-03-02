import { Link } from "react-router-dom";

const Error = (): JSX.Element => {
  return (
    <div className = "flex justify-center items-center bg-zinc-900 flex-col w-full h-full">
      <p className="text-1xl font-bold text-pink-800">ERROR</p>
      <h1 className="mt-3 text-1xl font-semibold text-white md:text-3xl">Something Went Wrong....</h1>
      <Link to="/"className="w-[150px] my-3 text-center px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-accent-500 rounded-lg shrink-0">
          Take me home
      </Link>
   </div>
  );
};

export default Error;
