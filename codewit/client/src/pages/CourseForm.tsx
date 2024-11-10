import React, { useState, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import ReusableModal from "../components/ReusableModal";
import Select, { MultiValue } from "react-select";
import LanguageSelect from "../components/form/LanguageSelect";
import CreateButton from "../components/CreateButton";
import InputLabel from "../components/form/InputLabel";
import TextInput from "../components/form/TextInput";
import { SelectStyles } from "../utils/styles";
import { SelectedTag, Course } from "@codewit/interfaces";
import {
  useFetchCourses,
  usePostCourse,
  usePatchCourse,
  useDeleteCourse,
} from "../hooks/useCourse";
import { useFetchModules } from "../hooks/useModule";
import { useFetchUsers } from "../hooks/useUsers";

const CourseForm = (): JSX.Element => {
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
    language: "cpp",
    modules: [],
    instructors: [],
    roster: [],
  });

  const [moduleOptions, setModuleOptions] = useState<SelectedTag[]>([]);
  const [userOptions, setUserOptions] = useState<SelectedTag[]>([]);

  useEffect(() => {
    // Map modules and users into the format expected by react-select
    setModuleOptions(
      modules.map((module: any) => ({
        value: module.uid,
        label: module.title || module.uid,
      }))
    );

    setUserOptions(
      users.map((user: any) => ({
        value: user.uid,
        label: user.username,
      }))
    );
  }, [modules, users]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption: MultiValue<SelectedTag>, name: string) => {
    const selectedValues = selectedOption ? selectedOption.map((option) => option.value) : [];
    setFormData((prev) => ({ ...prev, [name]: selectedValues }));
  };

  const handleEdit = (course: any) => {
    setFormData({
      id: course.id,
      title: course.title,
      language: course.language.name || course.language,
      modules: course.modules.map((module: any) => module.uid),
      instructors: course.instructors.map((instr: any) => instr.uid),
      roster: course.roster.map((student: any) => student.uid),
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDelete = async (course: Course) => {
    try {
      if (course.id !== undefined) {
        await deleteCourse(course.id);
      } else {
        console.error("Course ID is undefined");
      }
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        const updatedCourse = await patchCourse(formData, formData.id as number);
        setCourses((prev) => prev.map((course) => (course.id === formData.id ? updatedCourse : course)));
      } else {
        const newCourse = await postCourse(formData);
        setCourses((prev) => [...prev, newCourse]);
      }
      setModalOpen(false);
      setIsEditing(false);
      setFormData({
        id: "",
        title: "",
        language: "cpp",
        modules: [],
        instructors: [],
        roster: [],
      });
    } catch (err) {
      console.error("Error creating/updating course:", err);
    }
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Modules", accessor: "modules.length" },
    { header: "Instructors", accessor: "instructors.length" },
    { header: "Roster", accessor: "roster.length" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-6">

      {/* Button Section */}
      <CreateButton 
        onClick={() => setModalOpen(true)} 
        title="Create Course" 
      />

      {/* Table Section */}
      <ReusableTable
        columns={columns}
        data={courses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal Section */}
      <ReusableModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setIsEditing(false);
        }}
        title={isEditing ? "Edit Course" : "Create Course"}
        footerActions={
          <>
            <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md">
              {isEditing ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setModalOpen(false);
                setIsEditing(false);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </>
        }
      >
        {/* Form Fields */}
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

          <LanguageSelect
            handleChange={(e) => handleInputChange("language", e.target.value)}
            initialLanguage={formData.language}
          />

          <div>
            <InputLabel htmlFor="modules">Modules</InputLabel>
            <Select
              id="modules"
              isMulti
              options={moduleOptions}
              styles={SelectStyles}
              value={moduleOptions.filter((option) => formData.modules.includes(option.value))}
              onChange={(selectedOption) => handleSelectChange(selectedOption, "modules")}
            />
          </div>

          <div>
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

          <div>
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
        </div>
      </ReusableModal>
    </div>
  );
};

export default CourseForm;
