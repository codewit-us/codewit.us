// codewit/client/src/components/form/ExistingTable.tsx
import { Link } from "react-router-dom";
import { useState } from "react";

type ExistingTableProps = {
  items: any[];
  name?: string;
  onEdit: (uid: number) => void;
  onDelete: (uid: number) => void;
};

const ExistingTable = ({ items, name = "Exercises", onEdit, onDelete }: ExistingTableProps): JSX.Element => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const handleDeleteClick = (uid: number) => {
    setItemToDelete(uid);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      onDelete(itemToDelete);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-4xl h-full rounded-xl shadow-lg p-6 overflow-auto bg-gray-800/90 bg-opacity-50">
      <h2 className="text-xl font-bold text-white mb-6">Existing {name}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-white">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th className="px-6 py-3">{name}</th>
              <th className="px-6 py-3 text-right">Edit</th>
              <th className="px-6 py-3 text-right">Delete</th>
            </tr>
          </thead>
          <tbody>
            {items && items.map((ex, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="px-6 py-4">
                  <div className="max-w-md md:max-w-2xl whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {name === "Demos" ? (
                      <Link to={`/read/${ex.uid}`} className="text-blue-400 hover:text-blue-600">
                        {ex.prompt ? ex.prompt : ex.title ? ex.title : ex.uid}
                      </Link>
                    ) : (
                      ex.prompt ? ex.prompt : ex.title ? ex.title : ex.uid
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    id={`edit-${index}`} 
                    onClick={() => onEdit(ex.uid ? ex.uid : ex.id)} 
                    className="text-blue-400 hover:text-blue-600"
                  >
                    Edit
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    id={`delete-${index}`} 
                    onClick={() => handleDeleteClick(ex.uid ? ex.uid : ex.id)} 
                    className="text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this module? 
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExistingTable;