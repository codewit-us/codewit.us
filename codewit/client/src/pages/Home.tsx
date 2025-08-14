import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Error from '../components/error/Error';
import Loading from '../components/loading/LoadingPage';
import { DemoResponse } from '@codewit/interfaces';
import { Accordion } from '@codewit/shared/components';
import {
  PlayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import bulbLit from '/bulb(lit).svg';
import bulbUnlit from '/bulb(unlit).svg';
import { useAxiosFetch } from "../hooks/fetching";
import { Link } from "react-router-dom";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <h2 className="text-xl font-bold text-white mb-4">No Courses Available</h2>
    <p className="text-zinc-400">
      Please check back later for available courses.
    </p>
  </div>
);

const UnauthorizedState = () => (
  <div className="h-2/3 flex flex-col items-center justify-center">
    <h2 className="text-xl font-bold text-white mb-4">Please Sign In</h2>
    <p className="text-zinc-400">Sign in to access your courses</p>
    <a href="/oauth2/google">
      <button
        type="button"
        className="mt-4 px-5 py-2.5 flex items-center text-sm font-medium text-white bg-accent-500 rounded-lg hover:bg-accent-600 focus:ring-4 focus:ring-accent-300"
      >
        Log In
      </button>
    </a>
  </div>
);

interface InstructorPartial {
  uid: string,
  username: string,
  email: string,
}

interface InstructorCoursePartial {
  id: string,
  title: string,
  language: string,
}

interface StudentCoursePartial {
  id: string,
  title: string,
  language: string,
  instructors: InstructorPartial[],
}

interface Landing {
  student: StudentCoursePartial[],
  instructor: InstructorCoursePartial[],
}

export default function Home() {
  const { data, loading, error } = useAxiosFetch<Landing>(
    "/api/courses/landing",
    {
      student: [],
      instructor: [],
    },
  );
  const { user, loading: user_loading } = useAuth();

  if (user_loading) {
     return <Loading />;
   }
 
   if (!user) {
     return <UnauthorizedState />;
   }
 
   if (loading) {
     return <Loading />;
   }  

  if (error) {
    return <Error message="Failed to fetch courses. Please try again later." />;
  }

  if (data.student.length === 0 && data.instructor.length === 0) {
    return <EmptyState />;
  }

  let instructor_list = null;
  let student_list = null;

  if (data.instructor.length > 0) {
    instructor_list = <InstructorCourseList courses={data.instructor}/>;
  }

  if (data.student.length > 0) {
    student_list = <StudentCourseList courses={data.student}/>;
  }

  return <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
    <div className="max-w-7xl mx-auto px-10 py-4 space-y-2">
      {instructor_list}
      {student_list}
    </div>
  </div>;
}

interface StudentCourseListProps {
  courses: StudentCoursePartial[],
}

function StudentCourseList({ courses }: StudentCourseListProps) {
  return <div className="space-y-2">
    <h2 className="border-b text-2xl pb-2">Attending</h2>
    {courses.map(course => {
      return <div key={course.id} className="p-4 rounded-2xl bg-foreground-500 text-white">
        <h3 className="text-xl">
          <Link to={`/${course.id}`}>
            {course.title}
          </Link>
        </h3>
        <span>language: {course.language}</span>
        <div className="flex flex-row gap-x-2">
          <span>instructors:</span>
          <>
            {course.instructors.length === 0 ?
              <span>No instructors for this course</span>
              :
              course.instructors.map((instructor, index) => {
                if (index === course.instructors.length - 1) {
                  return <span key={instructor.uid}>
                    {instructor.username}
                  </span>
                } else {
                  return <span key={instructor.uid}>
                    {instructor.username},
                  </span>
                }
              })
            }
          </>
        </div>
      </div>;
    })}
  </div>;
}

interface InstructorCourseListProps {
  courses: InstructorCoursePartial[];
}

function InstructorCourseList({ courses }: InstructorCourseListProps) {
  return <div className="space-y-2">
    <h2 className="border-b text-2xl pb-2">Instructing</h2>
    {courses.map(course => {
      return <div key={course.id} className="p-4 rounded-2xl bg-foreground-500 text-white">
        <h3 className="text-xl">
          <Link to={`/${course.id}/dashboard`}>
            {course.title}
          </Link>
        </h3>
        <span>language: {course.language}</span>
      </div>;
    })}
  </div>;
}
