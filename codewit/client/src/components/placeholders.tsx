import { ReactNode } from "react";

interface CenterPrompt {
  header: string | ReactNode,
  children?: ReactNode,
}

export function CenterPrompt({header, children}: CenterPrompt) {
  let header_node = typeof header === "string" ?
      <h2 className="text-2xl text-white">{header}</h2> :
      header;

  return <div className="h-container-full max-w-full flex items-center justify-center bg-zinc-900">
    <div className="w-1/2 flex flex-col flex-nowrap items-center bg-foreground-500 rounded-2xl p-4">
      {header_node}
      {children}
    </div>
  </div>;
}
