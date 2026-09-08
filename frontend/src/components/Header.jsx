import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { loginContextObj } from "../contexts/LoginContext";
import { FaCheckSquare, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";

function Header() {
  const { loginStatus, userLogout, currentUser } = useContext(loginContextObj);

  return (
    <header className="app-header mb-4">
      <div className="container d-flex justify-content-between align-items-center">
        <NavLink to="/" className="brand-logo d-flex align-items-center gap-2">
          <FaCheckSquare className="fs-3 text-primary" />
          <span>TaskFlow</span>
        </NavLink>

        <ul className="nav align-items-center gap-2 m-0">
          {loginStatus === false ? (
            <>
              <li className="nav-item">
                <NavLink className="nav-link-custom d-flex align-items-center gap-1" to="/">
                  <FaSignInAlt /> Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link-custom d-flex align-items-center gap-1" to="register">
                  <FaUserPlus /> Register
                </NavLink>
              </li>
            </>
          ) : (
            <li className="nav-item d-flex align-items-center gap-3">
              {currentUser?.email && (
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill font-monospace">
                  {currentUser.email}
                </span>
              )}
              <button
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                onClick={userLogout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}

export default Header;
