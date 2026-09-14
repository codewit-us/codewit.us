import { createFormHook } from "@tanstack/react-form";

import {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext
} from "./form/context";
import {
  SubmitButton,
  ConfirmReset,
  ConfirmDelete,
  ConfirmAway
} from "./form/button";

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {
    SubmitButton,
    ConfirmReset,
    ConfirmDelete,
    ConfirmAway,
  },
});

export { useAppForm, useFieldContext, useFormContext };
