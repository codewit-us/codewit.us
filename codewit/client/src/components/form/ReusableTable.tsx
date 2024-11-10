import React from "react";
import { Table } from "flowbite-react";

interface Column {
  header: string;
  accessor: string; 
}

interface ReusableTableProps<T> {
  columns: Column[];
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

const getNestedValue = (obj: any, path: string): any => {
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
};

const ReusableTable = <T extends { id?: string | number, uid?: string | number }>({
  columns,
  data,
  onEdit,
  onDelete,
}: ReusableTableProps<T>) => {
  return (
    <div className="rounded-md overflow-visible">
      <Table
        hoverable
        striped
        className="border-gray-700 bg-gray-900 text-gray-400 relative"
      >
        <Table.Head className="bg-gray-800 text-white">
          {columns.map((col) => (
            <Table.HeadCell
              key={col.header}
              className="text-gray-300 font-semibold"
            >
              {col.header}
            </Table.HeadCell>
          ))}
          <Table.HeadCell>
            <span className="sr-only">Actions</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-gray-700">
          {data.map((item) => (
            <Table.Row
              key={item.id || item.uid}
              className="hover:bg-gray-800 transition-colors duration-300"
            >
              {columns.map((col) => (
                <Table.Cell key={col.accessor} className="text-gray-400">
                  {
                    (() => {
                      const value = getNestedValue(item, col.accessor);
                      return value !== null && value !== undefined
                        ? String(value) 
                        : "-"; 
                    })()
                  }
                </Table.Cell>
              ))}
              <Table.Cell className="text-right space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline transition-all rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="text-sm font-medium text-red-500 hover:text-red-400 hover:underline transition-all rounded-md"
                >
                  Delete
                </button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default ReusableTable;
