// codewit/client/src/components/error/Error.tsx
import { Link, useLocation } from "react-router-dom";
import { PropsWithChildren, ReactNode } from "react";

interface ErrorProps {
  message?: string;
  statusCode?: number; 
}

export const ErrorPage = ({ message = "Oops! Page does not exist. You can now return to the main page.", statusCode = 400 }: ErrorProps): JSX.Element => {
  const location = useLocation();

  const stateMessage = (location.state as { message?: string; statusCode?: number })?.message;
  const stateStatusCode = (location.state as { statusCode?: number })?.statusCode;

  const displayStatusCode = stateStatusCode || statusCode;

  return (
    <div className="flex flex-col justify-center items-center bg-zinc-900 w-full h-full px-4 text-center">
      <div className=" text-white rounded-md shadow-lg w-full max-w-xl mx-auto">
        <h1 className="inline-flex mb-4 text-7xl font-extrabold tracking-tight text-red-600 ">
          {displayStatusCode} 
           <p className="ml-1 text-7xl font-bold tracking-tight text-white">Error</p>
        </h1>
        <p className="text-lg whitespace-pre-line">{stateMessage || message}</p>
        <div className="mt-6">
          <Link to="/"
            className="px-8 py-4 inline-flex items-center justify-center
                       text-base font-semibold text-white bg-accent-500 rounded-lg
                     hover:bg-accent-600 focus:ring-4 focus:ring-accent-300"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

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