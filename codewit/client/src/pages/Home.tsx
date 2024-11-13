// codewit/client/src/pages/Home.tsx
import { useFetchStudentCourses } from '../hooks/useCourse';
import Error from '../components/error/Error';
import Loading from '../components/loading/LoadingPage';
import { useState } from 'react';
import { Demo } from '@codewit/interfaces';
import { PlayIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/solid";


// Test Data
const courseData = [
  {
    "id": "fundamentals",  
    "title": "Programming Fundamentals", 
    "language": {
      "uid": 1,
      "name": "JavaScript" 
    },
    "modules": [
      {
        "uid": 1,
        "title": "Variables",
        "CourseModules": {
          "ordering": 1
        },
        "demo": [
          {
            "uid": 1,
            "title": "Declaring objects - other demo",
            "youtube_id": "xyz123",  
            "youtube_thumbnail": "thumbnail_url_1", 
            "topic": "Variables"
          },
          {
            "uid": 2,
            "title": "Declaring objects - another demo",
            "youtube_id": "xyz123",  
            "youtube_thumbnail": "thumbnail_url_1", 
            "topic": "Variables"
          }
        ]
      },
      {
        "uid": 2,
        "title": "Objects",
        "CourseModules": {
          "ordering": 2
        },
        "demo": {
          "uid": 2,
          "title": "Declaring objects - another demo",
          "youtube_id": "abc456",
          "youtube_thumbnail": "thumbnail_url_2",
          "topic": "Objects"
        }
      },
      {
        "uid": 3,
        "title": "Decisions",
        "CourseModules": {
          "ordering": 3
        },
        "demo": {
          "uid": 3,
          "title": "Declaring objects - yet another demo",
          "youtube_id": "def789",
          "youtube_thumbnail": "thumbnail_url_3",
          "topic": "Decisions"
        }
      },
      {
        "uid": 4,
        "title": "Boolean Logic",
        "CourseModules": {
          "ordering": 4
        },
        "demo": {
          "uid": 4,
          "title": "Boolean Logic Demo",
          "youtube_id": "ghi101",
          "youtube_thumbnail": "thumbnail_url_4",
          "topic": "Boolean Logic"
        }
      },
      {
        "uid": 5,
        "title": "While Loops",
        "CourseModules": {
          "ordering": 5
        },
        "demo": {
          "uid": 5,
          "title": "While Loops Demo",
          "youtube_id": "jkl112",
          "youtube_thumbnail": "thumbnail_url_5",
          "topic": "While Loops"
        }
      },
      {
        "uid": 6,
        "title": "For Loops",
        "CourseModules": {
          "ordering": 6
        },
        "demo": {
          "uid": 6,
          "title": "For Loops Demo",
          "youtube_id": "mno131",
          "youtube_thumbnail": "thumbnail_url_6",
          "topic": "For Loops"
        }
      },
      {
        "uid": 7,
        "title": "Arrays",
        "CourseModules": {
          "ordering": 7
        },
        "demo": {
          "uid": 7,
          "title": "Arrays Demo",
          "youtube_id": "pqr415",
          "youtube_thumbnail": "thumbnail_url_7",
          "topic": "Arrays"
        }
      },
      {
        "uid": 8,
        "title": "ArrayLists",
        "CourseModules": {
          "ordering": 8
        },
        "demo": {
          "uid": 8,
          "title": "ArrayLists Demo",
          "youtube_id": "stu161",
          "youtube_thumbnail": "thumbnail_url_8",
          "topic": "ArrayLists"
        }
      },
      {
        "uid": 9,
        "title": "2D Arrays",
        "CourseModules": {
          "ordering": 9
        },
        "demo": {
          "uid": 9,
          "title": "2D Arrays Demo",
          "youtube_id": "vwx718",
          "youtube_thumbnail": "thumbnail_url_9",
          "topic": "2D Arrays"
        }
      },
      {
        "uid": 10,
        "title": "Inheritance",
        "CourseModules": {
          "ordering": 10
        },
        "demo": {
          "uid": 10,
          "title": "Inheritance Demo",
          "youtube_id": "yza192",
          "youtube_thumbnail": "thumbnail_url_10",
          "topic": "Inheritance"
        }
      },
      {
        "uid": 11,
        "title": "Recursion",
        "CourseModules": {
          "ordering": 11
        },
        "demo": {
          "uid": 11,
          "title": "Recursion Demo",
          "youtube_id": "bcd202",
          "youtube_thumbnail": "thumbnail_url_11",
          "topic": "Recursion"
        }
      }
    ],
    "instructors": [
      {
        "uid": 1,
        "username": "instructor1",
        "email": "instructor@example.com",
        "googleId": "google123",
        "isAdmin": true
      }
    ],
    "roster": [
      {
        "uid": 2,
        "username": "student1",
        "email": "student@example.com",
        "googleId": "studentId",
        "isAdmin": false
      }
    ]
  }
];

const TutorialCard = ({ demo }: { demo: Demo }) => (
  <div className="relative overflow-hidden w-48"> {/* Added w-48 to match inner div */}
    <div className="relative h-32"> {/* Removed w-48 from here since it's on parent */}
      <img 
        src={demo.youtube_thumbnail}
        alt={demo.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center group hover:bg-opacity-30 transition-all">
       <a 
          href={`https://www.youtube.com/watch?v=${demo.youtube_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl text-white opacity-70 group-hover:opacity-100 transition-opacity">
            <PlayIcon className="h-8 w-8 text-white" />
        </a>
      </div>
    </div>

    <div className="p-1">
      <h3 className="font-medium text-sm mb-1 text-white">
        {demo.title}
      </h3>
    </div>
  </div>
);

const Home = (): JSX.Element => {
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const { loading, error } = useFetchStudentCourses();

  if (loading) return <Loading />;
  if (error) return <Error message="Failed to fetch courses. Please try again later." />;

  const course = courseData[0];

  return (
    <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
      <div className="max-w-7xl mx-auto px-10 py-4">
       
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-zinc-400">Language: {course.language.name}</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-white mb-4">Course Modules:</h2>
          
          {course.modules.map((module) => (
           <div key={module.uid} className="bg-foreground-500 overflow-hidden rounded-md font-bold">
              <button
                className="w-full px-10 py-4 flex items-center justify-between hover:bg-foreground-600"
                onClick={() => setExpandedModule(
                  expandedModule === module.uid ? null : module.uid
                )}
              >
                <span className="text-white text-left">{module.title}</span>
                <div>
                  {expandedModule === module.uid ? 
                    <ChevronDownIcon className="h-4 w-4 text-white" /> : 
                    <ChevronRightIcon className="h-4 w-4 text-white" />
                  }
                </div>
              </button>

              {expandedModule === module.uid && (
                <div className="border-t border-zinc-700 px-10 py-2">
                    <p className="font-bold text-white">Choose a Lesson: </p>
                    <div className="flex justify-start space-x-10 py-2">
                    {Array.isArray(module.demo) ? (
                      module.demo.map((demo) => (
                        <TutorialCard key={demo.uid} demo={demo} />
                      ))
                    ) : (
                      <TutorialCard demo={module.demo} />
                    )}
                    </div>
                </div>
              )}
            </div>
            
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;