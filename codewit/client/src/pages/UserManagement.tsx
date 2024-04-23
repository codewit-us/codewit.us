import { useState } from 'react';
import { MagnifyingGlassIcon, ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

const UserManagement = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Array<{ email: string; isAdmin: boolean }>>([
    { email: 'user@example.com', isAdmin: false },
    { email: 'admin@example.com', isAdmin: true }
  ]); 

  const handleSearch = () => {
    console.log("Search triggered for:", searchQuery);
  };

  const toggleAdminStatus = (index: number) => {
    const updatedUsers = [...users];
    updatedUsers[index].isAdmin = !updatedUsers[index].isAdmin;
    setUsers(updatedUsers);
  };

  return (
    <div className="flex flex-col w-full h-container-full p-6 bg-zinc-900">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">User Management</h1>
        <div className="flex">
          <input
            type="text"
            className="py-1 px-4 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 "
            placeholder="Search by email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-accent-500 hover:bg-accent-600 text-white p-2 rounded-r-md"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {users.map((user, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                  {user.isAdmin ? 'Admin' : 'User'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className={`inline-flex items-center w-40 px-3 py-1 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white ${user.isAdmin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    onClick={() => toggleAdminStatus(index)}
                  >
                    {user.isAdmin ? <ShieldExclamationIcon className="h-5 w-5 mr-2" /> : <ShieldCheckIcon className="h-5 w-5 mr-2" />}
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
