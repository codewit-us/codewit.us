// interface LanguageSelectProps {
//   handleChange : (e: React.ChangeEvent<HTMLSelectElement>) => void;
//   initialLanguage: string;
// }

// const LanguageSelect = ({handleChange, initialLanguage}: LanguageSelectProps): JSX.Element => {
//   return (
//     <div className="w-full">
//       <label 
//         htmlFor="language" 
//         className="block text-sm font-medium text-gray-200 mb-2"
//       >
//         Language
//       </label>
//       <select 
//         id="language" 
//         name="language" 
//         onChange={handleChange}
//         className="w-full text-sm bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent py-2 px-3"
//         required
//         value={initialLanguage.length > 0 ? initialLanguage : "cpp"}
//       >
//         <option value="cpp">C++</option>
//         <option value="java">Java</option>
//         <option value="Python">Python</option>
//       </select>
//     </div>
//   );
// }

// export default LanguageSelect;

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

const LanguageSelect = ({ handleChange, initialLanguage }: LanguageSelectProps) => (
  <div className="w-full">
    <label htmlFor="language" className="block text-sm font-medium text-gray-400 mb-2">
      Language
    </label>
    <Select
      id="language"
      name="language"
      options={options}
      onChange={option => handleChange({ target: { value: option?.value || '' }} as any)}
      value={options.find(option => option.value === initialLanguage) || options[0]}
      isSearchable={false}
      styles={SelectStyles}
    />
  </div>
);

export default LanguageSelect;