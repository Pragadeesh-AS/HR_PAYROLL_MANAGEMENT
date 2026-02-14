import React from "react";
import ReactDOM from "react-dom";
import "./Modal.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdrop = true,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal modal-${size} animate-slideInUp`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
