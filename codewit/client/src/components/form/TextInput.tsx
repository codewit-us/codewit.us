import React from 'react';

interface TextInputProps {
  id: string;
  name: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput = ({ id, name, placeholder, value = '', required = false, onChange }: TextInputProps): JSX.Element => {
  return (
    <input
      type="text"
      id={id}
      name={name}
      value={value}
      className="w-full p-2.5 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder}
      onChange={onChange}
      required={required}
    />
  );
};

export default TextInput;
