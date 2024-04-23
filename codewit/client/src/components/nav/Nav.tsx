import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const NavBar = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/oauth2/google/userinfo')
      .then(response => {
        console.log('User:', response.data);
        setUser(response.data.user);
      })
      .catch(error => {
        console.log('Error fetching user:', error);
      });
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
          <ul className="font-medium flex flex-col items-center p-4 mt-4 md:p-0 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 ">
            <li>
              <Link to="/" className="block py-2 px-3 text-highlight-500 rounded hover:bg-accent-500 md:hover:bg-transparent md:border-0 md:hover:text-accent-500 md:p-0">
                Home
              </Link>
            </li>
            <li>
              <Link to="/create" className="block py-2 px-3 text-highlight-500 rounded hover:bg-accent-500 md:hover:bg-transparent md:border-0 md:hover:text-accent-500 md:p-0">
                Create
              </Link>
            </li>
            {user ? (
              <div className="relative">
                <button className="flex items-center justify-center rounded-md px-4 py-2 bg-white text-black" onClick={() => setIsOpen(!isOpen)}>
                  {user.email} 
                  <svg className="w-5 h-5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl">
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="flex items-center justify-center rounded-md px-4 py-2 bg-white text-black" onClick={handleGoogleLogin}>
                Sign in with Google
              </button>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
