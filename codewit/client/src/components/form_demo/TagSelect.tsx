import CreatableSelect from 'react-select/creatable';

const TagSelect = ():JSX.Element => {
  return (
    <div className="flex flex-col justify-center items-start w-full text-white">
      <label htmlFor="tag-select" className="block text-sm mb-2 font-medium text-white">Select/Create Tags</label>
      <CreatableSelect 
        id = 'tag-select'
        isMulti 
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
              backgroundColor: 'gray'
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
        }}  
        />
    </div>
  );
}

export default TagSelect;