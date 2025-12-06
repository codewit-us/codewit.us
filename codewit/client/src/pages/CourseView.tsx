import axios, { AxiosError } from "axios";
import { Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { StudentCourse as StuCourse} from '@codewit/interfaces';

import { ErrorPage } from "../components/error/Error";
import Loading from "../components/loading/LoadingPage";
import { useAxiosFetch } from "../hooks/fetching";

import StudentView from "./course/StudentView";
import { CenterPrompt } from "../components/placeholders";

interface StudentCourse extends StuCourse {
  type: "StudentView",
}

interface Enrolling {
  type: "Enrolling",
  title: string,
  is_registered: boolean,
  auto_enroll: boolean,
}

// on the chance that an instructor goes to this page and will only receive the
// instructor data they should be redirected to the dashboard instead. this could
// change in the future if the instructor wanted to view the course without having
// to be actually enrolled in the course.
interface TeacherView {
  type: "TeacherView",
  title: string,
}

type GetCourse = StudentCourse | TeacherView | Enrolling;

interface AlreadyEnrolled {
  type: "AlreadyEnrolled",
}

interface AlreadyRegistered {
  type: "AlreadyRegistered",
}

interface Enrolled extends StuCourse {
  type: "Enrolled",
}

interface Registered {
  type: "Registered",
}

type RegistrationResult = AlreadyEnrolled | AlreadyRegistered | Enrolled | Registered;

interface CourseView {
  onCourseChange: (title: string) => void,
}

export default function CourseView({onCourseChange}: CourseView) {
  const { course_id } = useParams();
  const navigate = useNavigate();

  if (course_id == null) {
    throw new Error("course_id not provided");
  }

  const [refresh, set_refresh] = useState(0);
  const { data: course, loading, error, setData } = useAxiosFetch<GetCourse | null>(`/api/courses/${course_id}?student_view=1&r=${refresh}`, null);

  useEffect(() => {
    if (course?.type === "StudentView") {
      onCourseChange(course.title);
    }
  }, [course, onCourseChange]);

  if (loading) {
    return <Loading />;
  }

  if (error || course == null) {
    return <ErrorPage message="Failed to fetch courses. Please try again later."/>;
  }

  if (course.type === "TeacherView") {
    navigate(`/${course_id}/dashboard`);

    return <Loading/>;
  }

  switch (course.type) {
    case "StudentView":
      return <StudentView course={course}/>;
    case "Enrolling":
      if (course.is_registered) {
        return <CenterPrompt header={course.title}>
          <p className="text-center text-white">
            You have requested enrollment for this course. Wait for the instructor to admit you.
          </p>
          <Link to="/" className="text-white bg-accent-500 rounded-md mt-4 p-2">
            Home page
          </Link>
        </CenterPrompt>;
      } else {
        return <EnrollingView
          course_id={course_id}
          course_title={course.title}
          auto_enroll={course.auto_enroll}
          on_update={data => {
            switch (data.type) {
              case "AlreadyEnrolled":
                set_refresh(v => v + 1);
                break;
              case "AlreadyRegistered":
              case "Registered":
                setData({
                  type: "Enrolling",
                  title: course.title,
                  is_registered: true,
                  auto_enroll: course.auto_enroll
                });
                break;
              case "Enrolled":
                setData({...data, type: "StudentView"});
                break;
            }
          }}
        />;
      }
    default:
      return <CenterPrompt header={"Unknown Response"}>
        <p className="text-center text-white">
          The client does not know how to handle the response from the server. Sorry, try going back to the home page.
        </p>
        <Link to="/" className="text-white bg-accent-500 rounded-md mt-4 p-2">
          Home page
        </Link>
      </CenterPrompt>;
  }
}

interface EnrollingViewProps {
  course_id: string,
  course_title: string,
  auto_enroll: boolean,
  on_update: (data: RegistrationResult) => void,
}

interface RegError {
  title: string,
  message: string,
}

function EnrollingView({course_id, course_title, auto_enroll, on_update}: EnrollingViewProps) {
  let [sending, set_sending] = useState(false);
  let [reg_state, set_reg_state] = useState<RegistrationResult | null>(null);
  let [error, set_error] = useState<RegError | null>(null);

  async function request_enrollment() {
    if (sending) {
      return;
    }

    set_sending(true);

    try {
      let result = await axios.post<RegistrationResult>(`/api/courses/${course_id}/register`);

      set_reg_state(result.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response != null) {
          switch (err.response.data.error) {
            case "CourseNotFound":
              set_error({
                title: "Course Not Found",
                message: "The requested course was not found. Make sure that the course you are registering for exists and is accepting enrollments."
              });
              break;
            case "ServerError":
              set_error({
                title: "Server Error",
                message: "There was a server error when registering for this course. Try again and see if the problem persists.",
              });
              break;
            default:
              console.error("unhandled error type:", err.response.data.error);

              set_error({
                title: "Server Error",
                message: "There was a server error when registering for this course. Try again and see if the problem persists.",
              });
              break;
          }
        } else {
          console.error("request error:", err);

          set_error({
            title: "Request Error",
            message: "There was a problem sending the registration request. Try again and see if the error persists."
          });
        }
      } else {
        console.error("error when sending registration:", err);

        set_error({
          title: "Client Error",
          message: "There was a problem registering for this course. Try again and see if the error persists."
        });
      }
    }

    set_sending(false);
  }

  let modal_title = null;
  let modal_contents = null;

  if (reg_state != null) {
    switch (reg_state.type) {
      case "AlreadyEnrolled":
        modal_title = "Already Enrolled";
        modal_contents = "You are already enrolled in this course.";
        break;
      case "AlreadyRegistered":
        modal_title = "Already Registered";
        modal_contents = "You have already registered for this course.";
        break;
      case "Enrolled":
        modal_title = "Enrolled";
        modal_contents = "You are now enrolled in this course.";
        break;
      case "Registered":
        modal_title = "Registered";
        modal_contents = "You have registered for this course.";
        break;
    }
  }

  return <>
    <CenterPrompt header={course_title}>
      <p className="text-center text-white">
        {auto_enroll ?
          "This course is currently auto-enrolling students. Would you like to enroll for this course?"
          :
          "This course is currently enrolling students. Would you like to enroll for this course?"
        }
      </p>
      <div className="flex flex-row gap-x-4 items-center">
        {sending ?
          <div className="text-white bg-accent-700 rounded-md mt-4 p-2">
            Home Page
          </div>
          :
          <Link to="/" className="text-white bg-accent-500 rounded-md mt-4 p-2">
            Home page
          </Link>
        }
        <button
          type="button"
          className="text-white bg-green-400 rounded-md mt-4 p-2"
          disabled={sending}
          onClick={() => request_enrollment()}
        >
          {auto_enroll ? "Auto Enroll" : "Request Enrollment"}
        </button>
      </div>
    </CenterPrompt>
    <Modal
      show={reg_state != null}
      position="center"
      onClose={() => {
        if (reg_state != null) {
          on_update(reg_state);
        }

        set_reg_state(null);
      }}
    >
      <Modal.Header className="bg-foreground-500 border-b border-foreground-700 rounded-t-md p-2">
        {modal_title}
      </Modal.Header>
      <Modal.Body className="bg-foreground-500 rounded-b-md">
        {modal_contents}
      </Modal.Body>
    </Modal>
    <Modal
      show={error != null}
      position="center"
      onClose={() => {
        set_error(null);
      }}
    >
      <Modal.Header className="bg-foreground-500 border-b border-foreground-700 rounded-t-md p-2">
        {error?.title}
      </Modal.Header>
      <Modal.Body className="bg-foreground-500 rounded-b-md">
        {error?.message}
      </Modal.Body>
    </Modal>
  </>;
}

// this is placeholder in order to force tailwind to include the styling
// needed. see ./tailwind.config.js for further details.
function E() {
  return <div className="md:h-auto text-xl"></div>
}
