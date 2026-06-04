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
import {
  TextField,
} from "./form/input";
import {
  CheckboxField,
} from "./form/checkbox";
import {
  SelectField,
  LanguageSelectField,
} from "./form/select";
import {
  SubmitIndicator
} from "./form/indicator";

const { useAppForm, withForm, ...rest } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    // general input fields
    TextField,
    CheckboxField,
    SelectField,

    // predefined input fields
    LanguageSelectField,
  },
  formComponents: {
    // action buttons
    SubmitButton,
    ConfirmReset,
    ConfirmDelete,
    ConfirmAway,

    // indicators
    SubmitIndicator,
  },
});

export { useAppForm, useFieldContext, useFormContext, withForm };
