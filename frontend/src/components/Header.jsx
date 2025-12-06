import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { loginContextObj } from "../contexts/LoginContext";

function Header() {
  const { loginStatus, userLogout, currentUser } = useContext(loginContextObj);

  return (
    <div>
      <ul className="nav justify-content-end">
        {loginStatus === false ? (
          <>
            <li className="nav-item">
              <NavLink className="nav-link" to="">
                Login
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="register">
                Register
              </NavLink>
            </li>
          </>
        ) : (
          <li className="nav-item">
            <NavLink className="nav-link" to="register" onClick={userLogout}>
              Logout
              <span className=' bg-black mt-4 ms-4'>{currentUser.email}</span>
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Header;



