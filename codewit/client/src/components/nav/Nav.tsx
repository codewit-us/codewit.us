// codewit/client/src/components/nav/Nav.tsx
import { useState } from 'react';
import { Navbar, Button } from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import {
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import GoogleLogo from '../logo/GoogleLogo';

const NavBar = ({
  name,
  admin,
  handleLogout,
  courseTitle,
}: {
  name: string;
  admin: boolean;
  handleLogout: () => void;
  courseTitle?: string;
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Navbar
      fluid={true}
      className="border-b bg-foreground-600 border-background-400 dark:bg-foreground-600 dark:border-background-400"
    >
      <Link to="/" className="block min-w-[9.1rem]">
        <img
          src="/logo-dark.png"
          className="w-[9.1rem] h-[2.5rem]"
          alt="CodeWitUs Logo"
        />
      </Link>

      <div className="flex items-center justify-between flex-grow">
        <div className="flex items-center">
          {courseTitle && (
            <span className="ml-10 text-[16px] font-bold text-foreground-200">
              {courseTitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {name && (
            <div className="flex items-center gap-2 text-accent-500">
              {admin ? <AcademicCapIcon className="h-6 w-6" /> : <UserCircleIcon className="h-6 w-6" />}
              <span className="text-[20px] font-medium">{name}</span>
            </div>
          )}

          <button
            data-testid="navbar-toggle"
            className="h-9 px-3 relative flex items-center justify-center text-sm text-accent-600 hover:text-accent-700 bg-transparent dark:bg-transparent rounded-lg text-center font-medium focus:outline-none focus:ring-4"
            onClick={toggleNavbar}
          >
            {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 w-64 h-screen bg-foreground-700 shadow-lg z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end p-2">
          <Button
            size="sm"
            className="text-accent-500 hover:text-accent-700 bg-transparent dark:bg-transparent"
            color="dark"
            onClick={toggleNavbar}
          >
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-col px-4 space-y-4">
          <Link
            to="/"
            className="block px-3 p-1 rounded-md text-base font-medium text-accent-500 hover:text-white hover:bg-accent-600"
          >
            Home
          </Link>
          {admin && (
            <>
              <Link
                to="/create"
                className="block px-3 p-1 rounded-md text-base font-medium text-accent-500 hover:text-white hover:bg-accent-600"
              >
                Create
              </Link>
              <Link
                to="/usermanagement"
                className="block px-3 p-1 rounded-md text-base font-medium text-accent-500 hover:text-white hover:bg-accent-600"
              >
                Manage Users
              </Link>
            </>
          )}
          {name ? (
            <div className="flex flex-col items-center space-y-2">
              <Button
                size="sm"
                color="failure"
                onClick={handleLogout}
                className="w-full bg-accent-500 text-white hover:bg-accent-600 rounded-lg py-2 px-4 flex items-center gap-3 shadow-md transition-all"
              >
                <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-1" />
                <span className="text-md font-medium">Logout</span>
              </Button>
            </div>
          ) : (
            <form
              action="http://localhost:3001/oauth2/google"
              method="get"
              className="w-full"
            >
              <button
                type="submit"
                className="w-full bg-white text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 flex items-center gap-3 shadow-md transition-all"
              >
                <GoogleLogo className="h-5 w-5 flex-shrink-0" />
                <span className="text-md font-medium">Log In with Google</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </Navbar>
  );
};

export default NavBar;
