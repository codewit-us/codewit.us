import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftStartOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

const NavBar = ({ email, admin, handleLogout }: { email: string, admin: boolean, handleLogout: () => void; }): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleNavbar = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 border-b border-background-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img src="/logo-dark.png" className="h-12" alt="CodeWitUs Logo" />
              </Link>
            </div>
            <div className="hidden sm:flex sm:ml-6">
              <div className="flex items-center h-full">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">Home</Link>
                {admin && (
                  <>
                    <Link to="/create" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">Create</Link>
                    <Link to="/usermanagement" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">Manage Users</Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:ml-6">
            {email ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 font-medium">{email}</span>
                <button onClick={handleLogout} className="p-1 rounded hover:bg-gray-700">
                  <ArrowLeftStartOnRectangleIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
            ) : (
              <form action="http://localhost:3001/oauth2/google" method="post">
                <input
                  type="submit"
                  value="Log in with Google"
                  className="px-5 py-2.5 flex items-center text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
                />
              </form>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button onClick={toggleNavbar} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
              {isOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Home</Link>
              {admin && (
                <>
                  <Link to="/create" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Create</Link>
                  <Link to="/usermanagement" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Manage Users</Link>
                </>
              )}
              {email ? (
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">{email}</span>
                  <button onClick={handleLogout} className="w-full text-center px-3 py-2 rounded-md text-base font-medium bg-blue-500 hover:bg-gray-600">
                    Log out
                  </button>
                </div>
              ) : (
                <form action="http://localhost:3001/oauth2/google" method="post" className="w-full">
                  <input
                    type="submit"
                    value="Log in with Google"
                    className="w-full flex items-center justify-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-500 hover:bg-blue-600"
                  />
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
