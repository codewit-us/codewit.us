// codewit/client/src/pages/DemoForm.tsx
import { useEffect, useMemo, useState } from "react";
import ReusableTable, { Column } from "../components/form/ReusableTable";
import { toast } from "react-toastify";
import VideoSelect from "../components/form/VideoSelect";
import { topic_options } from "../components/form/TagSelect";
import { language_options, get_language_option } from "../components/form/LanguageSelect";
import CreateButton from "../components/form/CreateButton";
import { DemoResponse, ExerciseResponse } from "@codewit/interfaces";
import { isFormValid } from "../utils/formValidationUtils";
import LoadingPage from "../components/loading/LoadingPage";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../components/ui/modal";
import { useField, useForm } from "@tanstack/react-form";
import { Button, Label, TextInput } from "flowbite-react";
import CreatableSelect from "react-select/creatable";
import { cn, SelectStyles } from "../utils/styles";
import Select from "react-select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ErrorView } from "../components/error/Error";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Bars3Icon, TrashIcon } from "@heroicons/react/24/solid";

interface DemoForm {
  uid?: number,
  title: string,
  topic: string,
  tags: string[],
  language: string,
  youtube_id: string,
  youtube_thumbnail: string,
  exercises: DemoExercise[]
}

interface DemoExercise {
  uid: number,
  prompt: string,
}

function blank_form(): DemoForm {
  return {
    uid: undefined,
    title: "",
    youtube_id: "",
    youtube_thumbnail: "",
    topic: "",
    language: "cpp",
    tags: [],
    exercises: [],
  };
}

function demo_form(given: DemoResponse): DemoForm {
  return {
    uid: given.uid,
    title: given.title,
    youtube_id: given.youtube_id,
    youtube_thumbnail: given.youtube_thumbnail,
    topic: given.topic,
    language: given.language,
    tags: given.tags,
    exercises: given.exercises.map(({uid, prompt}) => ({uid, prompt})),
  };
}

export default function DemoTable() {
  const [edit_demo, set_edit_demo] = useState(blank_form());
  const [view_edit, set_view_edit] = useState(false);

  const client = useQueryClient();
  const {data: demos, isFetching, error, refetch} = useQuery({
    queryKey: ["search_demos"],
    queryFn: async () => {
      let result = await axios.get<DemoResponse[]>("/api/demos");

      return result.data;
    }
  });

  const delete_demo = useMutation({
    mutationFn: async (uid: number) => {
      await axios.delete(`/api/demos/${uid}`);
    },
    onSuccess: (data, vars, ctx) => {
      let current = client.getQueryData<DemoResponse[]>(["search_demos"]);

      if (current != null) {
        let filtered = current.filter(demo => demo.uid !== vars);

        client.setQueryData(["search_demos"], filtered);
      }

      toast.success("Demo deleted");
    },
    onError: (data, vars, ctx) => {
      toast.error("Failed to delete demo. Please try again.");
    },
  });

  const columns: Column<DemoForm>[] = [
    { header: "Title", accessor: "title" },
    { header: "Topic", accessor: (row) => row.topic },
    { header: "Language", accessor: (row) => row.language },
  ];

  if (demos == null && isFetching) {
    return <LoadingPage />;
  } else if (error != null) {
    return <ErrorView title="Search Demos Error">
      <p>There was an error when attempting to load demos</p>
    </ErrorView>;
  }

  return <>
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      <CreateButton title="Create Demo" onClick={() => {
        set_view_edit(true);
        set_edit_demo(blank_form());
      }}/>
      <ReusableTable
        columns={columns}
        data={demos ?? []}
        onEdit={demo => {
          set_view_edit(true);
          set_edit_demo(demo_form(demo));
        }}
        onDelete={demo => {
          delete_demo.mutate(demo.uid);
        }}
      />
    </div>
    <DemoForm
      view={view_edit}
      demo={edit_demo}
      on_cancel={() => {
        set_view_edit(false);
      }}
      on_created={demo => {
        refetch();
        set_view_edit(false);
      }}
      on_updated={demo => {
        refetch();
        set_view_edit(false);
      }}
    />
  </>;
}

interface DemoFormProps {
  view: boolean,
  demo: DemoForm,
  on_cancel: () => void,
  on_created: (demo: DemoResponse) => void,
  on_updated: (demo: DemoResponse) => void,
}

function DemoForm({view, demo, on_cancel, on_created, on_updated}: DemoFormProps) {
  const send_demo = useMutation({
    mutationFn: async (data: DemoForm) => {
      let body = {
        uid: data.uid ?? 0,
        title: data.title,
        youtube_id: data.youtube_id,
        youtube_thumbnail: data.youtube_thumbnail,
        topic: data.topic,
        tags: data.tags,
        language: data.language,
        exercises: data.exercises.map(({uid}) => uid),
      };

      if (data.uid != null) {
        return await axios.patch<DemoResponse>(`/api/demos/${data.uid}`, body);
      } else {
        return await axios.post<DemoResponse>("/api/demos", body);
      }
    },
    onSuccess: (res, vars, ctx) => {
      if (vars.uid != null) {
        toast.success("Demo updated");

        on_updated(res.data);
      } else {
        toast.success("Demo created");

        on_created(res.data);
      }
    },
    onError: (err, vars, ctx) => {
      if (vars.uid == null) {
        toast.error("Failed to create new demo. Please try again.");
      } else {
        toast.error("Failed to update demo. Please try again.");
      }
    }
  });

  const form = useForm({
    defaultValues: demo,
    onSubmit: async ({value}) => {
      let result = await send_demo.mutateAsync(value);

      form.reset(demo_form(result.data));
    }
  });

  useEffect(() => {
    form.reset(demo);
  }, [demo.uid]);

  useEffect(() => {
    form.reset();
  }, [view]);

  return <Modal show={view} position="center" size="2xl" onClose={() => {
    on_cancel();
  }}>
    <ModalHeader>
      <form.Subscribe
        selector={state => ([state.values.uid])}
        children={([uid]) => uid != null ? "Edit Demo" : "Create Demo"}
      />
    </ModalHeader>
    <form onSubmit={ev => {
      ev.preventDefault();
      ev.stopPropagation();

      form.handleSubmit();
    }}>
      <ModalBody>
        <form.Field name="title" children={(field) => {
          return <div className="space-y-2">
            <Label htmlFor={field.name}>
              Title <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={ev => field.handleChange(ev.target.value)}
            />
          </div>;
        }}/>
        <form.Field name="youtube_id" children={(field) => {
          return <VideoSelect required youtube_id={field.state.value} onSelectVideo={(id, thumbnail) => {
            field.handleChange(id);
            // have to use this since the id and thunbnail are tied to the same input
            form.setFieldValue("youtube_thumbnail", thumbnail);
          }}/>
        }}/>
        <form.Field name="topic" children={field => {
          return <div className="space-y-2">
            <Label htmlFor={field.name}>
              Topic <span className="text-red-500">*</span>
            </Label>
            <Select
              id={field.name}
              name={field.name}
              options={topic_options}
              value={{label: field.state.value, value: field.state.value}}
              onChange={value => field.handleChange(value?.value ?? "")}
              styles={SelectStyles}
            />
          </div>
        }}/>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="tags" mode="array" children={(field) => {
            return <div className="space-y-2">
              <Label htmlFor={field.name}>Tags</Label>
              <CreatableSelect
                isMulti
                id={field.name}
                value={field.state.value.map(tag => ({label: tag, value: tag}))}
                onChange={(value) => field.handleChange(value.map(({value}) => value))}
                styles={SelectStyles}
              />
            </div>
          }}/>
          <form.Field name="language" children={field => {
            return <div className="space-y-2" data-testid="language-select">
              <Label htmlFor={field.name}>Language</Label>
              <Select
                id={field.name}
                name={field.name}
                options={language_options}
                value={get_language_option(field.state.value)}
                onChange={value => field.handleChange(value?.value ?? "")}
                isSearchable={false}
                styles={SelectStyles}
              />
            </div>;
          }}/>
        </div>
        <form.Field name="exercises" mode="array" children={field => {
          return <div className="border-t pt-2 space-y-2">
            <Label>Exercises</Label>
            <ExerciseSearch values={field.state.value} on_add={add => field.pushValue(add)}/>
            <SortableExercise
              values={field.state.value}
              on_swap={(a_index, b_index) => field.moveValue(a_index, b_index)}
              on_remove={(index, uid) => field.removeValue(index)}
            />
          </div>
        }}/>
      </ModalBody>
      <ModalFooter>
        <form.Subscribe
          selector={state => ([
            state.canSubmit,
            state.isSubmitting,
            state.values.uid,
            state.isDirty,
          ])}
          children={([can_submit, is_submitting, uid, is_dirty]) => {
            return <Button type="submit" disabled={!can_submit || !is_dirty}>
              {is_submitting ? "..." : (uid != null ? "Update" : "Create")}
            </Button>
          }}
        />
        <Button type="button" color="dark" onClick={() => on_cancel()}>
          Cancel
        </Button>
      </ModalFooter>
    </form>
  </Modal>
}

interface ExerciseSearchProps {
  values: DemoExercise[],
  on_add: (value: DemoExercise) => void,
}

function ExerciseSearch({values, on_add}: ExerciseSearchProps) {
  const {data, isFetching, error} = useQuery({
    queryKey: ["search_exercises"],
    queryFn: async () => {
      let result = await axios.get<ExerciseResponse[]>("/api/exercises");

      return result.data.map(exercise => ({
        value: exercise.uid,
        label: exercise.prompt,
        language: exercise.language,
      }));
    }
  });

  const avail = useMemo(() => {
    // this could be a problem if the list gets big enough
    return (data ?? []).filter(v => !values.find(a => v.value === a.uid));
  }, [data, values]);

  let placeholder = "Search Exercises";

  if (isFetching) {
    placeholder = "Loading...";
  }

  // this is going to be a bit janky but it will work
  return <Select
    id="exercise-search"
    placeholder={placeholder}
    styles={SelectStyles}
    options={avail}
    value={null}
    onChange={value => {
      if (value != null) {
        on_add({uid: value.value, prompt: value.label});
      }
    }}
    isDisabled={error != null}
  />;
}

interface SortableExerciseProps {
  values: DemoExercise[],
  on_swap: (a_index: number, b_index: number) => void,
  on_remove: (index: number, uid: number) => void,
}

function SortableExercise({values, on_swap, on_remove}: SortableExerciseProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function on_drag_end({active, over}: DragEndEvent) {
    if (active.id !== over?.id) {
      let a_index = null;
      let b_index = null;

      for (let index = 0; index < values.length; index += 1) {
        if (active.id === values[index].uid) {
          a_index = index;
        }

        if (over?.id === values[index].uid) {
          b_index = index;
        }

        if (a_index != null && b_index != null) {
          break;
        }
      }

      if (a_index == null || b_index == null) {
        console.log("a_index or b_index is null");

        return;
      }

      on_swap(a_index, b_index);
    }
  }

  return <div className="overflow-auto space-y-2">
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={on_drag_end}>
      <SortableContext items={values.map(({uid}) => uid)} strategy={verticalListSortingStrategy}>
        {values.map((exercise, index) => {
          return <SortableExerciseItem key={exercise.uid} on_remove={() => on_remove(index, exercise.uid)} {...exercise}/>;
        })}
      </SortableContext>
    </DndContext>
  </div>
}

interface SortableExerciseItemProps {
  uid: number,
  prompt: string,
  on_remove: () => void,
}

function SortableExerciseItem({uid, prompt, on_remove}: SortableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: uid});

  const style = {
    //transform: transform != null ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})` : "",
    transform: transform != null ? `translate3d(${Math.round(0)}px, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})` : "",
    transition,
  };

  // the colors for the container are pulled from the input styles of
  // flowbit-react. if there is a specific className that can be used
  // then they can be replaced, otherwise manually specifying the
  // colors.
  return <div
    ref={setNodeRef}
    className="border rounded-lg p-2 gap-x-2 flex flex-row items-center bg-[rgb(55,65,81)] border-[rgb(75,85,99)]"
    style={style}
  >
    <div className="p-2" {...attributes} {...listeners}>
      <Bars3Icon className="h-5 w-5"/>
    </div>
    <div className="flex-1">
      <p className="truncate dark:text-white bg-">{prompt}</p>
      <span className="text-sm dark:text-white">uid: {uid}</span>
    </div>
    <Button type="button" color="red" onClick={() => on_remove()}>
      <TrashIcon className="h-6 w-6"/>
    </Button>
  </div>
}