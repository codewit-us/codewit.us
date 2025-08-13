// codewit/client/src/components/form/LanguageSelect.tsx
import { SelectStyles } from '../../utils/styles.js';
import Select from 'react-select';

interface LanguageSelectProps {
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  initialLanguage: string;
}

interface LanguageOption {
  value: string,
  label: string,
}

export const language_options: LanguageOption[] = [
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
];

export function get_language_option(given: string): LanguageOption {
  return language_options.find(opt => given === opt.value) ?? language_options[0];
}

const LanguageSelect = ({handleChange, initialLanguage }: LanguageSelectProps) => (
  <div 
    className="w-full"
    data-testid="language-select"
  >
    <label htmlFor="language" className="block text-sm font-medium text-gray-400 mb-2">
      Language
    </label>
    <Select
      id="language"
      name="language"
      options={language_options}
      onChange={option => handleChange({ target: { value: option?.value || '', name: "language"}} as any)}
      value={language_options.find(option => option.value === initialLanguage) || language_options[0]}
      isSearchable={false}
      styles={SelectStyles}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      menuPlacement="auto"
      menuShouldScrollIntoView={false}
    />
  </div>
);

export default LanguageSelect;