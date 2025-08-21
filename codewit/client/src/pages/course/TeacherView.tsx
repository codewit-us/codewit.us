import { useParams } from "react-router-dom";
import { DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import bulbLit from '/bulb(lit).svg';

import { useCourseProgress } from '../../hooks/useCourse';
import Loading  from '../../components/loading/LoadingPage';
import { default as ErrorEle } from '../../components/error/Error';
import { useAxiosFetch } from "../../hooks/fetching";

import type { TeacherCourse } from '@codewit/interfaces';
import { useEffect } from "react";

interface TeacherViewProps {
  onCourseChange: (name: string) => void,
}

export default function TeacherView({ onCourseChange }: TeacherViewProps) {
  const { courseId } = useParams();

  if (courseId == null) {
    throw new Error("courseId param not given");
  }

  const { data: course, loading: course_loading, error: course_error } = useAxiosFetch<TeacherCourse | null>(`/api/courses/${courseId}`, null);
  const { data: students, loading, error } = useCourseProgress(courseId);

  useEffect(() => {
    if (course != null) {
      onCourseChange(course.title);
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
    <div className="h-container-full overflow-auto flex flex-col w-full bg-black items-center gap-2">

      {/* ───────── header + invite link ───────── */}
      <div className="bg-foreground-600 w-3/4 mt-4 rounded-md p-4">
        <span className="text-[16px] font-bold text-foreground-200">
          {courseTitle ? `${courseTitle} - ` : ''}Teacher Dashboard
        </span>

        {/* invite link (static for now) */}
        <div className="mt-4 flex items-center gap-2">
          <p className="text-foreground-200 text-sm">Class Link</p>
          <input
            className="p-1 bg-background-500 text-foreground-200 w-1/3 border border-accent-500 rounded-sm"
            type="text"
            placeholder="https://codewit.us/class/ap-comp-sci"
            readOnly
          />
          <button
            className="flex items-center gap-2 border border-accent-500 text-accent-500 font-bold hover:bg-accent-600/20 rounded-md p-1"
            title="copy link (todo)"
          >
            <DocumentDuplicateIcon className="h-6 w-6" />
            Copy
          </button>
        </div>
      </div>

      {/* ───────── progress table ───────── */}
      <div className="bg-foreground-600 w-3/4 rounded-md p-4 mb-10">
        <h1 className="font-bold text-foreground-200 pb-10 text-[16px]">
          Progress
        </h1>

        <div className="overflow-x-auto">
          <div className="flex flex-col">

            {/* column header */}
            <div className="flex">
              <div className="min-w-[200px] sticky left-0 bg-foreground-600 z-10">
                <span className="font-bold text-foreground-200 text-[16px]">
                  Name
                </span>
              </div>

              <div className="flex pl-14 mb-4">
                {Topics.map((topic, i) => (
                  <div key={i} className="w-[100px] flex justify-center">
                    <span className="font-bold text-foreground-200 text-[14px]">
                      {topic.length > 10 ? `${topic.slice(0,10)}…` : topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* student rows */}
            <div className="space-y-4 relative">
              {students.map((s, idx) => {
                const pct = Math.round(s.completion * 100);
                return (
                  <div key={idx} className="flex items-center hover:bg-foreground-500/20">
                    {/* name cell */}
                    <span className="text-foreground-200 text-[16px] min-w-[200px] sticky left-0 bg-foreground-600 z-10">
                      {s.studentName}
                    </span>

                    {/* progress bar */}
                    <div className="relative flex items-center">
                      <div
                        className="h-2 bg-alternate-background-500 rounded-full"
                        style={{ width: `${Topics.length * 100}px` }}
                      />
                      <div
                        className="absolute h-2 bg-accent-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="absolute flex items-center"
                        style={{ left: `${pct}%`, transform: 'translateX(-14%)' }}
                      >
                        {pct > 0 && <img src={bulbLit} className="size-6 z-10" alt="" />}
                        <span className="text-accent-500 text-sm font-medium ml-2">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}