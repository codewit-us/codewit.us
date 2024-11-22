// codewit/client/src/components/form/LanguageSelect.tsx
import { SelectStyles } from '../../utils/styles.js';
import Select from 'react-select';

interface LanguageSelectProps {
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  initialLanguage: string;
}

const options = [
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
];

const LanguageSelect = ({handleChange, initialLanguage }: LanguageSelectProps) => (
  <div className="w-full">
    <label htmlFor="language" className="block text-sm font-medium text-gray-400 mb-2">
      Language
    </label>
    <Select
      id="language"
      name="language"
      options={options}
      onChange={option => handleChange({ target: { value: option?.value || '', name: "language"}} as any)}
      value={options.find(option => option.value === initialLanguage) || options[0]}
      isSearchable={false}
      styles={SelectStyles}
    />
  </div>
);

export default LanguageSelect;