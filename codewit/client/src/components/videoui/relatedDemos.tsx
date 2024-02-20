const RelatedDemos = (): JSX.Element => (
  <details className="p-2 font-bold rounded-lg w-full text-white flex flex-col border border-gray-800 overflow-hidden">
    <summary className = "cursor-pointer">Related Demos</summary>
    <a href="#" className = "inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-700 hover:cursor-pointer">
    <div className="bg-background-400 p-3 rounded-sm">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fill = "#fff" d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
      </svg>
    </div>
      Title of Other Video
    </a>
    <a href="#" className = "inline-flex justify-left items-center pl-2 pt-2 gap-2 hover:text-purple-700 hover:cursor-pointer">
    <div className="bg-background-400 p-3 rounded-sm">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fill = "#fff" d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
      </svg>
    </div>
      Title of Other Video
    </a>
  </details>
);

export default RelatedDemos;