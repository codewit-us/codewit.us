import {
  LinkIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BeakerIcon,
} from '@heroicons/react/24/solid';
import React from 'react';

interface LinkItem {
  title: string;
  url: string;
  icon: React.ReactNode;
  description?: string;
}

const HelpfulLinks = (): JSX.Element => {
  const links: LinkItem[] = [
    {
      title: 'Java Array Documentation',
      url: '#',
      icon: <DocumentTextIcon className="w-5 h-5 text-accent-500" />,
      description: 'Official Java documentation for arrays',
    },
    {
      title: 'W3 Schools Java',
      url: '#',
      icon: <AcademicCapIcon className="w-5 h-5 text-accent-500" />,
      description: 'Interactive Java tutorials and examples',
    },
    {
      title: 'CodeWorkout Java Array Practice',
      url: '#',
      icon: <BeakerIcon className="w-5 h-5 text-accent-500" />,
      description: 'Practice exercises for Java arrays',
    },
    {
      title: 'Java Array Algorithms',
      url: '#',
      icon: <LinkIcon className="w-5 h-5 text-accent-500" />,
      description: 'Common algorithms using Java arrays',
    },
  ];

  return (
    <details className="font-bold rounded-lg w-full text-white flex flex-col overflow-hidden group mb-4 border border-gray-800">
      <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-accent-500/10 transition-all rounded-lg">
        <ChevronRightIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-90" />
        <span className="text-base">Helpful Links</span>
      </summary>
      <div className="flex flex-col px-2 py-2 space-y-2">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            className="flex items-center p-2 rounded-md hover:bg-gray-800/50 transition-all duration-200 group/link hover:border-accent-500/30"
          >
            <div className="flex-shrink-0 mr-3 bg-accent-900/20 p-2 rounded-md group-hover/link:bg-accent-500/20 transition-all">
              {link.icon}
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-white group-hover/link:text-accent-400 transition-colors">
                {link.title}
              </h3>
              {link.description && (
                <p className="text-xs text-gray-400 mt-0.5 group-hover/link:text-gray-300 transition-colors">
                  {link.description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity">
              <LinkIcon className="w-4 h-4 text-accent-400" />
            </div>
          </a>
        ))}
      </div>
    </details>
  );
};

export default HelpfulLinks;
