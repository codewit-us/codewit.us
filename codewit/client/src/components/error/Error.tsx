// codewit/client/src/components/error/Error.tsx
// Error.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PropsWithChildren, ReactNode, useEffect } from "react";

interface ErrorProps {
  message?: string;
  statusCode?: number; 
}

const Error = ({ message = "Oops! Page does not exist. We will return you to the main page.", statusCode = 400 }: ErrorProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateMessage = (location.state as { message?: string; statusCode?: number })?.message;
  const stateStatusCode = (location.state as { statusCode?: number })?.statusCode;

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const displayStatusCode = stateStatusCode || statusCode;

  return (
    <div className="flex flex-col justify-center items-center bg-zinc-900 w-full h-full px-4 text-center">
      <div className=" text-white rounded-md shadow-lg w-full max-w-xl mx-auto">
        <h1 className="inline-flex mb-4 text-7xl font-extrabold tracking-tight text-red-600 ">
          {displayStatusCode} 
           <p className="ml-1 text-7xl font-bold tracking-tight text-white">Error</p>
        </h1>
        <p className="text-lg">{stateMessage || message}</p>
      </div>
      <p className=" text-gray-400">Redirecting to the homepage in 5 seconds...</p>
    </div>
  );
};

export default Error;

type ErrorViewProps = PropsWithChildren<{
  title?: string | ReactNode,
}>;

export function ErrorView({title = "Error", children}: ErrorViewProps) {
  return <div className="flex flex-col justify-center items-center bg-zinc-900 w-full h-full px-4 text-center">
    <div className=" text-white rounded-md shadow-lg w-full max-w-xl mx-auto">
      {typeof title === "string" ?
        <h1 className="inline-flex mb-4 text-7xl font-extrabold tracking-tight text-red-600 ">
          {title}
        </h1>
        :
        title
      }
      {children}
    </div>
  </div>
}