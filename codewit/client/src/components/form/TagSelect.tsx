import CreatableSelect from 'react-select/creatable';
import Select, { SingleValue } from 'react-select';
import { useState, useEffect } from 'react';
import { topicTree } from '@codewit/topics';
import { SelectStyles } from '../../utils/styles.js';
import { MultiValue } from 'react-select';

interface TopicNode {
  [key: string]: TopicNode;
}

interface Tag {
  value: string;
  label: string;
}

interface TagSelectProps {
  setSelectedTags: (tags: Tag | Tag[] | any ) => void;
  selectedTags: Tag[] | Tag | null | undefined;
  isMulti?: boolean;
}

const TagSelect = ({ setSelectedTags, selectedTags, isMulti = true }: TagSelectProps): JSX.Element => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const extractTags = (obj: TopicNode): Tag[] => {
      return Object.keys(obj).flatMap(key => {
        const currentTag = { value: key, label: key };
        if (typeof obj[key] === 'object' && Object.keys(obj[key]).length) {
          return [currentTag, ...extractTags(obj[key])];
        }
        return currentTag;
      });
    };

    setTags(extractTags(topicTree));

  }, []);

  const handleChange = (newValue: MultiValue<Tag> | SingleValue<Tag>)  => {
    setSelectedTags(newValue as Tag[] | Tag);
  };


  return (
    <div className="flex flex-col justify-center items-start w-full text-white">
      <label htmlFor={isMulti ? 'tag-select' : 'single-tag-select'} className="block text-sm mb-2 font-medium text-white">
        {isMulti ? 'Select/Create Tags' : 'Select Topic'}
      </label>
      {isMulti
        ?
        <CreatableSelect
          id='tag-select'
          isMulti
          value={selectedTags}
          onChange={handleChange}
          className="text-sm bg-blue text-white border-none w-full rounded-lg"
          styles={SelectStyles}      
        />     
        :
        <Select
          id='single-tag-select'
          value={selectedTags}
          onChange={handleChange}
          options={tags}
          className="text-sm bg-blue text-white border-none w-full rounded-lg"
          styles={SelectStyles}      
        />  
    }  
    </div>
  );
}

export default TagSelect;
