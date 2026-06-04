import { useStore } from "@tanstack/react-form";
import { Label, Checkbox } from "flowbite-react";

import { useFieldContext } from "./context";
import { cn } from "../utils/styles";

interface CheckboxFieldProps {
  label: string,
  description?: string,
  disabled?: boolean,
  title?: string,
  classNames?: {
    container?: string,
    field?: string,
    label?: string,
  }
}

export function CheckboxField({
  label,
  description,
  disabled,
  title,
  classNames = {}
}: CheckboxFieldProps) {
  const field = useFieldContext<string>();

  let submitting = useStore(field.form.store, state => state.isSubmitting);
  let has_errors = field.state.meta.errors.length !== 0;
  let is_disabled = disabled != null ? (submitting || disabled) : submitting;

  return <div className={cn("p-2 space-y-2", classNames.container)}>
    <div className="flex flex-row items-center gap-2">
      <Checkbox
        id={field.name}
        name={field.name}
        className={classNames.field}
        disabled={is_disabled}
        checked={field.state.value}
        onBlur={field.handleBlur}
        onChange={ev => {
          if (typeof ev.target.checked === "boolean") {
            field.handleChange(ev.target.checked);
          } else {
            field.handleChange(false);
          }
        }}
      />
      <Label
        htmlFor={field.name}
        className={classNames.label}
        title={title}
        disabled={is_disabled}
      >
        {label}
      </Label>
    </div>
    {description != null || field.state.meta.errors.length !== 0 ?
      <div>
        {description != null ? <p>{description}</p> : null}
        {field.state.meta.errors.map(err => <div key={err}>{err}</div>)}
      </div>
      :
      null
    }
  </div>
}
