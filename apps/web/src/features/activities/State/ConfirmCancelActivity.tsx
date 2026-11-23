export function ConfirmCancelActivity({
  name,
  onClose,
  onConfirm,
}: Readonly<{
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}>) {
  return (
    <>
      <div className="modal d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cancelar actividad</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
            </div>

            <div className="modal-body">
              <p>
                ¿Cancelar <strong>{name}</strong>? Una actividad cancelada ya no se puede editar ni
                volver a publicar.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Volver
              </button>
              <button type="button" className="btn btn-warning" onClick={onConfirm}>
                <i className="fa-solid fa-ban" /> Cancelar actividad
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}