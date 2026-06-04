import { User, Module } from "@codewit/interfaces";
import { updateCourseSchema, createCourseSchema } from "@codewit/validations";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Bars3Icon, TrashIcon } from "@heroicons/react/24/solid";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button, Label } from "flowbite-react";
import { useEffect, useMemo } from "react";
import { Route, Link, useParams, useNavigate } from "react-router-dom";
import { default as ReactSelect } from "react-select";
import { toast } from "react-toastify";

import axios from "axios";

import LoadingPage from "../../../components/loading/LoadingPage";
import { ErrorView } from "../../../components/error/Error";
import { useAppForm } from "../../../form";
import { use_single_course_query, single_course_query_key } from "../../../hooks/courses";
import { SelectStyles } from "../../../utils/styles";

export function CourseIdView() {
  const params = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();

  if (params.course_id == null) {
    return <ErrorView title="No ID Provided">
      <p>No course id was provided to the page.</p>
      <Link to="/create/course">
        <Button type="button">Back to courses</Button>
      </Link>
    </ErrorView>
  }

  if (params.course_id === "new") {
    return <CourseEdit
      course={null}
      on_created={record => {
        client.setQueryData(single_course_query_key(record.id), record);

        navigate(`/create/course/${record.id}`);
      }}
      on_cancel={() => navigate("/create/course")}
    />;
  } else {
    return <ValidCourseIdView course_id={params.course_id}/>;
  }
}

interface ValidCourseIdViewProps {
  course_id: string
}

function ValidCourseIdView({course_id}: ValidCourseIdViewProps) {
  const navigate = useNavigate();
  const client = useQueryClient();

  const { data, isLoading, isFetching, error } = use_single_course_query(course_id);

  if (isLoading && isFetching) {
    return <LoadingPage/>;
  }

  if (error != null) {
    return <ErrorView>
      <p>There was an error when attempting to load the requested course.</p>
      <Link to="/create/course">
        <Button type="button">Back to courses</Button>
      </Link>
    </ErrorView>;
  }

  if (data == null) {
    return <ErrorView title="Course Not Found">
      <p>The course was not found.</p>
      <Link to="/create/course">
        <Button type="button">Back to course</Button>
      </Link>
    </ErrorView>;
  }

  return <CourseEdit
    course={data}
    on_updated={record => client.setQueryData(
      single_course_query_key(record.id),
      record
    )}
    on_deleted={() => navigate("/create/course")}
    on_cancel={() => navigate("/create/course")}
  />
}

interface CourseForm {
  id: string,
  title: string,
  enrolling: boolean,
  auto_enroll: boolean,
  language: string,
  modules: CourseModuleForm[],
  instructors: CourseInstructorForm[],
  roster: CourseStudentForm[],
}

interface CourseModuleForm {
  uid: number,
  topic: string,
}

interface CourseInstructorForm {
  uid: number,
  username: string,
  email: string,
}

interface CourseStudentForm {
  uid: number,
  username: string,
  email: string,
}

function blank_form() {
  return {
    id: "",
    title: "",
    enrolling: false,
    auto_enrolling: false,
    language: "cpp",
    modules: [],
    instructors: [],
    roster: [],
  };
}

function course_to_form(course: Course): CourseForm {
  return {
    id: course.id,
    title: course.title,
    enrolling: course.enrolling,
    auto_enroll: course.auto_enroll,
    language: course.language,
    modules: course.modules.map(rec => ({uid: rec.uid, topic: rec.topic})),
    instructors: course.instructors.slice(),
    roster: course.roster.slice(),
  };
}

function form_to_req_body(value: CourseForm) {
  return {
    title: value.title,
    enrolling: value.enrolling,
    auto_enroll: value.auto_enroll,
    language: value.language,
    modules: value.modules.map(v => v.uid),
    instructors: value.instructors.map(v => v.uid),
    roster: value.roster.map(v => v.uid),
  };
}

interface CourseEditProps {
  course: Course | null,
  on_created?: (course: Course) => boolean | void,
  on_updated?: (course: Course) => boolean | void,
  on_deleted?: () => void,
  on_cancel?: () => void,
}

function CourseEdit({course, on_created, on_updated, on_deleted, on_cancel}: CourseEditProps) {
  const create_course = useMutation({
    mutationFn: async (payload: any) => {
      let result = await axios.post<Course>("/api/courses", payload);

      return result.data;
    },
    onSuccess: (data, vars, ctx) => {
      toast.success(`Created Course: ${data.title}`);
    },
    onError: (err, vars, ctx) => {
      toast.error("Failed to create course");
    }
  });

  const update_course = useMutation({
    mutationFn: async ({ id, payload }: {id: string, payload: any}) => {
      let result = await axios.patch<Course>(`/api/courses/${id}`, payload);

      return result.data;
    },
    onSuccess: (data, vars, ctx) => {
      toast.success(`Updated Course: ${data.title}`);
    },
    onError: (err, vars, ctx) => {
      toast.error("Failed to update course");
    }
  });

  const delete_course = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      let result = await axios.delete(`/api/courses/${id}`);

      return result.data;
    },
    onSuccess: (data, vars, ctx) => {
      toast.success(`Deleted Course: ${data.title}`);
    },
    onError: (err, vars, ctx) => {
      toast.error("Failed to delete course");
    }
  });

  const form = useAppForm({
    defaultValues: course != null ? course_to_form(course) : blank_form(),
    onSubmitMeta: {
      action: "send",
    } as FormMeta,
    onSubmit: async ({value, meta, formApi}) => {
      if (meta.action === "send") {
        let body = form_to_req_body(value);

        let result;
        let should_reset = false;

        if (course == null) {
          result = await create_course.mutateAsync(body);

          should_reset = on_created(result) ?? true;
        } else {
          result = await update_course.mutateAsync({id: course.id, payload: body});

          should_reset = on_updated(result) ?? true;
        }

        if (should_reset) {
          form.reset(course_to_form(result), {keepDefaultValues: false});
        }
      } else if (meta.action === "delete") {
        if (course != null) {
          await delete_course.mutateAsync({id: course.id});

          on_deleted();
        }
      }
    },
    validators: {
      onSubmit: ({value, formApi}) => {
        let body = form_to_req_body(value);
        let result = course == null ?
          createCourseSchema.safeParse(body) :
          updateCourseSchema.safeParse(body);

        if (!result.success) {
          let rtn = {
            fields: {},
          };

          for (let issue of result.error.issues) {
            rtn.fields[issue.path.join(".")] = issue.message;
          }

          return rtn;
        }
      }
    }
  });

  useEffect(() => {
    if (course == null) {
      form.reset(blank_form(), {keepDefaultValues: false});
    } else {
      form.reset(course_to_form(course), {keepDefaultValues: false});
    }
  }, [course?.id]);

  return <div className="mx-auto flex flex-col p-6 max-w-6xl gap-4">
    <form.AppForm>
      <form onSubmit={ev => {
        ev.preventDefault();
        ev.stopPropagation();

        form.handleSubmit();
      }}>
        <div className="flex flex-row flex-nowrap items-center gap-x-2 pb-2">
          <form.ConfirmAway on_away={() => on_cancel()}/>
          <h2 className="text-4xl font-bold text-heading">
            {course != null ? "Edit Course" : "Create Course"}
          </h2>
          <div className="flex-1"/>
          <form.SubmitIndicator/>
          <form.SubmitButton/>
          <form.ConfirmReset on_reset={() => form.reset()}/>
          {course != null ?
            <form.ConfirmDelete on_delete={() => form.handleSubmit({action: "delete"})}/>
            :
            null
          }
        </div>
        <div className="grid grid-cols-8 gap-2">
          <form.AppField name="id">
            {field => <field.TextField
              label="Course ID"
              disabled
              classNames={{container: "col-span-3"}}
            />}
          </form.AppField>
          <div className="col-span-5 flex flex-row flex-nowrap items-end gap-4">
            <form.AppField name="enrolling" validators={{
              onChange: ({ value, fieldApi }) => {
                // listening for changes on this so that when the value is set
                // to false the "auto_enroll" field is auto set to false as
                // well
                if (!value) {
                  fieldApi.form.setFieldValue("auto_enroll", false);
                }
              }
            }}>
              {field => <field.CheckboxField
                label="Enrolling"
                title="allows user to request being registered for a course"
              />}
            </form.AppField>
            <form.AppField name="auto_enroll">
              {field => <form.Subscribe selector={state => state.values.enrolling}>
                {enrolling => <field.CheckboxField
                  label="Auto Enroll"
                  title="allows for any user to be automatically enrolled into the course. 'enrolling' must be enabled"
                  disabled={!enrolling}
                  classNames={{
                    // when the field enrolling value changes we need to update
                    // styling and disable the input
                    container: !enrolling ? "cursor-not-allowed" : null,
                    field: !enrolling ? "cursor-not-allowed" : null,
                    label: !enrolling ? "cursor-not-allowed" : null,
                  }}
                />}
              </form.Subscribe>}
            </form.AppField>
          </div>
          <form.AppField name="title" validators={{
            onBlur: ({ value, fieldApi }) => fieldApi.setValue(value.trim()),
          }}>
            {field => <field.TextField label="Course Title" classNames={{container: "col-span-5"}}/>}
          </form.AppField>
          <div className="col-span-3"/>
          <form.AppField name="language">
            {field => <field.LanguageSelectField
              label="Course Language"
              classNames={{container: "col-span-3"}}
            />}
          </form.AppField>
          <div className="col-span-5"/>
          <div className="col-span-4 space-y-2">
            <form.AppField name="instructors" mode="array">
              {field => <form.Subscribe selector={state => ({
                submitting: state.isSubmitting
              })}>
                {({submitting}) => <>
                  <h2>Instructors ({field.state.value.length})</h2>
                  <InstructorSearch
                    instructors={field.state.value}
                    disabled={submitting}
                    on_add={user => field.pushValue({
                      uid: user.uid,
                      username: user.username,
                      email: user.email,
                    })}
                  />
                  <UserList
                    users={field.state.value}
                    when_empty="No Instructors"
                    disabled={submitting}
                    on_remove={field.removeValue}
                  />
                </>}
              </form.Subscribe>}
            </form.AppField>
          </div>
          <div className="col-span-4 space-y-2">
            <form.AppField name="roster" mode="array">
              {field => <form.Subscribe selector={state => ({
                submitting: state.isSubmitting
              })}>
                {({submitting}) => <>
                  <h2>Roster ({field.state.value.length})</h2>
                  <RosterSearch
                    roster={field.state.value}
                    disabled={submitting}
                    on_add={user => field.pushValue({
                      uid: user.uid,
                      username: user.username,
                      email: user.email
                    })}
                  />
                  <UserList
                    users={field.state.value}
                    when_empty="No Students"
                    disabled={submitting}
                    on_remove={field.removeValue}
                  />
                </>}
              </form.Subscribe>}
            </form.AppField>
          </div>
          <div className="col-span-4 space-y-2">
            <form.AppField name="modules">
              {field => <form.Subscribe selector={state => ({
                submitting: state.isSubmitting
              })}>
                {({submitting}) => <>
                  <h2>Modules ({field.state.value.length})</h2>
                  {/* as of making these changes, there is an issue with how an
                      array is updated that will cause the view to not update
                      if attempting to use `field.moveValue(index1, index2)`
                      where it will work on the first call and then stop working
                      afterwards. right now removing the mode and manually
                      making changes to the array seem to work and the view will
                      properly update.

                      package.json -> tanstack/react-form = "^1.14.1"
                      package-lock.json -> tanstack/react-form = "1.27.1"

                      the version changed when adding in the devtools which
                      bumped it to the current version.
                      */}
                  <ModuleSearch
                    modules={field.state.value}
                    disabled={submitting}
                    onAdd={module => {
                      let next = [...field.state.value];
                      next.push({uid: module.uid, topic: module.topic});

                      field.setValue(next);
                    }}
                  />
                  <SortableModuleList
                    modules={field.state.value}
                    disabled={submitting}
                    onSwap={(from, to) => {
                      let next = [...field.state.value];

                      next.splice(to, 0, next.splice(from, 1)[0]);

                      field.setValue(next);
                    }}
                    onRemove={index => {
                      let next = [...field.state.value];
                      next.splice(index, 1);

                      field.setValue(next);
                    }}
                  />
                </>}
              </form.Subscribe>}
            </form.AppField>
          </div>
        </div>
      </form>
    </form.AppForm>
  </div>
}

interface InstructorSearchProps {
  // the current list of known instructors
  instructors: CourseInstructorForm[],

  // disables interacting with the component
  disabled?: boolean,

  // callback indicating that a user is to be added as an instructor
  on_add: (user: User) => void;
}

// provides the ability to search for users to be considered instructors and
// add them when selected
//
// the component is self contained as in it will manage errors, loading, and
// input and only requires the current list of instructors and the on_add
// callback
function InstructorSearch({instructors, disabled, on_add}: InstructorSearchProps) {
  // this will not be sustainable when in the long run as more users join
  const { data, dataUpdatedAt, isLoading, isFetching, error } = useQuery({
    queryKey: ["avail_instructors"],
    queryFn: () => axios.get<User[]>("/api/users").then(r => r.data),
  });

  const avail = useMemo(() => {
    return (data ?? [])
      .filter(v => !instructors.find(i => v.uid === i.uid))
      .map(v => ({
        value: v.uid,
        label: `[${v.uid}] ${v.username} <${v.email}>`,
        user: v,
      }));
  }, [dataUpdatedAt, instructors]);

  let placeholder = "Search Instructors";

  if (isFetching || isLoading) {
    placeholder = "Loading..."
  } else if (avail.length === 0) {
    placeholder = "No instructors available";
  }

  return <div className="space-y-2">
    <ReactSelect
      id="instructor-search"
      placeholder={placeholder}
      styles={SelectStyles}
      options={avail}
      value={null}
      isDisabled={avail.length === 0 || disabled}
      onChange={value => {
        if (value != null) {
          on_add(value.user);
        }
      }}
    />
    {error != null ?
      <p>There was an error when attempting to retrieve the list of known instructors</p>
      :
      null
    }
  </div>
}

interface RosterSearchProps {
  // the current list of students
  roster: CourseStudentForm[],

  // disables interacting with the component
  disabled?: boolean,

  // callback indicating that a user is to be added as a student
  on_add: (user: User) => void;
}

// provides the ability to search for users to be considered students and add
// them when selected
//
// the component is self contained as in it will manage errors, loading, and
// input and only requires the current list of students and the on_add callback
function RosterSearch({roster, disabled, on_add}: RosterSearchProps) {
  // this will not be sustainable when in the long run as more users join
  const { data, dataUpdatedAt, isLoading, isFetching, error } = useQuery({
    queryKey: ["avail_students"],
    queryFn: () => axios.get<User[]>("/api/users").then(r => r.data),
  });

  const avail = useMemo(() => {
    return (data ?? [])
      .filter(v => !roster.find(i => v.uid === i.uid))
      .map(v => ({
        value: v.uid,
        label: `[${v.uid}] ${v.username} <${v.email}>`,
        user: v,
      }));
  }, [dataUpdatedAt, roster]);

  let placeholder = "Search Students";

  if (isFetching || isLoading) {
    placeholder = "Loading..."
  } else if (avail.length === 0) {
    placeholder = "No students available";
  }

  return <div className="space-y-2">
    <ReactSelect
      id="student-search"
      placeholder={placeholder}
      styles={SelectStyles}
      options={avail}
      value={null}
      isDisabled={avail.length === 0 || disabled}
      onChange={value => {
        if (value != null) {
          on_add(value.user);
        }
      }}
    />
    {error != null ?
      <p>There was an error when attempting to retrieve the list of students</p>
      :
      null
    }
  </div>
}

interface ModuleSearchProps {
  // the current list of modules
  modules: CourseModuleForm[],

  // disables interacting with the component
  disabled?: boolean,

  // callback indicating that a module is to be added
  onAdd: (module: Module) => void,
}

// provides the ability to search for users to be considered students and add
// them when selected
//
// the component is self contained as in it will manage errors, loading, and
// input and only requires the current list of students and the on_add callback
function ModuleSearch({ modules, disabled, onAdd }: ModuleSearchProps) {
  const { data, dataUpdatedAt, isLoading, isFetching, error } = useQuery({
    queryKey: ["avail_modules"],
    queryFn: () => axios.get<Module[]>("/api/modules").then(r => r.data)
  });

  const availableOptions = useMemo(() => {
    return (data ?? [])
      .filter((option) => !modules.find((module) => module.uid === option.uid))
      .map(v => ({
        value: v.uid,
        label: `[${v.uid}] ${v.topic}`,
        module: v,
      }))
  }, [dataUpdatedAt, modules]);

  let placeholder = "Search Modules";

  if (isFetching || isLoading) {
    placeholder = "Loading...";
  } else if (availableOptions.length === 0) {
    placeholder = "No modules available";
  }

  return <div className="space-y-2">
    <ReactSelect
      id="module-search"
      placeholder={placeholder}
      styles={SelectStyles}
      options={availableOptions}
      value={null}
      isDisabled={availableOptions.length === 0 || disabled}
      onChange={(value: SingleValue<SelectedTag>) => {
        if (value != null) {
          onAdd(value.module);
        }
      }}
    />
    {error != null ?
      <p>There was an error when attempting to retrieve the list of modules.</p>
      :
      null
    }
  </div>;
}

// basic user information that is required for the UserList component
interface UserInfo {
  uid: number,
  username: string,
  email: string,
}

// the available props for the UserList component
interface UserListProps {
  // the list of users to display for the `UserList` component
  users: UserInfo[],

  // will display this message if the list of users is empty
  when_empty: string,

  // enables / disabled the on_remove buttons
  disabled?: boolean,

  // a callback to indicate which user is being removed from the list
  on_remove: (index: number) => void,
}

// provides a common what to dipslay a list of users
//
// if the list of users is empty then it will render a blank with the supplied
// `when_empty` message in the middle
//
// otherwise it will display tue 1 based index of the user, their username,
// email, and uid. there will be a button that allows you to remove a user from
// the list
function UserList({users, when_empty, disabled, on_remove}: UserListProps) {
  if (users.length === 0) {
    return <div
      className="border rounded-lg p-2 gap-x-2 flex flex-row items-center bg-[rgb(55,65,81)] border-[rgb(75,85,99)]"
    >
      <div className="flex-1">
        <p className="truncate dark:text-white">{when_empty}</p>
      </div>
    </div>
  } else {
    return <div className="max-h-[50rem] overflow-y-auto space-y-2">
      {users.map((user, index) => {
        return <div
          key={user.uid}
          className="border rounded-lg p-2 gap-x-2 flex flex-row items-start bg-[rgb(55,65,81)] border-[rgb(75,85,99)]"
        >
          <div className="flex-1 min-w-0">
            <p className="truncate dark:text-white" title={user.username}>{index + 1}) {user.username}</p>
            <div className="truncate text-sm dark:text-white">uid: {user.uid}</div>
            <div className="truncate text-sm dark:text-white" title={user.email}>email: {user.email}</div>
          </div>
          <button
            type="button"
            className="rounded-md bg-red-600 p-2 text-white transition-colors hover:bg-red-500"
            disabled={disabled}
            onClick={() => on_remove(index)}
          >
            <TrashIcon className="h-6 w-6"/>
          </button>
        </div>
      })}
    </div>
  }
}

// the available props for the `SortableModuleList` component
interface SortableModuleListProps {
  // the current list of modules and their associated data to display
  modules: CourseModuleForm[],
  // disabled the `onRemove` and sorting capabilities of the component
  disabled?: boolean,
  // a callback to indicate that an index has moved from one location to
  // another
  onSwap: (fromIndex: number, toIndex: number) => void,
  // a callback to indicate which module is being removed from the list
  onRemove: (index: number) => void,
}

// a container for sorting the list modules provided.
//
//
function SortableModuleList({ modules, disabled, onSwap, onRemove }: SortableModuleListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over == null || active.id === over.id) {
      return;
    }

    const activeIndex = modules.findIndex((module) => module.uid === active.id);
    const overIndex = modules.findIndex((module) => module.uid === over.id);

    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    onSwap(activeIndex, overIndex);
  }

  if (modules.length === 0) {
    return <p className="text-sm text-gray-400">No modules selected.</p>;
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          disabled={disabled}
          items={modules.map((module) => module.uid)}
          strategy={verticalListSortingStrategy}
        >
          {modules.map((module, index) => (
            <SortableModuleItem
              key={module.uid}
              module={module}
              index={index}
              disabled={disabled}
              onRemove={() => onRemove(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableModuleItemProps {
  module: CourseModuleFormItem,
  index: number,
  disabled?: boolean,
  onRemove: () => void;
}

function SortableModuleItem({ module, index, disabled, onRemove }: SortableModuleItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: module.uid,
  });

  const style = {
    transform:
      transform != null
        ? `translate3d(0px, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
        : "",
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className="border rounded-lg p-2 gap-x-2 flex flex-row items-center bg-[rgb(55,65,81)] border-[rgb(75,85,99)]"
      style={style}
    >
      <div className="p-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <Bars3Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-white">{`${index + 1}. ${module.topic}`}</p>
        <span className="text-sm text-gray-300">uid: {module.uid}</span>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className="rounded-md bg-red-600 p-2 text-white transition-colors hover:bg-red-500"
        aria-label={`Remove module ${module.topic}`}
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
