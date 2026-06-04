import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Course } from "@codewit/interfaces";

export function courses_query_key(): ["courses"] {
  return ["courses"];
}

export function use_courses_query() {
  return useQuery({
    queryKey: courses_query_key(),
    queryFn: () => axios.get<Course[]>("/api/courses").then(r => r.data),
  });
}

export function single_course_query_key(course_id: string): ["course_id", string] {
  return ["course_id", course_id];
}

export function use_single_course_query(course_id: string) {
  return useQuery({
    queryKey: single_course_query_key(course_id),
    queryFn: async () => {
      try {
        let result = await axios.get(`/api/courses/${course_id}`);

        return result.data;
      } catch(err) {
        if (axios.isAxiosError(err)) {
          if (err?.response?.status === 404) {
            return null;
          }
        }

        throw err;
      }
    }
  });
}
