import { Modal } from "flowbite-react";
import React from "react";

const ModalBox = ({
  openModal,
  setOpenModal,
  children,
}: {
  children: React.ReactNode;
  openModal: string | undefined;
  setOpenModal: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  return (
    <Modal
      size="md"
      className="z-[9999] "
      dismissible
      show={openModal === "dismissible"}
      onClose={() => setOpenModal(undefined)}
    >
      <Modal.Body className="px-10">{children}</Modal.Body>
    </Modal>
  );
};

export default ModalBox;
