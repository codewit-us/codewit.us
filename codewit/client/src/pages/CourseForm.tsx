// codewit/client/src/pages/CourseForm.tsx
import React, { useState, useEffect } from "react";
import ReusableTable from "../components/form/ReusableTable";
import ReusableModal from "../components/form/ReusableModal";
import Select, { MultiValue } from "react-select";
import LanguageSelect from "../components/form/LanguageSelect";
import CreateButton from "../components/form/CreateButton";
import InputLabel from "../components/form/InputLabel";
import TextInput from "../components/form/TextInput";
import { SelectStyles } from "../utils/styles";
import { SelectedTag, Course } from "@codewit/interfaces";
import { toast } from "react-toastify";
import {
  useFetchCourses,
  usePostCourse,
  usePatchCourse,
  useDeleteCourse,
} from "../hooks/useCourse";
import { useFetchModules } from "../hooks/useModule";
import { useFetchUsers } from "../hooks/useUsers";
import { isFormValid } from "../utils/formValidationUtils";
import { cn } from "../utils/styles";

export default function CourseForm() {
  const { data: courses, setData: setCourses } = useFetchCourses();
  const { data: modules } = useFetchModules();
  const { data: users } = useFetchUsers();

  const postCourse = usePostCourse();
  const patchCourse = usePatchCourse();
  const deleteCourse = useDeleteCourse();

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Course>({
    id: "",
    title: "",
    enrolling: false,
    auto_enroll: false,
    language: "cpp",
    modules: [],
    instructors: [],
    roster: [],
  });

  const [moduleOptions, setModuleOptions] = useState<SelectedTag[]>([]);
  const [userOptions, setUserOptions] = useState<SelectedTag[]>([]);

  useEffect(() => {
    setModuleOptions(
      modules.map((module: any) => ({
        value: module.uid,
        label: module.topic || module.uid,
      }))
    );

    // Prepare options for users
    setUserOptions(
      users.map((user: any) => ({
        value: user.uid,
        label: user.username,
      }))
    );
  }, [users, courses]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption: MultiValue<SelectedTag>, name: string) => {
    const selectedValues = selectedOption ? selectedOption.map((option) => option.value) : [];
    setFormData((prev) => ({ ...prev, [name]: selectedValues }));
  };

  const handleEdit = (course: any) => {
    setFormData({
      ...course,
      instructors: course.instructors.map((instructor: any) => instructor.uid), // Only include uid for instructors
      roster: course.roster.map((user: any) => user.uid), // Only include uid for roster
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (course: Course) => {
    try {
      if (course.id !== undefined) {
        await deleteCourse(course.id);
        setCourses((prev) => prev.filter((c) => c.id !== course.id));
        toast.success("Course successfully deleted!");
      }
    } catch (err) {
      toast.error("Error deleting course.");
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        instructors: formData.instructors.map((uid) => ( uid)),
        roster: formData.roster.map((uid) => (uid)),
      };

      if (isEditing) {
        const updatedCourse = await patchCourse(payload, formData.id as unknown as number);
        setCourses((prev) => prev.map((course) => (course.id === formData.id ? updatedCourse : course)));
        toast.success("Course successfully updated!");
      } else {
        const newCourse = await postCourse(payload);
        setCourses((prev) => [...prev, newCourse]);
        toast.success("Course successfully created!");
      }
      setModalOpen(false);
      setIsEditing(false);
      resetFormData();
    } catch (err) {
      toast.error("Error creating/updating course.");
    }
  };

  const resetFormData = () => {
    setFormData({
      id: "",
      title: "",
      enrolling: false,
      auto_enroll: false,
      language: "cpp",
      modules: [],
      instructors: [],
      roster: [],
    });
  };

  const requiredFields = ["title"];
  const isValid = isFormValid(formData, requiredFields);

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Modules", accessor: "modules.length" },
    { header: "Instructors", accessor: "instructors.length" },
    { header: "Roster", accessor: "roster.length" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">
      <CreateButton onClick={() => setModalOpen(true)} title="Create Course" />

      <ReusableTable
        columns={columns}
        data={courses}
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
                onChange={e => {
                  setFormData(v => ({
                    ...v,
                    enrolling: e.target.checked,
                    auto_enroll: !e.target.checked ? false : v.auto_enroll,
                  }));
                }}
              />
              <label
                htmlFor="enrolling"
                title={"allows user to request being registered for a course"}
              >
                Enrolling
              </label>
            </div>
            <div className={cn("flex flex-row items-center gap-2", {"cursor-not-allowed": !formData.enrolling})}>
              <input
                id="auto_enroll"
                type="checkbox"
                name="auto_enroll"
                className={cn({"cursor-not-allowed": !formData.enrolling})}
                disabled={!formData.enrolling}
                checked={formData.auto_enroll}
                onChange={e => handleInputChange("auto_enroll", e.target.checked)}
              />
              <label
                htmlFor="auto_enroll"
                title={"allows for any user to be automatically enrolled into the course. \"enrolling\" must be enabled"}
                className={cn({"cursor-not-allowed": !formData.enrolling})}
              >
                Auto Enroll
              </label>
            </div>
          </div>
          <LanguageSelect
            handleChange={(e) => handleInputChange("language", e.target.value)}
            initialLanguage={formData.language}
          />
          <div data-testid="module-select">
            <InputLabel htmlFor="modules">Modules</InputLabel>
            <Select
              id="modules"
              isMulti
              options={moduleOptions}
              styles={SelectStyles}
              // @ts-ignore
              value={moduleOptions.filter((option) => formData.modules.includes(option.value))}
              onChange={(selectedOption) => handleSelectChange(selectedOption, "modules")}
            />
          </div>

          <div data-testid="instructor-select">
            <InputLabel htmlFor="instructors">Instructors</InputLabel>
            <Select
              id="instructors"
              isMulti
              options={userOptions}
              styles={SelectStyles}
              // @ts-ignore
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
              // @ts-ignore
              value={userOptions.filter((option) => formData.roster.includes(option.value))}
              onChange={(selectedOption) => handleSelectChange(selectedOption, "roster")}
            />
          </div>
        </div>
      </ReusableModal>
    </div>
  );
}
