import { useState } from 'react';

export default function ImportCoursePanel() {
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(dryRun: boolean) {
    setError(null);
    setResult(null);
    if (!courseId) { setError('Enter a Course ID'); return; }
    if (!file) { setError('Choose a CSV'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/courses/${courseId}/import-exercises?dryRun=${dryRun}`, {
        method: 'POST',
        body: form,
        credentials: 'include', 
      });
      const json = await res.json();
      setResult(json);
      if (!res.ok) setError(json?.message || 'Validation failed');
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-foreground-600 rounded-md p-4 space-y-3 mb-6">
      <h3 className="text-foreground-200 font-semibold">Import Course (CSV)</h3>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          className="bg-background-500 text-foreground-200 border border-foreground-500 rounded px-2 py-1"
          placeholder="Course ID (e.g., CS101)"
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
        />
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="text-foreground-200"
        />
        <button
          disabled={loading}
          onClick={() => send(true)}
          className="border border-accent-500 text-accent-500 rounded px-3 py-1 hover:bg-accent-600/20 disabled:opacity-60"
        >
          Dry Run
        </button>
        <button
          disabled={loading}
          onClick={() => send(false)}
          className="bg-accent-500 text-black font-semibold rounded px-3 py-1 hover:opacity-90 disabled:opacity-60"
        >
          Import
        </button>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}
      {result && (
        <pre className="bg-background-500 text-foreground-200 text-xs p-3 rounded overflow-auto max-h-64">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}