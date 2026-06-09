import { useStore } from "@tanstack/react-form";
import { Label, TextInput } from "flowbite-react";

import { useFieldContext } from "./context";
import { cn } from "../utils/styles";

interface TextFieldProps {
  // the contents to display inside the text field label
  label?: string,

  // a description for the text field
  description?: string,

  // a placeholder string to display for the text field
  placeholder?: string,

  // the auto complete value to be provided to the text field
  auto_complete?: string,

  // disables the text field
  disabled?: boolean,

  // the title that will be attached to the text field label
  title?: string,

  // a struct containing className strings that will be attached to the rendered
  // components
  classNames?: {
    // the className to apply to the text field label component
    label?: string,

    // the className to apply to the text field component
    field?: string,

    // the className to apply to the top most div component
    container?: string,
  }
}

// a simple text field input that will handle form and field state automatically
export function TextField({
  label,
  description,
  placeholder,
  auto_complete,
  disabled,
  title,
  classNames = {},
}: TextFieldProps) {
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
    <TextInput
      type="text"
      id={field.name}
      name={field.name}
      className={classNames.field}
      placeholder={placeholder}
      autoComplete={auto_complete}
      disabled={is_disabled}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={ev => field.handleChange(ev.target.value)}
    />
    {description != null || has_errors ?
      <div>
        {description != null ? <p>{description}</p> : null}
        {field.state.meta.errors.map(err => <div key={err}>{err}</div>)}
      </div>
      :
      null
    }
  </div>
}
