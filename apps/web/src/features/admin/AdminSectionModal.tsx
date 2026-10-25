import type { ReactNode } from 'react';

export function AdminSectionModal({
  title,
  fullscreen = false,
  onClose,
  children,
}: {
  title: string;
  fullscreen?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div className="modal d-block" tabIndex={-1} role="dialog">
        <div
          className={`modal-dialog modal-dialog-scrollable ${
            fullscreen ? 'modal-fullscreen' : 'modal-xl'
          }`}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
