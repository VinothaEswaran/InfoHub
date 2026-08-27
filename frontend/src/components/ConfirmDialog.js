import React from 'react';
import Modal from './Modal';

const font = '"Times New Roman",Times,serif';

/**
 * Reusable confirmation dialog built on top of Modal.
 * Props: open, onClose, onConfirm, title, message,
 *        confirmLabel (default 'Confirm'), confirmDanger (bool)
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  confirmDanger = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && (
        <p className="text-slate-300 text-sm mb-6 leading-relaxed" style={{ fontFamily: font }}>
          {message}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-slate-400 border border-slate-700
            hover:text-white transition-all text-sm"
          style={{ fontFamily: font }}
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm
            hover:opacity-90 transition-all"
          style={{
            background: confirmDanger
              ? '#E53935'
              : 'linear-gradient(135deg,#6C3FC5,#8B5CF6)',
            fontFamily: font,
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
