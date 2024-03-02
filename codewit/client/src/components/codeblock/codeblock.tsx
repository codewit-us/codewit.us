import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clipRule="evenodd" />
            </svg>
            Reset
          </button>
          <button className="inline-flex justify-center align-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold w-2/3 py-2 px-4 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
            </svg>
            Submit
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
