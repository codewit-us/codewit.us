import React from 'react';

interface InputLabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

const InputLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }): JSX.Element => {
  return (
    <label 
      htmlFor={htmlFor} 
      className="block text-sm font-medium text-gray-400"
    >
      {children}
    </label>
  );
};

export default InputLabel;
