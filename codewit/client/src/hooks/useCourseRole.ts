import { useEffect, useState } from 'react';
import axios from 'axios';

export type CourseRole = 'instructor' | 'student' | null;

export function useCourseRole(courseId: string | number | undefined) {
  const [role, setRole]   = useState<CourseRole>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    axios
      .get<{ role: CourseRole }>(`/api/courses/${courseId}/role`)
      .then(res => setRole(res.data.role))
      .catch(err => {
        setRole(null);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  return { role, loading, error };
}