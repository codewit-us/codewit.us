import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Select, { MultiValue, SingleValue } from "react-select";
import { toast } from "react-toastify";
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
import { Module, SelectedTag } from "@codewit/interfaces";

import ReusableTable, { Column } from "../components/form/ReusableTable";
import ReusableModal from "../components/form/ReusableModal";
import LanguageSelect from "../components/form/LanguageSelect";
import CreateButton from "../components/form/CreateButton";
import InputLabel from "../components/form/InputLabel";
import TextInput from "../components/form/TextInput";
import {
  useFetchCourses,
  usePostCourse,
  usePatchCourse,
  useDeleteCourse,
} from "../hooks/useCourse";
import { useFetchModules } from "../hooks/useModule";
import { useFetchUsers } from "../hooks/useUsers";
import { isFormValid } from "../utils/formValidationUtils";
import { SelectStyles, cn } from "../utils/styles";

interface CourseUser {
  uid: number;
  username: string;
  email: string;
}

interface CourseModuleFormItem {
  uid: number;
  topic: string;
}

interface CourseFormData {
  id: string;
  title: string;
  enrolling: boolean;
  auto_enroll: boolean;
  language: string;
  modules: CourseModuleFormItem[];
  instructors: number[];
  roster: number[];
}

interface CourseListItem {
  id: string;
  title: string;
  enrolling: boolean;
  auto_enroll: boolean;
  language: string;
  modules: Array<number | Module>;
  instructors: CourseUser[];
  roster: CourseUser[];
}

function blankCourseForm(): CourseFormData {
  return {
    id: "",
    title: "",
    enrolling: false,
    auto_enroll: false,
    language: "cpp",
    modules: [],
    instructors: [],
    roster: [],
  };
}

function normalizeCourseModule(
  module: number | Module,
  moduleLookup: Map<number, string>
): CourseModuleFormItem {
  if (typeof module === "number") {
    return {
      uid: module,
      topic: moduleLookup.get(module) ?? `Module ${module}`,
    };
  }

  return {
    uid: module.uid ?? 0,
    topic: module.topic,
  };
}

function courseToFormData(
  course: CourseListItem,
  moduleLookup: Map<number, string>
): CourseFormData {
  return {
    id: course.id,
    title: course.title,
    enrolling: course.enrolling,
    auto_enroll: course.auto_enroll,
    language: course.language,
    modules: course.modules.map((module) => normalizeCourseModule(module, moduleLookup)),
    instructors: course.instructors.map((instructor) => instructor.uid),
    roster: course.roster.map((student) => student.uid),
  };
}

export default function CourseForm() {
  const { data: courses, setData: setCourses } = useFetchCourses();
  const { data: modules } = useFetchModules();
  const { data: users } = useFetchUsers();

  const postCourse = usePostCourse();
  const patchCourse = usePatchCourse();
  const deleteCourse = useDeleteCourse();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>(blankCourseForm);

  const courseRows = courses as unknown as CourseListItem[];
  const setCourseRows = setCourses as unknown as Dispatch<SetStateAction<CourseListItem[]>>;

  const moduleLookup = useMemo(() => {
    return new Map(
      modules
        .filter((module) => module.uid != null)
        .map((module) => [module.uid as number, module.topic || `${module.uid}`])
    );
  }, [modules]);

  const moduleOptions = useMemo<SelectedTag[]>(() => {
    return modules
      .filter((module) => module.uid != null)
      .map((module) => ({
        value: module.uid as number,
        label: module.topic || `${module.uid}`,
      }));
  }, [modules]);

  const userOptions = useMemo<SelectedTag[]>(() => {
    return users.map((user: any) => ({
      value: user.uid,
      label: user.username,
    }));
  }, [users]);

  const handleInputChange = <K extends keyof CourseFormData>(
    name: K,
    value: CourseFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    selectedOption: MultiValue<SelectedTag>,
    name: "instructors" | "roster"
  ) => {
    const selectedValues = selectedOption ? selectedOption.map((option) => option.value) : [];
    setFormData((prev) => ({ ...prev, [name]: selectedValues }));
  };

  const handleEdit = (course: CourseListItem) => {
    setFormData(courseToFormData(course, moduleLookup));
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (course: CourseListItem) => {
    try {
      await deleteCourse(course.id);
      setCourseRows((prev) => prev.filter((currentCourse) => currentCourse.id !== course.id));
      toast.success("Course successfully deleted!");
    } catch {
      toast.error("Error deleting course.");
    }
  };

  const resetFormData = () => {
    setFormData(blankCourseForm());
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        title: formData.title,
        enrolling: formData.enrolling,
        auto_enroll: formData.auto_enroll,
        language: formData.language,
        modules: formData.modules.map((module) => module.uid),
        instructors: formData.instructors,
        roster: formData.roster,
      };

      if (isEditing) {
        const updatedCourse = await patchCourse(payload, formData.id);
        setCourseRows((prev) =>
          prev.map((course) =>
            course.id === formData.id ? (updatedCourse as CourseListItem) : course
          )
        );
        toast.success("Course successfully updated!");
      } else {
        const newCourse = await postCourse(payload);
        setCourseRows((prev) => [...prev, newCourse as CourseListItem]);
        toast.success("Course successfully created!");
      }

      setModalOpen(false);
      setIsEditing(false);
      resetFormData();
    } catch {
      toast.error("Error creating/updating course.");
    }
  };

  const requiredFields = ["title"];
  const isValid = isFormValid(formData, requiredFields);

  const columns: Column<CourseListItem>[] = [
    { header: "Title", accessor: "title" },
    { header: "Modules", accessor: (course) => course.modules.length },
    { header: "Instructors", accessor: (course) => course.instructors.length },
    { header: "Roster", accessor: (course) => course.roster.length },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      <CreateButton
        onClick={() => {
          resetFormData();
          setIsEditing(false);
          setModalOpen(true);
        }}
        title="Create Course"
      />

      <ReusableTable
        columns={columns}
        data={courseRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ReusableModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setIsEditing(false);
          resetFormData();
        }}
        title={isEditing ? "Edit Course" : "Create Course"}
        footerActions={
          <>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              data-testid="submit-button"
              className={`px-4 py-2 rounded-md ${
                isValid ? "bg-blue-500 text-white" : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
            >
              {isEditing ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setModalOpen(false);
                setIsEditing(false);
                resetFormData();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <InputLabel htmlFor="title">Title</InputLabel>
            <TextInput
              id="title"
              name="title"
              value={formData.title}
              placeholder="Enter course title"
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-row gap-4">
            <div className="flex flex-row items-center gap-2">
              <input
                id="enrolling"
                type="checkbox"
                name="enrolling"
                checked={formData.enrolling}
                onChange={(e) => {
                  setFormData((value) => ({
                    ...value,
                    enrolling: e.target.checked,
                    auto_enroll: !e.target.checked ? false : value.auto_enroll,
                  }));
                }}
              />
              <label
                htmlFor="enrolling"
                title="allows user to request being registered for a course"
              >
                Enrolling
              </label>
            </div>
            <div
              className={cn("flex flex-row items-center gap-2", {
                "cursor-not-allowed": !formData.enrolling,
              })}
            >
              <input
                id="auto_enroll"
                type="checkbox"
                name="auto_enroll"
                className={cn({ "cursor-not-allowed": !formData.enrolling })}
                disabled={!formData.enrolling}
                checked={formData.auto_enroll}
                onChange={(e) => handleInputChange("auto_enroll", e.target.checked)}
              />
              <label
                htmlFor="auto_enroll"
                title='allows for any user to be automatically enrolled into the course. "enrolling" must be enabled'
                className={cn({ "cursor-not-allowed": !formData.enrolling })}
              >
                Auto Enroll
              </label>
            </div>
          </div>
          <LanguageSelect
            handleChange={(e) => handleInputChange("language", e.target.value)}
            initialLanguage={formData.language}
          />
          <div data-testid="instructor-select">
            <InputLabel htmlFor="instructors">Instructors</InputLabel>
            <Select
              id="instructors"
              isMulti
              options={userOptions}
              styles={SelectStyles}
              value={userOptions.filter((option) => formData.instructors.includes(option.value))}
              onChange={(selectedOption) => handleSelectChange(selectedOption, "instructors")}
            />
          </div>

          <div data-testid="roster-select">
            <InputLabel htmlFor="roster">Roster</InputLabel>
            <Select
              id="roster"
              isMulti
              options={userOptions}
              styles={SelectStyles}
              value={userOptions.filter((option) => formData.roster.includes(option.value))}
              onChange={(selectedOption) => handleSelectChange(selectedOption, "roster")}
            />
          </div>

          <div data-testid="module-select" className="border-t pt-2 space-y-2">
            <InputLabel htmlFor="module-search">Modules</InputLabel>
            <ModuleSearch
              options={moduleOptions}
              selectedModules={formData.modules}
              onAdd={(module) => {
                setFormData((prev) => ({
                  ...prev,
                  modules: [...prev.modules, module],
                }));
              }}
            />
            <SortableModuleList
              modules={formData.modules}
              onSwap={(fromIndex, toIndex) => {
                setFormData((prev) => ({
                  ...prev,
                  modules: arrayMove(prev.modules, fromIndex, toIndex),
                }));
              }}
              onRemove={(uid) => {
                setFormData((prev) => ({
                  ...prev,
                  modules: prev.modules.filter((module) => module.uid !== uid),
                }));
              }}
            />
          </div>
        </div>
      </ReusableModal>
    </div>
  );
}

interface ModuleSearchProps {
  options: SelectedTag[];
  selectedModules: CourseModuleFormItem[];
  onAdd: (module: CourseModuleFormItem) => void;
}

function ModuleSearch({ options, selectedModules, onAdd }: ModuleSearchProps) {
  const availableOptions = useMemo(() => {
    return options.filter((option) => !selectedModules.find((module) => module.uid === option.value));
  }, [options, selectedModules]);

  return (
    <Select
      id="module-search"
      placeholder={availableOptions.length === 0 ? "No more modules available" : "Search Modules"}
      styles={SelectStyles}
      options={availableOptions}
      value={null}
      onChange={(value: SingleValue<SelectedTag>) => {
        if (value != null) {
          onAdd({ uid: value.value, topic: value.label });
        }
      }}
      isDisabled={availableOptions.length === 0}
    />
  );
}

interface SortableModuleListProps {
  modules: CourseModuleFormItem[];
  onSwap: (fromIndex: number, toIndex: number) => void;
  onRemove: (uid: number) => void;
}

function SortableModuleList({ modules, onSwap, onRemove }: SortableModuleListProps) {
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
        <SortableContext items={modules.map((module) => module.uid)} strategy={verticalListSortingStrategy}>
          {modules.map((module, index) => (
            <SortableModuleItem
              key={module.uid}
              module={module}
              index={index}
              onRemove={() => onRemove(module.uid)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableModuleItemProps {
  module: CourseModuleFormItem;
  index: number;
  onRemove: () => void;
}

function SortableModuleItem({ module, index, onRemove }: SortableModuleItemProps) {
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
        onClick={onRemove}
        className="rounded-md bg-red-600 p-2 text-white transition-colors hover:bg-red-500"
        aria-label={`Remove module ${module.topic}`}
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
