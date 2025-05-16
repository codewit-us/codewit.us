import { ChevronRightIcon, PlayIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface DemoItem {
  youtube_thumbnail: string;
  title: string;
  uid: string;
  description?: string;
}

const RelatedDemos = (): JSX.Element => {
  const placeholderDemos: DemoItem[] = [
    {
      youtube_thumbnail: 'https://placehold.co/600x400/png',
      title: 'Introduction to Arrays',
      uid: '1',
      description: 'Learn the basics of Java arrays',
    },
    {
      youtube_thumbnail: 'https://placehold.co/600x400/png',
      title: 'Array Methods',
      uid: '2',
      description: 'Common methods for array manipulation',
    },
    {
      youtube_thumbnail: 'https://placehold.co/600x400/png',
      title: 'Array Sorting Algorithms',
      uid: '3',
      description: 'Efficient ways to sort arrays in Java',
    },
    {
      youtube_thumbnail: 'https://placehold.co/600x400/png',
      title: 'Multidimensional Arrays',
      uid: '4',
      description: 'Working with 2D and 3D arrays',
    },
  ];

  return (
    <details data-testid="related-demos" className="font-bold rounded-lg w-full text-white flex flex-col overflow-hidden group mb-4 border border-gray-800">
      <summary className="px-3 py-2 cursor-pointer list-none flex items-center gap-2 hover:bg-accent-500/10 transition-all rounded-lg">
        <ChevronRightIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-90" />
        <span className="text-base">Related Demos</span>
      </summary>
      <div className="px-2 py-3">
        <div className="flex overflow-x-auto gap-3 pb-2">
          {placeholderDemos.map((demo, index) => (
            <a
              key={index}
              href={'/read/' + demo.uid}
              className="flex-shrink-0 w-48 rounded-md overflow-hidden hover:shadow-lg transition-all duration-200 group/link border border-gray-800 hover:border-accent-500/50"
            >
              <div className="relative w-full h-28 overflow-hidden">
                <img
                  src={demo.youtube_thumbnail}
                  alt={demo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover/link:bg-opacity-20 transition-all">
                  <div className="bg-accent-500/60 rounded-full p-2 opacity-80 group-hover/link:opacity-100 group-hover/link:bg-accent-500 transition-all">
                    <PlayIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-2">
                <h3 className="text-sm font-medium text-white group-hover/link:text-accent-400 transition-colors truncate">
                  {demo.title}
                </h3>
                {demo.description && (
                  <p className="text-xs text-gray-400 mt-1 group-hover/link:text-gray-300 transition-colors line-clamp-2">
                    {demo.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </details>
  );
};

export default RelatedDemos;
