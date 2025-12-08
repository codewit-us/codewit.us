import { useParams } from "react-router-dom";
import { DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import bulbLit from '/bulb(lit).svg';

import { useCourseProgress } from '../../hooks/useCourse';
import Loading  from '../../components/loading/LoadingPage';
import { ErrorPage } from '../../components/error/Error';
import { useAxiosFetch } from "../../hooks/fetching";
import { useEffect, useState } from "react";
import PendingRequestsCard from './components/PendingRequestsCard';
import type { Course, StudentProgress } from '@codewit/interfaces';
import { useQuery } from "@tanstack/react-query";
import axios from 'axios';
import { toast } from 'react-toastify';

interface TeacherViewProps {
  onCourseChange: (name: string) => void,
}

export type Pending = {
  uid: number;
  username: string;
  email: string;
  requested: string;
};

export default function TeacherView({ onCourseChange }: TeacherViewProps) {
  const { courseId } = useParams();

  if (courseId == null) {
    throw new Error("courseId param not given");
  }

  const { data: course, loading: course_loading, error: course_error } =
    useAxiosFetch<Course | null>(`/api/courses/${courseId}`, null);

  const { data: students, loading, error } = useCourseProgress(courseId);

  async function fetchPending(courseId: string): Promise<Pending[]> {
    const { data } = await axios.get(`/api/courses/${courseId}/registrations`);
    return data;
  }

  const { data: pending = [], refetch: refetchPending } = useQuery<Pending[]>({
    queryKey: ['pending', courseId],
    queryFn: () => fetchPending(courseId),
  });

  // Enrollment flags UI state
  const [enrolling, setEnrolling]   = useState<boolean>(false);
  const [autoEnroll, setAutoEnroll] = useState<boolean>(false);
  const [savingFlags, setSavingFlags] = useState<boolean>(false);
  const [exporting, setExporting] = useState(false);

  function csvEscape(val: unknown) {
    if (val == null) return '';
    const s = String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  useEffect(() => {
    if (course != null) {
      onCourseChange(course.title);
      setEnrolling(course.enrolling);
      setAutoEnroll(course.auto_enroll);
    } else {
      onCourseChange("");
    }
  }, [course, onCourseChange]);

  if (loading || course_loading) {
    return <Loading />;
  }
  
  if (error || course_error || course == null || !students) {
    return <ErrorPage message="Failed to load course information"/>;
  }

  // persist both flags in one PATCH
  async function persistFlags(nextEnrolling: boolean, nextAutoEnroll: boolean) {
    try {
      setSavingFlags(true);
      const { data } = await axios.patch(`/api/courses/${courseId}/enrollment`, {
        enrolling: nextEnrolling,
        auto_enroll: nextEnrolling ? nextAutoEnroll : false,
      });

      setEnrolling(Boolean(data.enrolling));
      setAutoEnroll(Boolean(data.auto_enroll));

      if (!data.enrolling) {
        // server purged pending registrations; refresh list
        await refetchPending();
      }
    } catch {
      toast.error('Failed to update enrollment settings');
    } finally {
      setSavingFlags(false);
    }
  }

  async function toggleEnrolling() {
    const next = !enrolling;
    await persistFlags(next, autoEnroll);
  }

  async function toggleAutoEnroll() {
    if (!enrolling) return; 
    const next = !autoEnroll;
    await persistFlags(enrolling, next);
  }

  async function handleExportCsv() {
    try {
      setExporting(true);

      if (!students || students.length === 0) {
        toast.info('No students to export.');
        return;
      }

      if (!course) {
        toast.error('Course not loaded.');
        return;
      }

      // Roster lookup for email
      const rosterArr = course.roster ?? [];
      const rosterByUid = new Map<number, Course['roster'][number]>(
        rosterArr.map((u) => [u.uid, u])
      );

      const header = [
        'Name',
        'Email',
        'Modules Completed',
        'Modules Total',
        'Completion %'
      ].join(',') + '\n';

      const lines: string[] = [header];

      const sorted: StudentProgress[] = [...students].sort((a, b) =>
        (a.studentName || '').localeCompare(b.studentName || '', undefined, { sensitivity: 'base' })
      );

      for (const s of sorted) {
        const email = (rosterByUid.get(s.studentUid)?.email ?? '').trim();

        lines.push([
          csvEscape(s.studentName ?? ''),
          csvEscape(email),
          csvEscape(s.modulesCompleted ?? ''),
          csvEscape(s.modulesTotal ?? ''),
          csvEscape(Number(s.completion ?? 0).toFixed(2))
        ].join(',') + '\n');
      }

      const blob = new Blob(lines, { type: 'text/csv;charset=utf-8' });

      // Filename construction: course-<id>-students-summary-YYYYMMDD.csv
      const now = new Date();
      const y = now.getUTCFullYear();
      const m = String(now.getUTCMonth() + 1).padStart(2, '0');
      const d = String(now.getUTCDate()).padStart(2, '0');
      const filename = `course-${courseId}-students-summary-${y}${m}${d}.csv`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Export ready: ${filename}`);
    } catch {
      toast.error('Export failed.');
    } finally {
      setExporting(false);
    }
  }

  const moduleCount = course.modules.length;

  return (
    <div className="w-full flex flex-col items-center bg-black gap-8 py-8">
      {/* ───────── header + invite link ───────── */}
      <div className="bg-foreground-600 w-3/4 rounded-md p-4">
        <span className="text-[16px] font-bold text-foreground-200">
          Teacher Dashboard
        </span>

        {/* invite link */}
        <div className="mt-4 flex items-center gap-2">
          <p className="text-foreground-200 text-sm">Class Link</p>
          <input
            id="invite-link"
            className="p-1 bg-background-500 text-foreground-200 w-1/3 border border-accent-500 rounded-sm"
            type="text"
            value={`${window.location.origin}/${courseId}`}
            readOnly
          />
          <button
            onClick={() => {
              const url = `${window.location.origin}/${courseId}`;
              navigator.clipboard.writeText(url);
            }}
            className="flex items-center gap-2 border border-accent-500 text-accent-500 font-bold hover:bg-accent-600/20 rounded-md p-1"
            title="Copy to clipboard"
          >
            <DocumentDuplicateIcon className="h-6 w-6" />
            Copy
          </button>
        </div>

        {/* ───────── enrollment controls (single row) ───────── */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground-200">Open for Enrollment</span>
              <button
                type="button"
                role="switch"
                aria-checked={enrolling}
                onClick={toggleEnrolling}
                disabled={savingFlags}
                title={enrolling ? 'Turn off enrollment' : 'Open for enrollment'}
                className={[
                  "relative inline-flex h-6 w-11 items-center rounded-full transition",
                  enrolling ? "bg-accent-500" : "bg-foreground-500/50",
                  savingFlags ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-5 w-5 transform rounded-full bg-white transition",
                    enrolling ? "translate-x-5" : "translate-x-1"
                  ].join(" ")}
                />
              </button>
              <span className="text-xs text-foreground-300">{enrolling ? 'On' : 'Off'}</span>
            </div>

            {/* divider */}
            <div className="hidden md:block h-4 w-px bg-foreground-400/30" />

            {/* Auto Enroll */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground-200">Auto Enroll</span>
              <button
                type="button"
                role="switch"
                aria-checked={enrolling && autoEnroll}
                onClick={toggleAutoEnroll}
                disabled={!enrolling || savingFlags}
                title={!enrolling ? 'Enable Open for Enrollment first' : (autoEnroll ? 'Disable auto enroll' : 'Enable auto enroll')}
                className={[
                  "relative inline-flex h-6 w-11 items-center rounded-full transition",
                  autoEnroll && enrolling ? "bg-accent-500" : "bg-foreground-500/50",
                  (!enrolling || savingFlags) ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-5 w-5 transform rounded-full bg-white transition",
                    autoEnroll && enrolling ? "translate-x-5" : "translate-x-1"
                  ].join(" ")}
                />
              </button>
              {!enrolling && (
                <span className="text-xs text-foreground-400">(enable Open for Enrollment)</span>
              )}
            </div>
          </div>

          <p className="text-xs text-foreground-300">
            Turning <span className="font-semibold">Open for Enrollment</span> off will delete all pending registration requests for this course.
          </p>
        </div>
      </div>

      {/* ───────── progress table ───────── */}
      <div className="bg-foreground-600 w-3/4 rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-bold text-foreground-200 text-[16px]">
            Student Progress
          </h1>
          <button
            onClick={handleExportCsv}
            disabled={exporting || students.length === 0}
            className={[
              "flex items-center gap-2 border border-accent-500 text-accent-500 font-bold rounded-md px-3 py-1",
              (exporting || students.length === 0)
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-accent-600/20"
            ].join(" ")}
            title={
              exporting
                ? "Export in progress"
                : students.length === 0
                  ? "No students to export"
                  : "Download student summary CSV"
            }
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>

        <div className={pending.length > 0 ? "max-h-[500px] overflow-y-auto overflow-x-auto" : "overflow-x-auto"}>
          <table className="min-w-full table-auto border-separate border-spacing-y-1">
            <colgroup>
              {/* Name column */}
              <col style={{ width: 220 }} />
              {/* One col per module; min 100px so small screens scroll instead of overlapping */}
              {course.modules.map((_, i) => (
                <col key={i} style={{ minWidth: 100 }} />
              ))}
            </colgroup>

            <thead className="bg-foreground-600 sticky top-0 z-20">
              <tr>
                <th
                  rowSpan={2}
                  className="text-[16px] font-bold text-left text-foreground-200 bg-foreground-600 sticky left-0 z-30"
                >
                  Name
                </th>
                <th
                  colSpan={moduleCount}
                  className="text-center px-4 py-2 text-foreground-200 text-[14px] align-top bg-foreground-600"
                >
                  Modules
                </th>
              </tr>
              <tr>
                {course.modules.map((mod, i) => (
                  <th
                    key={i}
                    className="px-2 py-1 text-foreground-300 text-xs font-semibold text-center whitespace-nowrap overflow-hidden text-ellipsis"
                    title={mod.topic}
                  >
                    {mod.topic}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.studentUid} className="hover:bg-foreground-500/10">
                  <td className="pr-4 whitespace-nowrap bg-foreground-600 sticky left-0 z-10">
                    <span className="text-sm font-medium text-white">
                      {student.studentName}
                      <span className="ml-2 font-semibold text-accent-400">
                        ({Math.round(student.completion)}%)
                      </span>
                    </span>
                  </td>

                  <td colSpan={moduleCount} className="px-4 py-2 w-full align-middle">
                    <div
                      className="relative w-full h-4 bg-alternate-background-500 rounded-full overflow-hidden"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, transparent 1px)',
                        backgroundSize: `calc(100% / ${moduleCount}) 100%`,
                        backgroundRepeat: 'repeat-x',
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 h-4 bg-accent-500 rounded-full transition-all duration-300"
                        style={{ width: `${student.completion}%` }}
                      />
                      <img
                        src={bulbLit}
                        alt="completion indicator"
                        className="absolute top-1/2 transform -translate-y-1/2 h-4"
                        style={{
                          left:
                            student.completion === 0
                              ? '0.25rem'
                              : `calc(${student.completion}% - 10px)`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── pending enrollment requests ─── */}
      {pending.length > 0 && (
        <div className="bg-foreground-600 w-3/4 rounded-md p-4">
          <h2 className="font-bold text-foreground-200 text-[16px] mb-4">
            Pending Enrollment Requests ({pending.length})
          </h2>
          <PendingRequestsCard courseId={courseId} pending={pending} />
        </div>
      )}
    </div>
  );
}