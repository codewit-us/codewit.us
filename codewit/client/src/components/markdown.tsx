import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../utils/styles";
import { Prism as SyntaxHighligher } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const lang_regex = /language-(\w+)/;

interface DefaultMarkdownProps {
  text: string
}

export function DefaultMarkdown({text}: DefaultMarkdownProps) {
  return <Markdown
    components={{
      h1: ({className, node, ...props}) => {
        return <h1 className="text-5xl font-extrabold dark:text-white" {...props}/>
      },
      h2: ({className, node, ...props}) => {
        return <h2 className="text-4xl font-bold dark:text-white" {...props}/>;
      },
      h3: ({className, node, ...props}) => {
        return <h3 className="text-3xl font-bold dark:text-white" {...props}/>;
      },
      h4: ({className, node, ...props}) => {
        return <h4 className="text-2xl font-bold dark:text-white" {...props}/>;
      },
      h5: ({className, node, ...props}) => {
        return <h5 className="text-xl font-bold dark:text-white" {...props}/>;
      },
      p: ({className, node, ...props}) => {
        let display_inline = false;

        if (node?.type === "element") {
          if (node.properties["in_list"]) {
            display_inline = true;
          }
        }

        return <p className={cn("text-gray-500 dark:text-gray-400", {"inline-block": display_inline})} {...props}/>;
      },
      blockquote: ({className, node, ...props}) => {
        return <blockquote className="text-xl italic font-semibold px-4 [&>p]:py-1 border-s-4 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800 text-gray-900 dark:text-white" {...props}/>;
      },
      ul: ({className, node, ...props}) => {
        let include_list = true;

        if (className === "contains-task-list") {
          include_list = false;
        }

        return <ul className={cn("max-w-md space-y-1 text-gray-500 dark:text-gray-400", {" list-disc list-inside": include_list})} {...props}/>;
      },
      ol: ({className, node, ...props}) => {
        return <ol className="max-w-md -space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400" {...props}/>;
      },
      li: ({className, node, ...props}) => {
        for (let child of node?.children ?? []) {
          if (child.type === "element" && child.tagName === "p") {
            child.properties["in_list"] = true;
          }
        }

        return <li className="" {...props}/>;
      },
      pre: ({className, node, ...props}) => {
        return <pre className="w-full overflow-x-auto rounded-lg p-1 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800" {...props}/>;
      },
      code: ({className, node, children, ...props}) => {
        let match = lang_regex.exec(className ?? "");

        if (match) {
          return <SyntaxHighligher
            language={match[1]}
            PreTag="div"
            style={atomDark}
            showLineNumbers
            customStyle={{
              margin: "none",
              padding: "none",
              background: "none",
              overflow: "none"
            }}
            children={children}
          />;
        } else {
          return <code className="px-1 rounded-lg bg-gray-50 dark:bg-gray-800" children={children} {...props}/>;
        }
      },
      table: ({className, node, ...props}) => {
        return <table className="text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400" {...props}/>;
      },
      thead: ({className, node, ...props}) => {
        for (let child of node?.children ?? []) {
          if (child.type === "element" && child.tagName === "tr") {
            child.properties["in_header"] = true;
          }
        }

        return <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" {...props}/>;
      },
      th: ({className, node, ...props}) => {
        return <th scope="col" className="px-6 py-3" {...props}/>;
      },
      tr: ({className, node, ...props}) => {
        let in_header = false;

        if (node?.type === "element") {
          if (node.properties["in_header"]) {
            in_header = true;
          }
        }

        if (in_header) {
          return <tr {...props}/>;
        } else {
          return <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200" {...props}/>
        }
      },
      td: ({className, node, ...props}) => {
        return <td className="px-6 py-4" {...props}/>;
      },
      hr: ({className, node, ...props}) => {
        return <hr className="h-px !my-8 bg-gray-200 border-0 dark:bg-gray-700" {...props}/>
      }
    }}
    remarkPlugins={[remarkGfm]}
    children={text}
  />
}