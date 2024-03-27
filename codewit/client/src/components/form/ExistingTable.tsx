import { ExerciseResponse } from '@codewit/interfaces';

type ExistingTableProps = {
  exercises: ExerciseResponse[];
  onEdit: (uid: number) => void;
  onDelete: (uid: number) => void;
};

const ExistingTable = ({ exercises, onEdit, onDelete }: ExistingTableProps): JSX.Element => (
  <div className="w-full max-w-4xl h-full rounded-md shadow-lg p-4 overflow-auto bg-gray-800 bg-opacity-50">
    <h2 className="text-xl font-semibold text-white mb-2">Existing Exercises</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-white">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            <th className="px-6 py-3">Exercise Prompt</th>
            <th className="px-6 py-3 text-right">Edit</th>
            <th className="px-6 py-3 text-right">Delete</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((ex, index) => (
            <tr key={ex.uid} className="border-b border-gray-700">
              <td className="px-6 py-4">
                <div className="max-w-md md:max-w-2xl whitespace-nowrap overflow-hidden overflow-ellipsis">
                  {ex.prompt}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onEdit(ex.uid)} className="text-blue-400 hover:text-blue-600">
                  Edit
                </button>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onDelete(ex.uid)} className="text-red-400 hover:text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ExistingTable;
