import { Link, useNavigate } from 'react-router-dom';
import { clearSessionUser, useSessionUser } from '../auth/session';
import { ADMIN_ROLE } from '../auth/roles';

export function NavBar() {
  const user = useSessionUser();
  const navigate = useNavigate();

  function handleLogout() {
    clearSessionUser();
    void navigate('/activities');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/activities">
          Eventos Medellín
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#main-nav"
          aria-controls="main-nav"
          aria-expanded="false"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="main-nav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/activities">
                Actividades
              </Link>
            </li>
            {user?.role.name === ADMIN_ROLE && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin/users">
                  Administrar usuarios
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fa-solid fa-user" />
                {user && <span className="ms-2">{user.name}</span>}
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                {user ? (
                  <li>
                    <button className="dropdown-item" type="button" onClick={handleLogout}>
                      Cerrar sesión
                    </button>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/login">
                        Iniciar sesión
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/register">
                        Crear cuenta
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
