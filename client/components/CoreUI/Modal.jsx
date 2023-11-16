import React from "react";
import { Modal as BaseModal } from "@mui/base";

const Modal = React.forwardRef(({ modalText, ...props }, ref) => {
  const Backdrop = () => {
    return (
      <div
        className="fixed inset-0 w-screen h-screen bg-black/25"
        onClick={props.onClose} // Temp-fix: modal not closing on backdrop click TODO
      ></div>
    );
  };

  return (
    <BaseModal {...props} slots={{ backdrop: Backdrop }}>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 p-2 rounded-xl bg-cool-white">
        <p className="color-dark">{modalText}</p>
      </div>
    </BaseModal>
  );
});

export default Modal;
