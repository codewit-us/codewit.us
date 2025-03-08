import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/solid';

const CodeEditor = ({
  onSubmit,
}: {
  onSubmit: (code: string) => Promise<void>;
}): JSX.Element => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );

  useEffect(() => {
    if (editorRef.current) {
      const editor = monaco.editor.create(editorRef.current, {
        value: '',
        language: 'cpp',
        theme: 'hc-black',
        fontFamily: 'font-copy',
      });
      editorInstanceRef.current = editor;

      const resizeEditor = () => {
        editor.layout();
      };

      const resizeObserver = new ResizeObserver(resizeEditor);
      resizeObserver.observe(editorRef.current);

      return () => {
        resizeObserver.disconnect();
        editorInstanceRef.current = null;
        editor.dispose();
        monaco.editor.getModels().forEach((model) => model.dispose());
      };
    }
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 flex flex-col min-h-0">
        {/* code editor */}
        <div
          ref={editorRef}
          className="w-full flex-1 rounded-lg border-2 border-gray-800 focus-within:border-accent-400 overflow-hidden transition-colors duration-200"
        ></div>

        {/* submit and reset buttons */}
        <div className="inline-flex gap-1 pt-2 pb-3">
          <button
            className="group px-2 py-1 text-md font-medium text-center flex items-center justify-center border-2 border-red-400 hover:bg-red-400 rounded-lg focus:outline-none w-1/3"
            // onClick={() => {
            //   if (editorInstanceRef.current) {
            //     editorInstanceRef.current.setValue('');
            //   }
            // }}
          >
            <ArrowPathIcon className="w-6 h-6 mr-2 text-red-400 group-hover:text-white" />
            <span className="text-red-400 group-hover:text-white">Reset</span>
          </button>

          <button
            className="group px-2 py-1 text-md font-medium text-center flex items-center justify-center border-2 border-accent-400 hover:bg-accent-400 rounded-lg focus:outline-none w-2/3"
            onClick={() =>
              onSubmit(editorInstanceRef.current?.getValue() || '')
            }
          >
            <CheckIcon className="w-6 h-6 mr-2 text-accent-400 group-hover:text-white" />
            <span className="text-accent-400 group-hover:text-white">
              Submit
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
