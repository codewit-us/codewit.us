import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// codewit/client/src/utils/styles.ts
const styles = {
  control: (provided: any) => ({
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
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'rgb(55, 65, 81)',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 9999,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'none' : 'none',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgb(75 85 99)',
      cursor: 'pointer',
    }
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: 'rgb(31 41 55)',
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgb(239 68 68)',
      color: 'white',
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999
  }),
};

export {styles as SelectStyles};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
