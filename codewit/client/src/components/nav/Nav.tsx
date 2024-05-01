import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftStartOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const NavBar = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/oauth2/google/userinfo')
      .then(response => {
        setUser(response.data.user);
      })
  }, []);

  const toggleNavbar = (): void => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    axios.get('/oauth2/google/logout')
      .then(() => {
        setUser(null);
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
  };

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/google';
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
                <Link to="/create" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">Create</Link>
                <Link to="/usermanagement" className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">Manage Users</Link>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:ml-6">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 font-medium">{user.email}</span>
                <button onClick={handleLogout} className="p-1 rounded hover:bg-gray-700">
                  <ArrowLeftStartOnRectangleIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGoogleLogin}
                className="px-5 py-2.5 flex items-center text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
              >
                <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Log in with Google
              </button>
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
              <Link to="/create" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Create</Link>
              <Link to="/usermanagement" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Manage Users</Link>
              {user ? (
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">{user.email}</span>
                  <button onClick={handleLogout} className="w-full text-center px-3 py-2 rounded-md text-base font-medium bg-blue-500 hover:bg-gray-600">
                    Log out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-500 hover:bg-blue-600"
                >
                  <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                  Log in with Google
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
