import { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import {
  PlayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';

import { StudentCourse as StuCourse } from '@codewit/interfaces';
import { Accordion } from '@codewit/shared/components';

import Error from '../components/error/Error';
import Loading from '../components/loading/LoadingPage';
import { useAxiosFetch } from "../hooks/fetching";

import StudentView from "./course/StudentView";

import bulbLit from '/bulb(lit).svg';
import bulbUnlit from '/bulb(unlit).svg';

interface StudentCourse extends StuCourse {
  type: "StudentView",
}

interface TeacherCourse {
  type: "TeacherView",
}

type GetCourse = StudentCourse | TeacherCourse;

interface CourseView {
  onCourseChange: (title: string) => void,
}

export default function CourseView({onCourseChange}: CourseViewProps) {
  const { course_id } = useParams();

  const { data: course, loading, error } = useAxiosFetch<GetCourse | null>(`/api/courses/${course_id}?student_view=1`, null);

  useEffect(() => {
    if (course != null && course.type === "StudentView") {
      onCourseChange(course.title);
    } else {
      onCourseChange("");
    }
  }, [course, onCourseChange]);

  if (loading) {
    return <Loading />;
  }

  if (error || course == null) {
    return <Error message="Failed to fetch courses. Please try again later." />;
  }

  switch (course.type) {
    case "StudentView":
      return <StudentView course={course}/>
    case "TeacherView":
      return <div>Teacher View WIP</div>;
    default:
      return <div>Unknown View from server</div>;
  }
}
