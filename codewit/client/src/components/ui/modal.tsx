import { Modal as FlowbitModal, ModalBodyProps, ModalFooterProps, ModalHeaderProps, ModalProps } from "flowbite-react";
import { cn } from "../../utils/styles";

export function Modal({className, ...props}: ModalProps) {
    return <FlowbitModal className={cn(className)} {...props} />;
}

export function ModalHeader({className, ...props}: ModalHeaderProps) {
  return <FlowbitModal.Header
    className={cn("bg-gray-700 text-white px-6 py-3", className)}
    {...props}
  />;
}

export function ModalBody({className, ...props}: ModalBodyProps) {
  return <FlowbitModal.Body
    className={cn("bg-gray-800 p-6 space-y-6 overflow-visible", className)}
    {...props}
  />
}

export function ModalFooter({className, ...props}: ModalFooterProps) {
  return <FlowbitModal.Footer
    className={cn("bg-gray-800 px-6 py-3 flex justify-end", className)}
    {...props}
  />
}