import { NavLink, useLocation } from "react-router-dom";
import { useContext } from "react";
import { Spinner } from "react-bootstrap";
import { loginContextObj } from "../contexts/loginContextObj";
import { FaCheckSquare, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";

function Header() {
  const { loginStatus, userLogout, currentUser, isAuthChecking, isLoggingOut } =
    useContext(loginContextObj);
  const location = useLocation();

  const isLoginRoute = location.pathname === "/" || location.pathname === "/login";
  const displayName = currentUser?.name?.trim() || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="app-header mb-3 mb-md-4">
      <div className="container d-flex justify-content-between align-items-center gap-2">
        <NavLink
          to={loginStatus ? "/user-profile" : "/"}
          className="brand-logo d-flex align-items-center gap-2"
        >
          <FaCheckSquare className="fs-3 text-primary" />
          <span>TaskFlow</span>
        </NavLink>

        <ul className="nav align-items-center gap-2 m-0">
          {isAuthChecking ? (
            <li className="nav-item d-flex align-items-center gap-2 text-muted small px-2">
              <Spinner animation="border" size="sm" variant="primary" />
              <span className="d-none d-sm-inline">Checking session...</span>
            </li>
          ) : loginStatus === false ? (
            <>
              <li className="nav-item">
                <NavLink
                  className={`nav-link-custom d-flex align-items-center gap-1 ${
                    isLoginRoute ? "active" : ""
                  }`}
                  to="/login"
                >
                  <FaSignInAlt /> Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link-custom d-flex align-items-center gap-1" to="/register">
                  <FaUserPlus /> Register
                </NavLink>
              </li>
            </>
          ) : (
            <li className="nav-item d-flex align-items-center gap-2 gap-md-3">
              <div className="d-flex align-items-center gap-2">
                <span className="user-avatar-circle" title={displayName}>
                  {userInitial}
                </span>
                <span className="fw-semibold text-dark small text-truncate header-user-name">
                  {displayName}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-2 px-sm-3 py-1 py-sm-2 rounded-pill"
                onClick={userLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <FaSignOutAlt /> <span>Logout</span>
                  </>
                )}
              </button>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}

export default Header;
