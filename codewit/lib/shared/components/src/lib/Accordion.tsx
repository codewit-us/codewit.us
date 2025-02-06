import React, { useState } from 'react';

interface AccordionProps {
  modules: Array<{
    moduleHeader: React.ReactNode;
    moduleContent: React.ReactNode;
  }>;
  className?: string;
}

export const Accordion = ({ modules, className = '' }: AccordionProps) => {
  const [openIndex, setOpenIndex] = useState<string>('0');

  return (
    <div className={`space-y-2 ${className}`}>
      {modules.map((module, index) => (
        <div
          key={index}
          className="collapse collapse-arrow bg-foreground-500"
          onClick={() => setOpenIndex(index.toString())}
        >
          <input
            type="radio"
            name="demo"
            checked={openIndex === index.toString()}
            onChange={() => setOpenIndex(index.toString())}
          />
          <div className="collapse-title text-xl font-medium">
            {module.moduleHeader}
          </div>
          <div className="collapse-content">{module.moduleContent}</div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
