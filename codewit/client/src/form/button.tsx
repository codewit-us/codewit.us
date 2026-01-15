import { ArrowLeftIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import { useState } from "react";

import { useFormContext } from "../form";

interface SubmitButtonProps {}

export function SubmitButton({}) {
  const form = useFormContext();

  return <form.Subscribe selector={state => ({
    submitting: state.isSubmitting,
    dirty: state.isDirty,
    can_submit: state.canSubmit,
  })}>
    {({submitting, dirty, can_submit}) => (
      <Button type="submit" disabled={submitting || !dirty || !can_submit}>
        Save
      </Button>
    )}
  </form.Subscribe>
}

interface ConfirmResetProps {
  /**
   * will be called when the user requests the reset
   */
  on_reset: () => void,
  /**
   * will be called when the user requests to cancel the reset
   */
  on_cancel?: () => void,
}

/**
 * a simple reset confirmation modal that will trigger the `on_reset` when the
 * user confirms the reset action. requires a form context as it will enable
 * and disable based on if the form is `submitting` or is `dirty`.
 */
export function ConfirmReset({
  on_reset,
  on_cancel = () => {},
}: ConfirmResetProps) {
  const form = useFormContext();

  const [open, set_open] = useState(false);

  const cancel_cb = () => {
    set_open(false);
    on_cancel();
  };

  const reset_cb = () => {
    set_open(false);
    on_reset();
  };

  return <form.Subscribe selector={state => ({
    submitting: state.isSubmitting,
    dirty: state.isDirty,
  })}>
    {({submitting, dirty}) => <>
      <Button type="button" color="dark" disabled={submitting || !dirty} onClick={() => set_open(true)}>
        <ArrowPathIcon className="mr-2 w-4 h-4"/> Reset
      </Button>
      <Modal dismissible show={open} onClose={cancel_cb}>
        <ModalHeader>Reset Data</ModalHeader>
        <ModalBody>
          <p>This will reset any changes you made to its original state. Are you sure?</p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" onClick={reset_cb}>Reset</Button>
          <Button type="button" color="dark" onClick={cancel_cb}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>}
  </form.Subscribe>
}

interface ConfirmDeleteProps {
  /**
   * will be called when the user requests the delete
   */
  on_delete: () => void,
  /**
   * will be called when the user reqests to cancel the delete
   */
  on_cancel?: () => void,
}

/**
 * a simple delete confirmation modal that will trigger the `on_delete` when the
 * user confirms the delete action. requires a form context as it will enable
 * and disable based on if the form is `submitting`
 */
export function ConfirmDelete({
  on_delete,
  on_cancel = () => {},
}: ConfirmDeleteProps) {
  const form = useFormContext();

  const [open, set_open] = useState(false);

  const cancel_cb = () => {
    set_open(false);
    on_cancel();
  };

  const delete_cb = () => {
    set_open(false);
    on_delete();
  };

  return <form.Subscribe selector={state => ({
    submitting: state.isSubmitting,
  })}>
    {({submitting}) => <>
      <Button type="button" color="red" disabled={submitting} onClick={() => set_open(true)}>
        <TrashIcon className="mr-2 w-4 h-4"/> Delete
      </Button>
      <Modal dismissible show={open} onClose={cancel_cb}>
        <ModalHeader>Delete Data</ModalHeader>
        <ModalBody>
          <p>This will delete the current data from the server. Are you sure?</p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="red" onClick={delete_cb}>Delete</Button>
          <Button type="button" color="dark" onClick={cancel_cb}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>}
  </form.Subscribe>
}

interface ConfirmAwayProps {
  /**
   * will be called when the user reqests to away
   */
  on_away: () => void,
  /**
   * will be called when the user requests to cancel the away
   */
  on_cancel?: () => void,
}

/**
 * a simple away confirmation modal that will trigger the `on_away` when the
 * user confirms the awayt action. requires a form context as it will enable
 * and disable based on if the form is `submitting`. the modal will only appear
 * if the form is marked as dirty otherwise it will not prompt the user to
 * confirm the away request.
 */
export function ConfirmAway({
  on_away,
  on_cancel = () => {},
}: ConfirmAwayProps) {
  const form = useFormContext();

  const [open, set_open] = useState(false);

  const away_cb = () => {
    set_open(false);
    on_away();
  };

  const cancel_cb = () => {
    set_open(false);
    on_cancel();
  };

  return <form.Subscribe selector={state => ({
    submitting: state.isSubmitting,
    dirty: state.isDirty,
  })}>
    {({submitting, dirty}) => <>
      <Button
        type="button"
        color="light"
        disabled={submitting}
        onClick={() => {
          if (dirty) {
            set_open(true);
          } else {
            on_away();
          }
        }}
      >
        <ArrowLeftIcon className="w-6 h-6"/>
      </Button>
      <Modal dismissible show={open} onClose={cancel_cb}>
        <ModalHeader>Cancel Changes</ModalHeader>
        <ModalBody>
          <p>You have made changes to the data and did not save. Are you sure?</p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="light" onClick={away_cb}>Leave</Button>
          <Button type="button" color="dark" onClick={cancel_cb}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>}
  </form.Subscribe>
}
