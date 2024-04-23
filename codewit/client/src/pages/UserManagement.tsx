import { useState } from 'react';
import { MagnifyingGlassIcon, ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

const UserManagement = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{ userName: string; isAdmin: boolean } | null>(null);
  const [searchDone, setSearchDone] = useState(false); 

  const handleSearch = () => {
    const foundUser = {
      userName: 'nkhan3',
      isAdmin: Math.random() > 0.5,
    };
    setSearchDone(true);
    if (searchQuery === 'nkhan3') {
      setUser(foundUser);
    } else {
      setUser(null);
    }
  };

  const toggleAdminStatus = () => {
    if (user) {
      setUser({ ...user, isAdmin: !user.isAdmin });
    }
  };

  return (
    <div className="flex flex-col w-full h-container-full p-6 bg-zinc-900">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">User Management</h1>
        <div className="flex">
          <input
            type="text"
            className="py-1 px-4 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r-md"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      {searchDone && !user && (
        <div className="text-center text-sm text-red-500">
          No user found with that name.
        </div>
      )}
      {user && (
        <div className="bg-gray-800 shadow overflow-hidden rounded-lg p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-white">{user.userName}</span>
            <button
              className={`px-4 py-2 flex rounded-md text-white ${user.isAdmin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
              onClick={toggleAdminStatus}
            >
              {user.isAdmin ? <ShieldExclamationIcon className="h-6 w-6 mr-2" /> : <ShieldCheckIcon className="h-6 w-6 mr-2" />}
              {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
