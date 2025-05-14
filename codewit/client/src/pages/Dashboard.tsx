import {
    DocumentDuplicateIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import bulbLit from '/bulb(lit).svg';
import { useEffect } from 'react';
// import bulbUnlit from '/bulb(unlit).svg';

interface DashboardProps {
    courseTitle: string;
}

const MockTopics = [
    "Variables", 
    "Objects", 
    "Decisions", 
    "Boolean Expression", 
    "While Loops",
    "For Loops", 
    "Arrays", 
    "ArrayLists", 
    "2D Arrays", 
    "Inheritance",
    "Modularity", 
    "Recursion"
];

const MockStudents = [
    { name: "Alexandria Virginia", completed: 6 },
    { name: "Bella Sophia", completed: 3 },
    { name: "Cletus Spuckler", completed: 2 },
    { name: "Duffman", completed: 5 },
    { name: "Edna Krabappel", completed: 6 },
    { name: "Fat Tony", completed: 9 },
    { name: "Groundskeeper Willie", completed: 3 },
    { name: "Homer Simpson", completed: 0 },
    { name: "Itchy", completed: 4 },
    { name: "Jimbo Jones", completed: 1 },
    { name: "Krusty The Clown", completed: 2 },
    { name: "Lisa Simpson", completed: 8 },
    { name: "Marge Simpson", completed: 3 },
    { name: "Nelson Muntz", completed: 0 },
    { name: "Otto Mann", completed: 1 },
    { name: "Patty Bouvier", completed: 0 },
    { name: "Queen Reina", completed: 0 },
    { name: "Ralph Wiggum", completed: 2 },
    { name: "Snake Jailbird", completed: 12 },
    { name: "Troy McClure", completed: 12 },
];

const Dashboard = ({ courseTitle }: DashboardProps): JSX.Element => {

    useEffect(() => {

        const userId = localStorage.getItem('userId');

        const fetchData = async () => {
            try {
                const response = await axios.get(`/courses/teacher/${userId}`);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        
        fetchData();

    }, []);

    return (
            // class link section
            <div className="h-container-full overflow-auto flex flex-col w-full bg-black items-center gap-2">
                <div
                    className="bg-foreground-600 w-3/4 mt-4 rounded-md p-4"
                >
                <span className="text-[16px] font-bold text-foreground-200">
                    {courseTitle ? courseTitle + ' - ' : ''}
                    Teacher Dashboard
                </span>
                <div className="mt-4 flex items-center gap-2">
                    <p className = "text-foreground-200 text-sm">
                        Class Link
                    </p>
                    <input
                        className="p-1 bg-background-500 text-foreground-200 w-1/3 border border-accent-500 text-white rounded-sm"
                        type="text"
                        placeholder="https://codewit.us/class/ap-comp-sci"
                    />
                    <button 
                        className="flex rounded-lg p-1 items-center gap-2 border border-accent-500 font-bold text-accent-500 hover:bg-accent-600/20 rounded-md"
                    >
                        <DocumentDuplicateIcon className="h-6 w-6 text-accent-500" />
                        Copy
                    </button>
                </div>
            </div>

            <div
                className="bg-foreground-600 w-3/4 rounded-md p-4 mb-10"
            >

                <h1 className="font-bold text-foreground-200 pb-10 text-[16px]"> 
                    Progress 
                </h1>

                <div className="overflow-x-auto">
                    <div className="flex flex-col">
                        <div className="flex">
                            <div className="min-w-[200px] sticky left-0 bg-foreground-600 z-10">
                                <span className="font-bold text-foreground-200 text-[16px]">
                                    Name
                                </span>
                            </div>
                            <div className="flex pl-14 mb-4">
                                {MockTopics.map((topic, index) => (
                                    <div key={index}>
                                        <div 
                                            className="w-[100px] flex justify-center"
                                            data-tooltip-target={`tooltip-${index}`}
                                        >
                                            <span className="font-bold text-foreground-200 text-[14px]">
                                                {topic.length > 10 
                                                    ? `${topic.slice(0, 10)}...`
                                                    : topic
                                                }
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-4 relative"> 
                            {MockStudents.map((student, studentIndex) => {
                                const progressPercent = Math.round((student.completed / MockTopics.length) * 100);
                                return (
                                    <div key={studentIndex} className="flex items-center hover:bg-foreground-500/20">
                                        <span className="text-foreground-200 text-[16px] min-w-[200px] sticky left-0 bg-foreground-600 z-10">
                                            {student.name}
                                        </span>
                                        <div className="relative flex items-center">
                                            <div 
                                                className="h-2 bg-alternate-background-500 rounded-full"
                                                style={{ width: `${MockTopics.length * 100}px` }}
                                            ></div>
                                            <div 
                                                className="absolute h-2 bg-accent-500 rounded-full" 
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                            <div 
                                                className="absolute flex items-center "
                                                style={{ left: `${progressPercent}%`, transform: 'translateX(-14%)' }}
                                            >
                                                {student.completed > 0 && (
                                                    <img
                                                        src={bulbLit}
                                                        className="size-6 relative z-10"
                                                        alt="bulb lit"
                                                    />
                                                )}
                                                <span className="text-accent-500 text-sm font-medium ml-2 relative">
                                                    {progressPercent}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
