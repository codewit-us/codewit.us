// codewit/client/src/hooks/useCourse.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Course, StudentProgress } from '@codewit/interfaces';
import { useAuth } from './useAuth';

// General hook to handle fetching data with axios
const useAxiosFetch = (initialUrl: string, initialData: Course[] = []) => {
  const [data, setData] = useState<Course[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(initialUrl);

        setData(response.data);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialUrl]);

  return { data, setData, loading, error };
};

// Fetch Student Courses
export const useFetchStudentCourses = () => {
  const { user, loading: authLoading } = useAuth(); 
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const fetchStudentCourses = async () => {
      if (!user || !user.googleId) {
        setLoading(false); 
        return;
      }

      try {
        const response = await axios.get(`/courses/student/by-uid/${user.uid}`);
        setData(response.data);
      } catch (err) {
        setError(true);
        console.error('Failed to fetch student courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentCourses();
  }, [user, authLoading]);

  return { data, setData, loading, error };
};

// Hook to fetch all courses
export const useFetchCourses = () => useAxiosFetch('/courses');

// General hook to handle CRUD operations
const useAxiosCRUD = (method: 'get' | 'post' | 'patch' | 'delete') => {
  const [error, setError] = useState(false);
  const [response, setResponse] = useState(null);

  const operation = async (url: string, payload?: any) => {
    try {
      const res = await axios({ method, url, data: payload });
      setResponse(res.data);
      return res.data;
    } catch (error) {
      setError(true);
      throw new Error(`Failed to ${method} data: ${error}`);
    }
  };

  return { operation, response, error };
};

// Hook to post a new course
export const usePostCourse = () => {
  const { operation } = useAxiosCRUD('post');
  return (courseData: Course) => operation('/courses', courseData);
};

// Hook to patch an existing course
export const usePatchCourse = () => {
  const { operation } = useAxiosCRUD('patch');
  return (courseData: Course, uid: number | string) => operation(`/courses/${uid}`, courseData);
};

// Hook to delete a course
export const useDeleteCourse = () => {
  const { operation } = useAxiosCRUD('delete');
  return (uid: number | string) => operation(`/courses/${uid}`);
};

export const useCourseProgress = (courseId: string) => {
  const [data, setData] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await axios.get(`/courses/${courseId}/progress`, {
          signal: controller.signal,
        });
        setData(res.data);
      } catch (err: any) {
        if (err.code !== 'ERR_CANCELED') setError(true);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [courseId]);

  return { data, setData, loading, error };
};