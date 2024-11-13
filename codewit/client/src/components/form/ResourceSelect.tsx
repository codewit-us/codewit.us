import Select, { MultiValue } from 'react-select';
import { SelectedTag } from '@codewit/interfaces';
import { SelectStyles } from '../../utils/styles';

interface ResourceSelectProps {
  resourceOptions: SelectedTag[];
  selectedResources: string[];
  handleResourceChange: (selectedOptions: MultiValue<SelectedTag>) => void;
}

const ResourceSelect = ({ 
  resourceOptions, 
  selectedResources, 
  handleResourceChange 
}: ResourceSelectProps) => {
  return (
    <div className="w-full">
      <label 
        htmlFor="resource-select" 
        className="block text-sm font-medium text-gray-400 mb-2"
      >
        Resources
      </label>
      <Select
        id="resource-select"
        value={resourceOptions.filter(option => 
          selectedResources.includes(option.value)
        )}
        onChange={handleResourceChange}
        options={resourceOptions}
        isMulti
        isSearchable={true}
        styles={SelectStyles}
      />
    </div>
  );
};

export default ResourceSelect;