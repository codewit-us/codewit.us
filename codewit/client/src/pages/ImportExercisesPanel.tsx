import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ImportExercisesPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendImport() {
    if (!file) {
      toast.error("Choose a CSV.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await axios.post("/exercises/import-csv", form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const json = res.data ?? {};
      const created = Number(json?.created ?? 0);
      const updated = Number(json?.updated ?? 0);

      toast.success(`Import complete — ${created} created, ${updated} updated.`);
      
      // if any component uses useAxiosFetch('/exercises'), this triggers a refetch
      window.dispatchEvent(new CustomEvent('cw:refetch', { detail: '/exercises' }));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Import failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

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
          disabled={loading}
          onClick={sendImport}
          className="flex bg-accent-500 text-white px-4 py-1 rounded-md disabled:opacity-60"
        >
          Import
        </button>
      </div>
    </div>
  );
}