import { useState } from "react"
import { Link } from "react-router-dom";

const NavBar = (): JSX.Element => {
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleNavbar = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-background-500 border-b border-gray-800">
      <div className="max-w-screen flex flex-wrap items-center justify-between mx-auto p-3">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="/logo-dark.png" className="h-10" alt="CodeWitUs Logo" />
        </Link>
        <button onClick={toggleNavbar} data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" 
          aria-controls="navbar-default" 
          aria-expanded={isOpen ? "true" : "false"}
        >
        <span className="sr-only">Open main menu</span>
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
        </button>
        <div className={`${isOpen ? "block" : "hidden"} w-full md:block md:w-auto`} id="navbar-default">
          <ul className="font-medium flex flex-col p-4 mt-4 md:p-0 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 ">
            <li>
              <Link to="/" className="block py-2 px-3 text-highlight-500 rounded hover:bg-accent-500 md:hover:bg-transparent md:border-0 md:hover:text-accent-500 md:p-0">
                home
              </Link>
            </li>
            <li>
              <Link to="/create" className="block py-2 px-3 text-highlight-500 rounded hover:bg-accent-500 md:hover:bg-transparent md:border-0 md:hover:text-accent-500 md:p-0">
                create
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;