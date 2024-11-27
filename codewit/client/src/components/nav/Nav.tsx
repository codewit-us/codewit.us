// codewit/client/src/components/nav/Nav.tsx
import { useState } from "react";
import { Navbar, Button } from "flowbite-react";
import { Link } from "react-router-dom";
import {
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  AcademicCapIcon
} from "@heroicons/react/24/outline";
import GoogleLogo from "../logo/GoogleLogo";

const NavBar = ({
  name,
  admin,
  handleLogout,
}: {
  name: string;
  admin: boolean;
  handleLogout: () => void;
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Navbar fluid={true}className="bg-foreground-600 p-1 border-b border-background-400">
      <Link to="/" className="block min-w-[9.1rem]">
        <img
          src="/logo-dark.png"
          className="w-[9.1rem] h-[2.5rem]"
          alt="CodeWitUs Logo"
        />
      </Link>

      {name && (
        <div className="flex w-full justify-end space-x-2 text-accent-500">
          <div className="flex justify-center gap-2 items-center">
            <AcademicCapIcon className="text-center h-6 w-6 mt-1" />
            <span className="text-center text-[20px] font-medium">{name}</span>
          </div>
        </div>
      )}

      <div className="flex items-center">
        <Button
          size="sm"
          onClick={toggleNavbar}
          className="mt-1 text-accent-600 hover:text-accent-700"
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </Button>
      </div>

      <div
        className={`fixed top-0 right-0 w-64 h-screen bg-foreground-700 shadow-lg z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-2">
          <Button
            size="sm"
            onClick={toggleNavbar}
            className="p-2 text-accent-500 hover:text-accent-700"
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
            <form action="http://localhost:3001/oauth2/google" method="get" className="w-full">
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
