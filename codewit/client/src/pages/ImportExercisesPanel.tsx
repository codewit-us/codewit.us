import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EXERCISES_KEY } from "../hooks/useExercises";

type ImportResponse = { ok: boolean; created: number; updated: number };

export default function ImportExercisesPanel({
  onImported,
}: { onImported?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const qc = useQueryClient();

  const importMutation = useMutation<ImportResponse, any, File>({
    mutationFn: async (f: File) => {
      const form = new FormData();
      form.append("file", f);
      const res = await axios.post<ImportResponse>("/exercises/import-csv", form, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Import complete — ${data.created} created, ${data.updated} updated.`);
      qc.invalidateQueries({ queryKey: EXERCISES_KEY });
      onImported?.();
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      const msg =
        (typeof data === "object" ? (data.message || JSON.stringify(data)) : data) ||
        err?.message ||
        "Import failed. Please try again.";
      toast.error(msg);
    },
  });

  const sendImport = () => {
    if (!file) {
      toast.error("Choose a CSV.");
      return;
    }
    importMutation.mutate(file);
  };

  return (
    <div className="bg-foreground-600 rounded-md p-4 space-y-3">
      <h3 className="text-foreground-200 font-semibold">Import Exercises (CSV)</h3>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="bg-background-500 text-foreground-200 border border-foreground-500 rounded px-2 py-1 cursor-pointer">
          Choose File
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>

        <span className="bg-background-500 text-foreground-300 border border-foreground-500 rounded px-2 py-1 min-w-[12rem]">
          {file ? file.name : "No file chosen"}
        </span>

        <button
          disabled={importMutation.isPending}
          onClick={sendImport}
          className="flex bg-accent-500 text-white px-4 py-1 rounded-md disabled:opacity-60"
        >
          {importMutation.isPending ? "Importing…" : "Import"}
        </button>
      </div>
    </div>
  );
}