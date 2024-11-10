import React from "react";
import { Modal } from "flowbite-react";

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerActions: React.ReactNode;
}

const ReusableModal: React.FC<ReusableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
}) => {
  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div className="relative bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <Modal.Header className="bg-gray-700 text-white px-6 py-3 rounded-t-lg">
          {title}
        </Modal.Header>

        <Modal.Body
          className="p-6 bg-gray-800 space-y-6 overflow-y-auto"
          style={{ maxHeight: "70vh" }} 
        >
          {children}
        </Modal.Body>

        <Modal.Footer className="bg-gray-800 px-6 py-3 flex justify-end rounded-b-lg">
          {footerActions}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default ReusableModal;
