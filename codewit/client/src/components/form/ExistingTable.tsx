type ExistingTableProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  name?: string
  onEdit: (uid: number) => void;
  onDelete: (uid: number) => void;
};

const ExistingTable = ({ items, name = "Exercises", onEdit, onDelete }: ExistingTableProps): JSX.Element => (
  <div className="w-full max-w-4xl h-full rounded-md shadow-lg p-4 overflow-auto bg-gray-800 bg-opacity-50">
    <h2 className="text-xl font-semibold text-white mb-2">Existing {name}</h2>
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
                  {ex.prompt ? ex.prompt : ex.title ? ex.title: ex.uid}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button id={`edit-${index}`} onClick={() => onEdit(ex.uid ? ex.uid : ex.id)} className="text-blue-400 hover:text-blue-600">
                  Edit
                </button>
              </td>
              <td className="px-6 py-4 text-right">
                <button id={`delete-${index}`} onClick={() => onDelete(ex.uid ? ex.uid : ex.id)} className="text-red-400 hover:text-red-600">
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
