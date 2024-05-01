import React, { useState } from 'react';
import { MagnifyingGlassIcon, ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface User {
  email: string;
  isAdmin: boolean;
}

interface ModalProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
}

const Modal: React.FC<ModalProps> = ({ user, onClose, onSave }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-gray-800 p-6 rounded-lg space-y-4 w-full max-w-md">
      <h2 className="text-white text-lg font-semibold">Change Admin Status</h2>
      <p className="text-white">Are you sure you want to {user.isAdmin ? 'remove' : 'assign'} admin rights to {user.email}?</p>
      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
        <button onClick={onSave} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Confirm</button>
      </div>
    </div>
  </div>
);

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([
    { email: 'user1@example.com', isAdmin: false },
    { email: 'admin@example.com', isAdmin: true },
    { email: 'user2@example.com', isAdmin: false }
  ]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSearch = () => {
    const matchedUsers = users.filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredUsers(matchedUsers);
    if (matchedUsers.length === 0) {
      alert('No user found with that email.');
    }
  };

  const toggleAdminStatus = (user: User) => {
    setCurrentUser(user);
    setShowModal(true);
  };

  const saveAdminStatus = () => {
    if (currentUser) {
      const updatedUsers = users.map(user =>
        user.email === currentUser.email ? { ...user, isAdmin: !user.isAdmin } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase())));
      setShowModal(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-container-full bg-zinc-900 p-6">
      <div className="mb-6 w-full max-w-7xl">
        <div className="flex">
          <input
            type="text"
            className="py-2 px-5 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            placeholder="Search by email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-accent-500 hover:bg-accent-600 text-white p-2 px-3 rounded-r-md"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="w-full max-w-7xl bg-gray-800 shadow overflow-hidden rounded-lg">
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
            {filteredUsers.map((user) => (
              <tr key={user.email}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                  {user.isAdmin ? 'Admin' : 'User'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className={`inline-flex items-center w-40 px-3 py-1 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium text-white ${user.isAdmin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    onClick={() => toggleAdminStatus(user)}
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
      {showModal && currentUser && (
        <Modal user={currentUser} onClose={() => setShowModal(false)} onSave={saveAdminStatus} />
      )}
    </div>
  );
};

export default UserManagement;
