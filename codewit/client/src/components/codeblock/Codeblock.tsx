import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/solid';
const CodeEditor = (): JSX.Element => {
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
      <div ref={editorRef} className="w-full h-96 border-2 border-alternate-background-500"></div>
      <div className="inline-flex gap-1 pt-1">
        <button className="inline-flex justify-center align-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold w-1/3 py-2 px-4 rounded">
            <ArrowPathIcon className="w-6 h-6" />
            Reset
          </button>
          <button className="inline-flex justify-center align-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold w-2/3 py-2 px-4 rounded">
            <CheckIcon className="w-6 h-6" />
            Submit
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
