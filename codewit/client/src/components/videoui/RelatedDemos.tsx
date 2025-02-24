import { VideoCameraIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';

const RelatedDemos = (): JSX.Element => {
  const placeholderDemos = [
    {
      youtube_thumbnail: 'https://placehold.co/600x400/png',
      title: 'Introduction to Arrays',
      uid: '1',
    },
    {
      youtube_thumbnail: 'https://placehold.co/600x400/png',
      title: 'Array Methods',
      uid: '2',
    },
    // {
    //   youtube_thumbnail: 'https://placehold.co/600x400/png',
    //   title: 'Array Methods',
    //   uid: '3',
    // },
    // {
    //   youtube_thumbnail: 'https://placehold.co/600x400/png',
    //   title: 'Array Methods',
    //   uid: '4',
    // }
  ];

  return (
    <details className="font-bold w-full text-white flex-col overflow-hidden group">
      <summary className="px-2 py-1 cursor-pointer list-none flex items-center gap-2 hover:bg-accent-500/20 transition-all rounded-lg">
        <ChevronRightIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-90" />
        Related Demos
      </summary>
      <div className="flex gap-4 px-8 py-1">
        {placeholderDemos.map((demo, index) => (
          <div key={index} className="relative h-28">
            <img
              src={demo.youtube_thumbnail}
              alt={demo.title}
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black bg-opacity-80 flex rounded-xl items-center justify-center group hover:bg-opacity-30 transition-all">
              <a
                href={'/read/' + demo.uid}
                rel="noopener noreferrer"
                className="text-2xl text-white opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <PlayIcon className="h-6 w-6 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-60 ">
              <h3 className="text-sm text-white truncate">{demo.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
};

export default RelatedDemos;
