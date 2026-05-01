import { ChangeEvent, useState } from 'react';
import { User } from '@codewit/interfaces';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowRightCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Link } from "react-router-dom";

import Loading from '../components/loading/LoadingPage';
import { useAxiosFetch } from "../hooks/fetching";
import { buildGoogleLoginHref } from "../utils/auth";

const TEACHER_ACCOUNT_FORM_URL = 'https://forms.gle/TFJP5Uc746LUs3Vz8';
const SECTION_ICON_SRC = '/bulb(lit).svg';
const COURSE_CARD_CLASS = 'rounded-2xl bg-foreground-500 p-4 text-white';

type SortKey = 'title' | 'newest';
type SortDirection = 'asc' | 'desc';

interface SortState {
  key: SortKey,
  direction: SortDirection,
}

interface InstructorPartial {
  uid: string,
  username: string,
  email: string,
}

interface InstructorCoursePartial {
  id: string,
  title: string,
  language: string,
}

interface StudentCoursePartial {
  id: string,
  title: string,
  language: string,
  instructors: InstructorPartial[],
}

interface OpenEnrollmentCourse {
  id: string,
  title: string,
  language: string,
  createdAt: string | null,
  moduleNames: string[],
  enrollmentCount: number,
  isStudent: boolean,
  isInstructor: boolean,
  isRegistered: boolean,
}

interface Landing {
  student: StudentCoursePartial[],
  instructor: InstructorCoursePartial[],
  openEnrollment: OpenEnrollmentCourse[],
}

interface HomeProps {
  user: User | null,
}

export default function Home({ user }: HomeProps) {
  const { data, loading, error } = useAxiosFetch<Landing>(
    "api/courses/landing",
    {
      student: [],
      instructor: [],
      openEnrollment: [],
    },
  );
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortState, setSortState] = useState<SortState>({
    key: 'title',
    direction: 'asc',
  });

  if (loading) {
    return <Loading />;
  }

  const hasValidLandingData = isLandingResponse(data);

  if (!hasValidLandingData) {
    console.error('Invalid landing response payload:', data);
  }

  const landingData: Landing = hasValidLandingData ? data : {
    student: [],
    instructor: [],
    openEnrollment: [],
  };

  const landingWarning = error
    ? 'Courses are temporarily unavailable because the API is failing right now.'
    : hasValidLandingData
      ? null
      : 'Courses are temporarily unavailable because the landing data was not returned in the expected format.';

  const languageOptions = ['all'];
  for (const course of landingData.openEnrollment) {
    if (!languageOptions.includes(course.language)) {
      languageOptions.push(course.language);
    }
  }
  languageOptions.sort((left, right) => {
    if (left === 'all') {
      return -1;
    }

    if (right === 'all') {
      return 1;
    }

    return formatLanguage(left).localeCompare(formatLanguage(right));
  });

  const filteredOpenEnrollment = landingData.openEnrollment.filter(course => (
    selectedLanguage === 'all' || course.language === selectedLanguage
  ));

  const sortedOpenEnrollment = sortOpenEnrollmentCourses(filteredOpenEnrollment, sortState);

  return <div className="h-full max-w-full overflow-auto bg-zinc-900 text-white">
    <div className={user
      ? "max-w-7xl mx-auto px-10 py-4 space-y-2"
      : "max-w-7xl mx-auto min-h-full px-10 py-4 flex flex-col gap-2"
    }>
      {!user && <GuestLandingHeader />}

      {user && (
        <>
          <HomeSection title="Instructing">
            <InstructorCourseList courses={landingData.instructor} />
          </HomeSection>
          <HomeSection title="Attending">
            <StudentCourseList courses={landingData.student} />
          </HomeSection>
        </>
      )}

      <OpenEnrollmentSection
        variant={user ? 'home' : 'guest'}
        courses={sortedOpenEnrollment}
        allCourses={landingData.openEnrollment}
        user={user}
        selectedLanguage={selectedLanguage}
        sortState={sortState}
        warning={landingWarning}
        onSelectLanguage={(event) => setSelectedLanguage(event.target.value)}
        onSelectSort={(nextKey) => setSortState(current => {
          if (current.key === nextKey) {
            return {
              key: nextKey,
              direction: current.direction === 'asc' ? 'desc' : 'asc',
            };
          }

          return {
            key: nextKey,
            direction: nextKey === 'title' ? 'asc' : 'desc',
          };
        })}
        languages={languageOptions}
      />
    </div>
  </div>;
}

function GuestLandingHeader() {
  return <>
    <section className="rounded-sm bg-alternate-background-500 px-6 py-5 text-center">
      <h1 className="text-[1.5rem] font-bold leading-snug text-accent-500 sm:text-[1.65rem]">
        Learn to code, from <span className="underline decoration-accent-400 decoration-2 underline-offset-4">students&apos;</span> unique perspectives
      </h1>
    </section>
    <section className="rounded-sm bg-alternate-background-500 px-6 py-4">
      <div className="flex items-start gap-3">
        <SectionIcon className="mt-0.5 h-6 w-6 shrink-0" />
        <p className="text-[1.02rem] font-semibold leading-7 text-white">
          Teachers:{' '}
          <a
            href={TEACHER_ACCOUNT_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="text-accent-500 underline underline-offset-4 transition hover:text-accent-300"
          >
            request a free teacher account
          </a>
          <span className="font-normal text-foreground-100"> to manage your own, private class</span>
        </p>
      </div>
    </section>
  </>;
}

function HomeSection({
  title,
  children,
}: {
  title: string,
  children: JSX.Element,
}) {
  return <section className="space-y-2">
    <h2 className="border-b pb-2 text-xl text-foreground-200">
      {title}
    </h2>
    {children}
  </section>;
}

interface OpenEnrollmentSectionProps {
  variant: 'guest' | 'home',
  courses: OpenEnrollmentCourse[],
  allCourses: OpenEnrollmentCourse[],
  user: User | null,
  selectedLanguage: string,
  sortState: SortState,
  warning: string | null,
  onSelectLanguage: (event: ChangeEvent<HTMLSelectElement>) => void,
  onSelectSort: (nextKey: SortKey) => void,
  languages: string[],
}

function OpenEnrollmentSection({
  variant,
  courses,
  allCourses,
  user,
  selectedLanguage,
  sortState,
  warning,
  onSelectLanguage,
  onSelectSort,
  languages,
}: OpenEnrollmentSectionProps) {
  const isGuest = variant === 'guest';

  return <section className={isGuest
    ? "flex flex-1 flex-col gap-2 rounded-sm bg-alternate-background-500 px-4 py-4 pb-6 sm:px-5"
    : "space-y-2"
  }>
    <div className={isGuest ? "" : "border-b pb-2"}>
      <div className="flex items-center gap-3">
        <SectionIcon className="h-6 w-6 shrink-0" />
        <h2 className="text-xl text-foreground-200">
          Join open-enrollment courses
        </h2>
      </div>
    </div>

    {warning && <InlineWarning message={warning} />}

    <div className={isGuest
      ? "flex flex-col gap-3 border-b pb-2 sm:flex-row sm:items-end sm:justify-between"
      : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
    }>
      <div className={isGuest
        ? "flex flex-wrap items-center gap-5 px-1 text-accent-500"
        : "flex flex-wrap items-center gap-5 text-accent-500 sm:order-2"
      }>
        <SortButton
          active={sortState.key === 'title'}
          onClick={() => onSelectSort('title')}
          label="Title"
          icon={
            <>
              {sortState.key === 'title' && sortState.direction === 'desc'
                ? <ArrowUpIcon className="h-4 w-4" />
                : <ArrowDownIcon className="h-4 w-4" />}
              <span className="flex flex-col text-[10px] font-bold leading-[0.55rem]">
                <span>{sortState.key === 'title' && sortState.direction === 'desc' ? 'Z' : 'A'}</span>
                <span>{sortState.key === 'title' && sortState.direction === 'desc' ? 'A' : 'Z'}</span>
              </span>
            </>
          }
        />
        <SortButton
          active={sortState.key === 'newest'}
          onClick={() => onSelectSort('newest')}
          label="Newest"
          icon={sortState.key === 'newest' && sortState.direction === 'asc'
            ? <ArrowUpIcon className="h-4 w-4" />
            : <ArrowDownIcon className="h-4 w-4" />}
        />
      </div>
      <div className={isGuest ? "" : "sm:order-1"}>
        <LanguageFilter
          selectedLanguage={selectedLanguage}
          languages={languages}
          onChange={onSelectLanguage}
        />
      </div>
    </div>

    <div className={isGuest ? "flex-1" : ""}>
      <OpenEnrollmentCourseList
        courses={courses}
        user={user}
        showEmptyState={allCourses.length === 0}
        selectedLanguage={selectedLanguage}
      />
    </div>
  </section>;
}

function SectionIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <img src={SECTION_ICON_SRC} alt="" aria-hidden="true" className={className} />;
}

function SortButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean,
  label: string,
  icon: JSX.Element,
  onClick: () => void,
}) {
  return <button
    type="button"
    onClick={onClick}
    className={[
      "inline-flex items-center gap-1.5 text-sm font-semibold transition",
      active ? "text-accent-300 underline underline-offset-4" : "text-accent-500 hover:text-accent-300",
    ].join(' ')}
  >
    <span>{label}</span>
    {icon}
  </button>;
}

interface LanguageFilterProps {
  selectedLanguage: string,
  languages: string[],
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void,
}

function LanguageFilter({ selectedLanguage, languages, onChange }: LanguageFilterProps) {
  return <label className="relative inline-flex items-center self-start sm:self-auto">
    <span className="sr-only">Filter courses by language</span>
    <select
      value={selectedLanguage}
      onChange={onChange}
      className="min-w-[13rem] appearance-none rounded-md border border-accent-500 bg-foreground-500 px-4 py-2 pr-10 text-sm font-semibold text-accent-500 outline-none transition focus:ring-2 focus:ring-accent-500/30"
    >
      {languages.map(language => (
        <option key={language} value={language}>
          {language === 'all' ? 'All Languages' : formatLanguage(language)}
        </option>
      ))}
    </select>
    <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-accent-300" />
  </label>;
}

interface OpenEnrollmentCourseListProps {
  courses: OpenEnrollmentCourse[],
  user: User | null,
  showEmptyState: boolean,
  selectedLanguage: string,
}

function OpenEnrollmentCourseList({
  courses,
  user,
  showEmptyState,
  selectedLanguage,
}: OpenEnrollmentCourseListProps) {
  if (showEmptyState) {
    return <EmptyMessage message="No open-enrollment courses are available right now." />;
  }

  if (courses.length === 0) {
    return <EmptyMessage message={`No open-enrollment courses match ${formatLanguage(selectedLanguage)}.`} />;
  }

  return <div className="space-y-2">
    {courses.map(course => (
      <OpenEnrollmentCard
        key={course.id}
        course={course}
        user={user}
      />
    ))}
  </div>;
}

function OpenEnrollmentCard({
  course,
  user,
}: {
  course: OpenEnrollmentCourse,
  user: User | null,
}) {
  const action = getOpenEnrollmentAction(course, user);

  return <article className={COURSE_CARD_CLASS}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
      <div className="sm:w-[112px] sm:flex-none">
        <ActionButton action={action} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base leading-6">
          <span className="font-bold text-white">{course.title}</span>
          <span className="text-foreground-100">- {formatLanguage(course.language)}</span>
        </h3>
        <p className="mt-1 text-[0.98rem] leading-6 text-foreground-100">
          {course.moduleNames.length === 0 ? 'No modules added yet.' : course.moduleNames.join(', ')}
        </p>
      </div>
    </div>
  </article>;
}

interface ActionDescriptor {
  label: string,
  href?: string,
  disabled?: boolean,
  external?: boolean,
}

function ActionButton({ action }: { action: ActionDescriptor }) {
  const className = [
    "inline-flex w-full items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-bold transition",
    action.disabled
      ? "cursor-not-allowed border-foreground-300/30 bg-foreground-600 text-foreground-200"
      : "border-accent-500 bg-transparent text-accent-500 hover:bg-accent-500/10",
  ].join(' ');

  const content = <>
    <ArrowRightCircleIcon className="h-5 w-5 shrink-0" />
    <span>{action.label}</span>
  </>;

  if (action.disabled || !action.href) {
    return <span className={className}>{content}</span>;
  }

  if (action.external) {
    return <a href={action.href} className={className}>{content}</a>;
  }

  return <Link to={action.href} className={className}>{content}</Link>;
}

interface StudentCourseListProps {
  courses: StudentCoursePartial[],
}

function StudentCourseList({ courses }: StudentCourseListProps) {
  if (courses.length === 0) {
    return <EmptyMessage message="You are not attending any courses yet." />;
  }

  return <div className="space-y-3">
    {courses.map(course => (
      <article key={course.id} className={COURSE_CARD_CLASS}>
        <h3 className="text-lg font-semibold">
          <Link to={`/${course.id}`}>
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-foreground-100">
          language: {formatLanguage(course.language)}
        </p>
        <p className="mt-1 text-sm text-foreground-100">
          instructors: {formatInstructorNames(course.instructors)}
        </p>
      </article>
    ))}
  </div>;
}

interface InstructorCourseListProps {
  courses: InstructorCoursePartial[],
}

function InstructorCourseList({ courses }: InstructorCourseListProps) {
  if (courses.length === 0) {
    return <EmptyMessage message="You are not instructing any courses yet." />;
  }

  return <div className="space-y-3">
    {courses.map(course => (
      <article key={course.id} className={COURSE_CARD_CLASS}>
        <h3 className="text-lg font-semibold">
          <Link to={`/${course.id}/dashboard`}>
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-foreground-100">
          language: {formatLanguage(course.language)}
        </p>
      </article>
    ))}
  </div>;
}

function EmptyMessage({ message }: { message: string }) {
  return <div className="rounded-2xl bg-foreground-500 px-4 py-4 text-sm text-foreground-100">
    {message}
  </div>;
}

function InlineWarning({ message }: { message: string }) {
  return <div className="rounded-2xl border border-amber-400/40 bg-foreground-500 px-4 py-3 text-sm text-amber-100">
    {message}
  </div>;
}

function sortOpenEnrollmentCourses(
  courses: OpenEnrollmentCourse[],
  sortState: SortState,
): OpenEnrollmentCourse[] {
  const sortedCourses = [...courses];

  if (sortState.key === 'title') {
    sortedCourses.sort((left, right) => {
      const comparison = left.title.localeCompare(right.title);
      return sortState.direction === 'asc' ? comparison : (comparison * -1);
    });
    return sortedCourses;
  }

  sortedCourses.sort((left, right) => {
    const leftDate = left.createdAt == null ? 0 : Date.parse(left.createdAt);
    const rightDate = right.createdAt == null ? 0 : Date.parse(right.createdAt);
    const comparison = rightDate - leftDate;

    if (comparison !== 0) {
      return sortState.direction === 'desc' ? comparison : (comparison * -1);
    }

    return left.title.localeCompare(right.title);
  });

  return sortedCourses;
}

function formatLanguage(language: string): string {
  switch (language) {
    case 'cpp':
      return 'C++';
    case 'java':
      return 'Java';
    case 'python':
      return 'Python';
    case 'all':
      return 'All Languages';
    default:
      return language;
  }
}

function formatInstructorNames(instructors: InstructorPartial[]): string {
  if (instructors.length === 0) {
    return 'No instructors for this course';
  }

  return instructors.map(instructor => instructor.username).join(', ');
}

function getOpenEnrollmentAction(course: OpenEnrollmentCourse, user: User | null): ActionDescriptor {
  if (user == null) {
    return {
      label: 'Join',
      href: buildGoogleLoginHref(`/${course.id}?join=1`),
      external: true,
    };
  }

  if (course.isStudent) {
    return {
      label: 'Open',
      href: `/${course.id}`,
    };
  }

  if (course.isInstructor) {
    return {
      label: 'Dashboard',
      href: `/${course.id}/dashboard`,
    };
  }

  if (course.isRegistered) {
    return {
      label: 'Pending',
      disabled: true,
    };
  }

  return {
    label: 'Join',
    href: `/${course.id}?join=1`,
  };
}

function isLandingResponse(value: unknown): value is Landing {
  if (typeof value !== 'object' || value == null) {
    return false;
  }

  const candidate = value as Partial<Landing>;

  return Array.isArray(candidate.student) &&
    Array.isArray(candidate.instructor) &&
    Array.isArray(candidate.openEnrollment);
}
