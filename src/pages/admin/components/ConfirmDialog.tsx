import React from 'react';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden p-6 text-center">
        <h2 className="font-bold text-lg mb-2">{title}</h2>
        <p className="text-gray-500 mb-6">{message}</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Xác nhận</button>
        </div>
      </div>
    </div>
  );
};
