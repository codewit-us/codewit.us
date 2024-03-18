import CreatableSelect from 'react-select/creatable';
import { useState, useEffect } from 'react';
import { topicTree } from '@codewit/topics';
import { SelectStyles } from '../../utils/styles.js';
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
  selectedTags: Tag[] | undefined;
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
        styles={SelectStyles}      
      />
    </div>
  );
}

export default TagSelect;
