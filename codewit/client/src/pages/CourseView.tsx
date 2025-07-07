import { useState, useEffect } from 'react';
import { useParams, useLocation } from "react-router-dom";
import {
  PlayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';

import { StudentCourse as StuCourse, TeacherCourse as TeachCourse} from '@codewit/interfaces';
import { Accordion } from '@codewit/shared/components';

import Error from '../components/error/Error';
import Loading from '../components/loading/LoadingPage';
import { useAxiosFetch } from "../hooks/fetching";

import StudentView from "./course/StudentView";
import TeacherView from './course/TeacherView';

import bulbLit from '/bulb(lit).svg';
import bulbUnlit from '/bulb(unlit).svg';
import { useAuth } from '../hooks/useAuth';

interface StudentCourse extends StuCourse {
  type: "StudentView",
}

type GetCourse = StudentCourse;

interface CourseView {
  onCourseChange: (title: string) => void,
}

export default function CourseView({onCourseChange}: CourseView) {
  
  const { course_id: courseId } = useParams();

  const { data: course, loading, error } = useAxiosFetch<GetCourse | null>(`/api/courses/${courseId}?student_view=1`, null);

  useEffect(() => {
    if (course != null) {
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
    default:
      return <div>Unknown View from server</div>;
  }
}
