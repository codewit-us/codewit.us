import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/solid';

const CodeEditor = ({
  onSubmit, 
  isSubmitting
}: {
  onSubmit: (code: string) => Promise<void>;
  isSubmitting: boolean;
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
          data-testid="code-editor"
          className="w-full flex-1 rounded-lg border-2 border-gray-800 focus-within:border-accent-500 overflow-hidden transition-colors duration-200"
        ></div>

        {/* submit and reset buttons */}
        <div className="inline-flex gap-1 pt-2 pb-3">
          <button
            className="group px-2 py-1 text-md font-medium text-center flex items-center justify-center border-2 border-accent-500 rounded-lg focus:outline-none w-1/3"
            onClick={() => {
              if (editorInstanceRef.current) {
                editorInstanceRef.current.setValue('');
              }
            }}
          >
            <ArrowPathIcon className="w-6 h-6 mr-2 text-accent-500 group-hover:text-accent-600" />
            <span data-testid="reset-button" className="text-accent-500 group-hover:text-accent-600">Reset</span>
          </button>

          <button
              className={`group px-2 py-1 text-md font-medium text-center flex items-center justify-center border-2 rounded-lg focus:outline-none w-2/3 ${
                isSubmitting ? 'bg-alternate-background-500 border-foreground-400 hover:bg-alternate-background-500/90' : 'border-accent-500'
              }`}
              disabled={isSubmitting}
              onClick={() =>
              onSubmit(editorInstanceRef.current?.getValue() || '')
            }
          > 
          <div className ="flex justify-center items-center gap-1">
          { isSubmitting 
            ? 
            <>
                <img 
                  className="h-[24px] w-[24px]"
                  src ="/processing-cog.svg" 
                  alt = "cog loader svg for submission" 
                />
                <span 
                  data-testid="submit-button-checking" 
                  className="text-accent-500 font-bold"
                > 
                  Checking...
                </span>
              </>
            :
            <>
              <CheckIcon className="w-6 h-6 text-accent-500 group-hover:text-accent-600" />
              <span data-testid="submit-button" className="text-accent-500 group-hover:text-accent-600">
                Submit
              </span> 
            </>
          }
          </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
