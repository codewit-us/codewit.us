import { useParams } from "react-router-dom";
import { DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import bulbLit from '/bulb(lit).svg';

import { useCourseProgress } from '../../hooks/useCourse';
import Loading  from '../../components/loading/LoadingPage';
import { default as ErrorEle } from '../../components/error/Error';
import { useAxiosFetch } from "../../hooks/fetching";
import { useEffect } from "react";
import PendingRequestsCard from './components/PendingRequestsCard';
import type { Course } from '@codewit/interfaces';
import { useQuery } from "@tanstack/react-query";
import axios from 'axios';

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

  const { data: course, loading: course_loading, error: course_error } = useAxiosFetch<Course | null>(`/api/courses/${courseId}`, null);
  const { data: students, loading, error } = useCourseProgress(courseId);

  async function fetchPending(courseId: string): Promise<Pending[]> {
    const { data } = await axios.get(`/api/courses/${courseId}/registrations`);
    return data;
  }

  const {
    data: pending = [],
    isLoading: pendingLoading,
    isError: pendingError,
  } = useQuery<Pending[]>({
    queryKey: ['pending', courseId],
    queryFn: () => fetchPending(courseId),
  });

  useEffect(() => {
    if (course != null) {
      onCourseChange(course.title);
    } else {
      onCourseChange("");
    }
  }, [course, onCourseChange]);

  if (loading || course_loading) {
    return <Loading />;
  }
  
  if (error || course_error || course == null || !students) {
    return <ErrorEle message="Failed to load course information"/>;
  }

  const courseTitle = course.title;
  const Topics = course.modules.map(m => m.topic);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center gap-8 py-8">
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
      </div>

      {/* ───────── progress table ───────── */}
      <div className="bg-foreground-600 w-3/4 rounded-md p-4">
        <h1 className="font-bold text-foreground-200 pb-10 text-[16px]">
          Student Module Completion Progress
        </h1>

        <div
          className={
            pending.length > 0
              ? "max-h-[500px] overflow-y-auto overflow-x-auto"
              : "overflow-x-auto"
          }
        >
          <table className="min-w-full table-auto border-separate border-spacing-y-1">
            <thead className="bg-foreground-600 sticky top-0 z-20">
              <tr>
                <th className="text-[16px] font-bold text-left text-foreground-200 bg-foreground-600 sticky left-0 z-30">
                  Name
                </th>
                <th className="text-left px-4 py-2 text-foreground-200 text-[14px] align-top bg-foreground-600 sticky top-0 z-20">
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-2 text-[15px] font-bold text-foreground-300 max-w-full">
                    {course.modules.map((mod, i) => (
                      <span key={i} className="whitespace-nowrap">{mod.topic}</span>
                    ))}
                  </div>
                </th>
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
                  <td className="px-4 py-2 w-full align-middle">
                    <div className="relative w-full h-4 bg-alternate-background-500 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-4 bg-accent-500 rounded-full transition-all duration-300"
                        style={{ width: `${student.completion}%` }}
                      />
                      <img
                        src={bulbLit}
                        alt="completion indicator"
                        className="absolute top-1/2 transform -translate-y-1/2 h-4"
                        style={{
                          left: student.completion === 0
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