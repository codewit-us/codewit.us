import { useState, useMemo, useEffect } from "react";
import { Table, Pagination } from "flowbite-react";
import LoadingPage from "../loading/LoadingPage";
import type { CustomFlowbiteTheme } from "flowbite-react";
import { cn } from "../../utils/styles";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
};

interface ReusableTableProps<T> {
  columns: Column<T>[],
  data: T[],
  className?: string,
  itemsPerPage?: number,
  onEdit?: (item: T) => void,
  onDelete: (item: T) => void,
}

const getNestedValue = (obj: any, path: string): any => {
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
};

const paginationTheme: CustomFlowbiteTheme["pagination"] = {
  pages: {
    base: "mt-2 inline-flex items-center -space-x-px text-gray-400",
    showIcon: "inline-flex",
    previous: {
      base: "ml-0 rounded-l-lg border border-gray-700 bg-gray-800 px-3 py-2 leading-tight text-gray-400 hover:bg-gray-700 hover:text-white",
      icon: "h-5 w-5",
    },
    next: {
      base: "rounded-r-lg border border-gray-700 bg-gray-800 px-3 py-2 leading-tight text-gray-400 hover:bg-gray-700 hover:text-white",
      icon: "h-5 w-5",
    },
    selector: {
      base: "w-10 h-10 border border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white flex justify-center items-center",
      active: "bg-accent-500 text-white border-gray-700",
      disabled: "cursor-not-allowed opacity-50",
    },
  },
};

export const ReusableTable = <T extends { id?: string | number; uid?: string | number }>({
  columns,
  data,
  className,
  itemsPerPage = 15,
  onEdit,
  onDelete,
}: ReusableTableProps<T>) => {

  useEffect(() => {
    const tableWrapper = document.querySelector('[data-testid="table-element"] > div:first-child');
    if (tableWrapper) {
      tableWrapper.remove();
    }
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  if (! currentData) {
    return <LoadingPage />;
  }

  return <div className={cn("flex flex-col rounded-md border border-gray-700 bg-gray-900 text-gray-400 h-full", className)}>
    <div className="flex-1 overflow-y-auto rounded-t-md">
      <Table hoverable striped className="border-gray-700 bg-gray-900 text-gray-400">
        <Table.Head className="bg-gray-800 text-white sticky top-0 z-10">
          {columns.map((col) => (
            <Table.HeadCell key={col.header} className="text-gray-300 font-semibold">
              {col.header}
            </Table.HeadCell>
          ))}
          <Table.HeadCell className="text-gray-300 font-semibold">
              Actions
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-gray-700">
          {currentData.map((item, rowIdx) => (
            <Table.Row key={rowIdx} className="hover:bg-gray-800 transition-colors duration-300">
              {columns.map((col, colIdx) => {
                let content: React.ReactNode = "-";

                if (typeof col.accessor === "function") {
                  content = col.accessor(item);
                } else {
                  const path = String(col.accessor);
                  const value =
                    path.includes(".")
                      ? getNestedValue(item, path)
                      : (item as any)[path];

                  content =
                    value !== null && value !== undefined ? String(value) : "-";
                }

                return (
                  <Table.Cell key={`${col.header}-${colIdx}`} className="text-gray-400">
                    {content}
                  </Table.Cell>
                );
              })}

              <Table.Cell className="text-right space-x-2">
                {onEdit != null ?
                  <button
                    onClick={() => onEdit(item)}
                    className="text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline transition-all rounded-md"
                  >
                    Edit
                  </button>
                  :
                  null
                }
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
    <div className="flex flex-none justify-center items-center bg-gray-800 text-white py-2 rounded-b-md">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        theme={paginationTheme}
      />
    </div>
  </div>;
};

export default ReusableTable;
