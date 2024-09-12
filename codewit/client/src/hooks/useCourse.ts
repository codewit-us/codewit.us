import axios from 'axios';
import { useState, useEffect } from 'react';
import { Course } from '@codewit/interfaces';

// POST a course
const usePostCourse = () => {
  const postCourse = async (courseData: Course): Promise<any> => {
    try {
      const response = await axios.post('/courses', courseData);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { postCourse };
};

// PATCH a course
const usePatchCourse = () => {
  const patchCourse = async (courseData: Course, uid: number | string) => {
    try {
      const response = await axios.patch(`/courses/${uid}`, courseData);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { patchCourse };
};

// GET courses
const useFetchCourses = () => {
  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      return response.data as Course[];
    } catch (error) {
      throw Error();
    }
  };

  return { fetchCourses };
};

// DELETE a course
const useDeleteCourse = () => {
  const deleteCourse = async (courseID: number | string) => {
    try {
      const response = await axios.delete(`/courses/${courseID}`);
      return response.data;
    } catch (error) {
      throw Error();
    }
  };

  return { deleteCourse };
};

export { 
  usePostCourse, 
  usePatchCourse, 
  useFetchCourses, 
  useDeleteCourse 
};