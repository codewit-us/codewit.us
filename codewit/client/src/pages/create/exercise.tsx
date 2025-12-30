import { PlusIcon } from "@heroicons/react/24/solid";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import axios from "axios";
import { Button } from "flowbite-react";
import { Routes, Route, Link } from "react-router-dom";
import { toast } from "react-toastify";

import { ExerciseResponse } from "@codewit/interfaces";

import CreateButton from "../../components/form/CreateButton";
import { ReusableTable, Column } from "../../components/form/ReusableTable";
import { useExercisesQuery } from "../../hooks/useExercises";
import ImportExercisesPanel from '../ImportExercisesPanel';
import { ExerciseIdView } from "./exercise/exercise_id";

export function ExerciseView() {
  return <Routes>
    <Route index element={<ExerciseTable/>}/>
    <Route path="/:exercise_id" element={<ExerciseIdView/>}/>
  </Routes>
}

function ExerciseTable() {
  const { data, isLoading, isFetching, error, refetch } = useExercisesQuery();

  const deleteExercise = useMutation({
    mutationFn: async ({uid}: {uid: number}) => {
      await axios.delete(`/api/exercises/${uid}`, { withCredentials: true });
    },
    onSuccess: (data, vars, ctx) => {
      refetch();

      toast.success("Deleted exercise");
    },
    onError: (err, vars, ctx) => {
      console.error("failed to delete exercise:", err);

      toast.error("Failed to delete exercise.");
    }
  });

  const columns: Column<ExerciseResponse>[] = [
    {
      header: "Title",
      accessor: row => {
        return <Link to={`/create/exercise/${row.uid}`} className="truncate max-w-80">
          {row.title?.trim() || row.prompt || `#${row.uid}`}
        </Link>;
      }
    },
    {
      header: "Prompt",
      accessor: row => {
        return <div className="truncate max-w-80">{row.prompt}</div>;
      }
    },
    { header: "Topic", accessor: "topic" },
    { header: "Language", accessor: "language" },
    {
      header: "Difficulty",
      accessor: (r) => r.difficulty ?? "",
    }
  ];

  return <div className="mx-auto max-w-[88rem] h-full flex flex-col gap-y-2 p-6">
    <div className="w-full flex flex-row flex-nowrap items-center">
      <div className="flex-1"/>
      <Link to="/create/exercise/new" className="self-end">
        <Button type="button" className="">
          <PlusIcon className="w-6 h-6 mr-2"/> Create Exercise
        </Button>
      </Link>
    </div>
    <ImportExercisesPanel onImported={() => refetch()}/>
    {isLoading && isFetching ?
      <div className="text-gray-300 mt-4">Loading...</div>
      :
      error != null ?
        <div className="text-red-500 mt-4">Failed to load exercises.</div>
        :
        <ReusableTable
          className="flex-1"
          columns={columns}
          data={data ?? []}
          onDelete={record => deleteExercise.mutate({uid: record.uid})}
        />
    }
  </div>;
}

