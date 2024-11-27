// codewit/client/src/components/codeblock/Codeblock.tsx
import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/solid';
const CodeEditor = ({onSubmit}: { onSubmit: (code: string) => Promise<void>;}): JSX.Element => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // Create the editor instance
      const editor = monaco.editor.create(editorRef.current, {
        value: '// Write your code here',
        language: 'cpp',
        theme: 'hc-black',
        fontFamily: 'font-copy',
      });
      editorInstanceRef.current = editor;

      // Resize function
      const resizeEditor = () => {
        editor.layout();
      };

      // Create a ResizeObserver to observe the editor container
      const resizeObserver = new ResizeObserver(resizeEditor);
      resizeObserver.observe(editorRef.current);

      // Cleanup
      return () => {
        resizeObserver.disconnect();
        editorInstanceRef.current = null;
        editor.dispose();
        monaco.editor.getModels().forEach(model => model.dispose());
      };
    }
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div 
        ref={editorRef} 
        className="w-full pt-1 h-96 rounded-lg border-2 border-gray-700 focus-within:border-accent-400 overflow-hidden transition-colors duration-200"
      ></div>
      <div className="inline-flex gap-1 pt-1">
        <button className="group px-2 py-1 text-md font-medium text-center flex items-center justify-center border-2 border-red-400 hover:bg-red-400 rounded-lg focus:outline-none w-1/3">
          <ArrowPathIcon className="w-6 h-6 mr-2 text-red-400 group-hover:text-white" />
          <span className="text-red-400 group-hover:text-white">Reset</span>
        </button>
  
        <button 
          className="group px-2 py-1 text-md font-medium text-center flex items-center justify-center border-2 border-accent-400 hover:bg-accent-400 rounded-lg focus:outline-none w-2/3"
          onClick={() => onSubmit(editorInstanceRef.current?.getValue() || '')}
        >
          <CheckIcon className="w-6 h-6 mr-2 text-accent-400 group-hover:text-white" />
          <span className="text-accent-400 group-hover:text-white">Submit</span>
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;