import {
    DocumentDuplicateIcon
} from '@heroicons/react/24/solid';

interface DashboardProps {
    courseTitle: string;
}

const HorizonScrollBarContent = [
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

const students = [
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
    return (
        <div className="flex flex-col items-center h-screen bg-background-500 gap-2">
            {/* Class Link Box */}
            <div
                className="bg-foreground-600 w-3/4 mt-4 rounded-md p-4"
                style={{
                    boxShadow: '2px 2px 0 #1a1411',
                }}
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
                        className="p-1 bg-background-500 text-foreground-200 w-1/3 border border-accent-500 text-white"
                        type="text"
                        placeholder="https://codewit.us/class/ap-comp-sci"
                    />
                    <button 
                        className="flex rounded-lg p-1 items-center gap-2 border border-accent-500 font-bold text-accent-500 hover:bg-accent-600/20"
                    >
                        <DocumentDuplicateIcon className="h-6 w-6 text-accent-500" />
                        Copy
                    </button>
                </div>
            </div>

            {/* Student Progress Box */}

            <div
                className="bg-foreground-600 w-3/4 rounded-md p-4"
                style={{
                    boxShadow: '2px 2px 0 #1a1411',
                }}
            >
                <h1 className="font-bold text-foreground-200 text-[16px]"> 
                        Progress 
                </h1>
                {/* Scroll Bar */}
                <div className = "mt-6 w-full ">
                    <span
                        className="font-bold text-foreground-200 text-[16px]"
                    > 
                        Name
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
