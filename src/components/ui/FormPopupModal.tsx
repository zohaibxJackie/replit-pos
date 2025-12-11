import React, { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const FormPopupModal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed !mt-0 inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-6 sm:p-8 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()} // prevent closing on content click
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto pr-2 custom-scrollbar">
          {children}
        </div>

        {/* Close Button */}
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default FormPopupModal;
