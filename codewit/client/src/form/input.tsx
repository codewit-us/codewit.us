import { useStore } from "@tanstack/react-form";
import { Label, TextInput } from "flowbite-react";

import { useFieldContext } from "./context";
import { cn } from "../utils/styles";

interface TextFieldProps {
  label?: string,
  description?: string,
  placeholder?: string,
  auto_complete?: string,
  disabled?: boolean,
  title?: string,
  classNames?: {
    label?: string,
    field?: string,
    container?: string,
  }
}

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
