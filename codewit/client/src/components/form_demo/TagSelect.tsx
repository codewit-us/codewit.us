import CreatableSelect from 'react-select/creatable';
import { useState, useEffect } from 'react';
import { topicTree } from '@codewit/topics';
import { ActionMeta, MultiValue } from 'react-select';

interface TopicNode {
  [key: string]: TopicNode;
}

interface Tag {
  value: string;
  label: string;
}

interface TagSelectProps {
  setSelectedTags: (tags: Tag[]) => void;
  selectedTags: Tag[];
}

const TagSelect = ({ setSelectedTags, selectedTags }: TagSelectProps): JSX.Element => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const extractTags = (obj: TopicNode): Tag[] => {
      return Object.keys(obj).flatMap(key => {
        if (typeof obj[key] === 'object' && Object.keys(obj[key]).length) {
          return extractTags(obj[key]);
        }
        return { value: key, label: key };
      });
    };

    setTags(extractTags(topicTree));

  }, []);

  const handleChange = (newValue: MultiValue<Tag>, actionMeta: ActionMeta<Tag>) => {
    setSelectedTags(newValue as Tag[]);
  };


  return (
    <div className="flex flex-col justify-center items-start w-full text-white">
      <label htmlFor="tag-select" className="block text-sm mb-2 font-medium text-white">Select/Create Tags</label>
      <CreatableSelect
        id='tag-select'
        isMulti
        value={selectedTags}
        onChange={handleChange}
        options={tags}
        className="text-sm bg-blue text-white border-none w-full rounded-lg"
        styles={{
          control: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(55, 65, 81)',
            borderRadius: '0.5rem',
            borderColor: 'rgb(75 85 99)',
            color: 'white !important',
            padding: '2px',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'rgb(75 85 99)',
              cursor: 'text',
            }
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(55, 65, 81)',
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? 'none' : 'none',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgb(75 85 99)',
              cursor: 'pointer',
            }
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(31 41 55)',
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: 'white',
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgb(239 68 68)',
              color: 'white',
            },
          }),
          singleValue: (provided) => ({
            ...provided,
            color: 'white',
          }),
          placeholder: (provided) => ({
            ...provided,
            color: 'white',
          }),
          input: (provided) => ({
            ...provided,
            color: 'white',
          }),
        }}      
      />
    </div>
  );
}

export default TagSelect;
