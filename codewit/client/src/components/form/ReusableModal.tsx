// codewit/client/src/components/form/ReusableModal.tsx
import React from "react";
import { Modal } from "flowbite-react";

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerActions: React.ReactNode;
}

export default function ReusableModal({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
}: ReusableModalProps) {
  return <Modal position="center" show={isOpen} onClose={onClose} size="2xl">
    <Modal.Header className="bg-gray-700 text-white px-6 py-3">
      {title}
    </Modal.Header>
    <Modal.Body className="bg-gray-800 p-6 space-y-6 overflow-visible">
      {children}
    </Modal.Body>
    <Modal.Footer className="bg-gray-800 px-6 py-3 flex justify-end rounded-b-lg">
      {footerActions}
    </Modal.Footer>
  </Modal>;
};
