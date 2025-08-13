// codewit/client/src/components/form/TagSelect.tsx
import CreatableSelect from 'react-select/creatable';
import Select, { SingleValue } from 'react-select';
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

function extract_topics_rec(node: TopicNode, list: Tag[]) {
  for (let key of Object.keys(node)) {
    list.push({value: key, label: key});

    if (typeof node[key] === "object") {
      extract_topics_rec(node[key], list);
    }
  }
}

function extract_topics(): Tag[] {
  let rtn: Tag[] = [];

  extract_topics_rec(topicTree, rtn);

  return rtn;
}

export const topic_options = extract_topics();

const TagSelect = ({ setSelectedTags, selectedTags, isMulti = true }: TagSelectProps): JSX.Element => {
  const handleChange = (newValue: MultiValue<Tag> | SingleValue<Tag>)  => {
    setSelectedTags(newValue as Tag[] | Tag);
  };

  return (
    <div className="flex flex-col justify-center items-start w-full text-white" data-testid="topic-select">
      <label htmlFor={isMulti ? 'tag-select' : 'single-tag-select'} className="block text-sm mb-2 font-medium text-gray-400">
        {isMulti ? 'Select/Create Tags' : 'Select Topic'}
      </label>
      {isMulti ?
        <CreatableSelect
          id='tag-select'
          isMulti
          value={selectedTags}
          onChange={handleChange}
          className="w-full"
          styles={SelectStyles}
        />
        :
        <Select
          id='single-tag-select'
          value={selectedTags}
          onChange={handleChange}
          options={topic_options}
          className="w-full"
          styles={SelectStyles}
        />
      }
    </div>
  );
}

export default TagSelect;
