import React, { useState, useMemo } from "react";
import { Table, Pagination } from "flowbite-react";

interface Column {
  header: string;
  accessor: string;
}

interface ReusableTableProps<T> {
  columns: Column[];
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  itemsPerPage?: number; 
}

const getNestedValue = (obj: any, path: string): any => {
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
};

const ReusableTable = <T extends { id?: string | number; uid?: string | number }>({
  columns,
  data,
  onEdit,
  onDelete,
  itemsPerPage = 14,
}: ReusableTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = useMemo(() => {
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, startIndex, itemsPerPage]);

  return (
    <div className="rounded-md border border-gray-700 bg-gray-900 text-gray-400">
      <div className="overflow-y-auto h-[80vh] rounded-t-md">
        <Table
          hoverable
          striped
          className="border-gray-700 bg-gray-900 text-gray-400"
        >
          <Table.Head className="bg-gray-800 text-white sticky top-0 z-10">
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
            {currentData.map((item) => (
              <Table.Row
                key={item.id || item.uid}
                className="hover:bg-gray-800 transition-colors duration-300"
              >
                {columns.map((col) => (
                  <Table.Cell key={col.accessor} className="text-gray-400">
                    {(() => {
                      const value = getNestedValue(item, col.accessor);
                      return value !== null && value !== undefined
                        ? String(value)
                        : "-";
                    })()}
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
      {/* Pagination */}
      <div className="flex justify-center items-center bg-gray-800 text-white py-2 rounded-b-md">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          theme={{
            pages: {
              base: "inline-flex items-center px-3 py-1 text-sm font-medium",
              active: "bg-blue-600 text-white rounded-md",
              inactive: "text-gray-400 hover:bg-gray-700 rounded-md",
            },
            previous: {
              base: "inline-flex items-center px-3 py-1 text-sm font-medium",
              inactive: "text-gray-400",
              active: "hover:bg-gray-700",
            },
            next: {
              base: "inline-flex items-center px-3 py-1 text-sm font-medium",
              inactive: "text-gray-400",
              active: "hover:bg-gray-700",
            },
          }}
        />
      </div>
    </div>
  );
};

export default ReusableTable;