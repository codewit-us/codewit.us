import { useFormContext } from "./context";
import LoadingIcons from "../components/loading/LoadingIcon";

interface SubmitIndicatorProps {}

// small indicator to signal to the user that the form is currently submitting
export function SubmitIndicator({}: SubmitIndicatorProps) {
  const form = useFormContext();

  return <form.Subscribe selector={state => ({submitting: state.isSubmitting})}>
    {({submitting}) => submitting ?
      <LoadingIcons/>
      :
      null
    }
  </form.Subscribe>
}
