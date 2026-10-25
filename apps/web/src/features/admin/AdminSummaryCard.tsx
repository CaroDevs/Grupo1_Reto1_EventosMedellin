export function AdminSummaryCard({
  title,
  icon,
  count,
  onManage,
}: {
  title: string;
  icon: string;
  count: number | null;
  onManage: () => void;
}) {
  return (
    <div className="col-md-4">
      <div className="card shadow-sm h-100 text-center">
        <div className="card-body d-flex flex-column align-items-center">
          <i className={`fa-solid ${icon} fa-2x text-primary mb-3`} />
          <h5 className="card-title">{title}</h5>
          <p className="display-6 mb-3">{count ?? '—'}</p>
          <button type="button" className="btn btn-primary mt-auto" onClick={onManage}>
            Administrar
          </button>
        </div>
      </div>
    </div>
  );
}
