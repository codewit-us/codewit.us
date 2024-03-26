import React from 'react';

interface InputLabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

const InputLabel = ({ htmlFor, children }: InputLabelProps):JSX.Element => {
  return (
    <label htmlFor={htmlFor} className="block mb-2 text-sm font-medium text-gray-200">
      {children}
    </label>
  );
};

export default InputLabel;
