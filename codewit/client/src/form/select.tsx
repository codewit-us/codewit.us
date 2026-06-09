import { useStore } from "@tanstack/react-form";
import { Label, Select } from "flowbite-react";
import { PropsWithChildren } from "react";

import { useFieldContext } from "./context";
import { cn } from "../utils/styles";

interface SelectFieldProps {
  // the contents to display in side the select label
  label?: string,

  // a description of the select
  description?: string,

  // a placeholder string to display for the select field
  placeholder?: string,

  // disables the select field
  disabled?: boolean,

  // the title that will be attached to the select field label
  title?: string,

  // a struct containing className strings that will be attached to the rendered
  // components
  classNames?: {
    // the className to apply to the select field label component
    label?: string,

    // the className to apply to the select field component
    field?: string,

    // the className to apply to the top most div component
    container?: string,
  }
}

// this provides a single select field that will attached to the current form
// context. the provided children will be the available options for the select
// field
export function SelectField({
  label,
  description,
  placeholder,
  disabled,
  title,
  classNames = {},
  children,
}: PropsWithChildren<SelectFieldProps>) {
    const field = useFieldContext<string>();

    let submitting = useStore(field.form.store, state => state.isSubmitting);
    let has_errors = field.state.meta.errors.length !== 0;
    let is_disabled = disabled != null ? (submitting || disabled) : submitting;

    return <div className={cn("space-y-2", classNames.container)}>
      {label != null ?
        <Label
          htmlFor={field.name}
          className={classNames.label}
          disabled={is_disabled}
          title={title}
        >
          {label}
        </Label>
        :
        null
      }
      <Select
        id={field.name}
        name={field.name}
        value={field.state.value}
        placeholder={placeholder}
        disabled={is_disabled}
        className={classNames.field}
        onBlur={field.handleBlur}
        onChange={ev => field.handleChange(ev.target.value)}
      >
        {children}
      </Select>
      {description != null || has_errors ?
        <div>
          {description != null ? <p>{description}</p> : null}
          {field.state.meta.errors.map(err => <div key={err}>{err}</div>)}
        </div>
        :
        null
      }
    </div>;
}

// a convenience component for the "language" input field that many records
// have access to
//
// takes the same props as the SelectField except for children components
export function LanguageSelectField(props: SelectFieldProps) {
  return <SelectField {...props}>
    <option value="cpp">C++</option>
    <option value="java">Java</option>
    <option value="python">Python</option>
  </SelectField>
}
