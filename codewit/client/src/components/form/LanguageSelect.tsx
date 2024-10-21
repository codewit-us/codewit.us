interface LanguageSelectProps {
  handleChange : (e: React.ChangeEvent<HTMLSelectElement>) => void;
  initialLanguage: string;
}

const LanguageSelect = ({handleChange, initialLanguage}: LanguageSelectProps): JSX.Element => {
  return (
    <div className='w-full'>
      <label htmlFor="language" className="block mb-2 text-sm font-medium text-gray-200">Language</label>
      <select 
        id="language" 
        name="language" 
        onChange={handleChange}
        className="w-full p-2.5 text-sm bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500" 
        required
        value={initialLanguage ? initialLanguage : "cpp"}
      >
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        <option value="Python">Python</option>
      </select>
    </div>
  );
}

export default LanguageSelect;