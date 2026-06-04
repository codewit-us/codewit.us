import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { useState } from "react";
import { Route, Routes, Link } from "react-router-dom";
import { toast } from "react-toastify";

import ReusableTable, { Column } from "../../components/form/ReusableTable";
import { use_courses_query } from "../../hooks/courses";

import { CourseIdView } from "./course/course_id";

// holds the list of routes specific to viewing and editing coursesfor the platform
export function AdminCourseRoutes() {
  return <Routes>
    <Route index element={<CourseTable/>}/>
    <Route path="/:course_id" element={<CourseIdView/>}/>
  </Routes>
}

// table view that will load all available courses on the platform
function CourseTable() {
  const { data, isLoading, isFetching, error, refetch } = use_courses_query();

  const delete_course = useMutation({
    mutationFn: async ({id}: {id: string}) => {
      await axios.delete(`/api/courses/${id}`);
    },
    onSuccess: (data, vars, ctx) => {
      refetch();

      toast.success("Deleted course");
    },
    onError: (err, vars, ctx) => {
      toast.error("Failed to delete course.");
    }
  });

  const columns: Column<Course>[] = [
    {
      header: "Title",
      accessor: row => {
        return <Link to={`/create/course/${row.id}`} className="truncate max-w-80">
          {row.title}
        </Link>
      },
    },
    {
      header: "Modules",
      accessor: row => row.modules.length
    },
    {
      header: "Instructors",
      accessor: row => row.instructors.length
    },
    {
      header: "Roster",
      accessor: row => row.roster.length
    },
    {
      header: "Actions",
      accessor: row => <DeleteCourse
        course={row}
        on_delete={() => delete_course.mutate({id: row.id})}
      />
    }
  ];

  // follows similar layout as the exercise page
  return <div className="mx-auto max-w-[88rem] h-full flex flex-col gap-y-2 p-6">
    <div className="w-full flex flex-row flex-nowrap items-center">
      <div className="flex-1"/>
      <Link to="/create/course/new" className="self-end">
        <Button type="button" className="">
          <PlusIcon className="w-6 h-6 mr-2"/> Create Course
        </Button>
      </Link>
    </div>
    {isLoading && isFetching ?
      <div className="text-gray-300 mt-4">Loading...</div>
      :
      <ReusableTable className="flex-1" columns={columns} data={data ?? []}/>
    }
  </div>;
}

interface DeleteCourseProps {
  // the course the delete button references
  course: Course

  // the callback to use the course is to be deleted
  on_delete: () => void,
}

// a confirmation dialog when attempting to delete a course
function DeleteCourse({course, on_delete}: DeleteCourseProps) {
  const [open, set_open] = useState(false);

  const cancel_cb = () => {
    set_open(false);
  };

  const delete_cb = () => {
    set_open(false);
    on_delete();
  };

  return <>
    <div>
      <Button type="button" color="red" onClick={() => set_open(true)}>
        <TrashIcon className="w-4 h-4"/>
      </Button>
    </div>
    <Modal dismissible show={open} onClose={cancel_cb}>
      <ModalHeader>Delete Course "{course.title}"</ModalHeader>
      <ModalBody>
        <p>This will delete the specified course from the server. Are you sure?</p>
      </ModalBody>
      <ModalFooter>
        <Button type="button" color="red" onClick={delete_cb}>Delete</Button>
        <Button type="button" color="dark" onClick={cancel_cb}>Cancel</Button>
      </ModalFooter>
    </Modal>
  </>
}
