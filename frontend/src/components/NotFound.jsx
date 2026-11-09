import { useContext } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaExclamationCircle } from "react-icons/fa";
import { loginContextObj } from "../contexts/loginContextObj";

function NotFound() {
  const { loginStatus } = useContext(loginContextObj);

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5">
        <div className="custom-card text-center py-5">
          <FaExclamationCircle className="display-4 text-primary opacity-75 mb-3" />
          <h2 className="fw-bold mb-2">Page Not Found</h2>
          <p className="text-muted small mb-4">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            to={loginStatus ? "/user-profile" : "/login"}
            className="btn btn-primary-custom d-inline-flex align-items-center gap-2"
          >
            <FaHome />
            <span>{loginStatus ? "Go to Dashboard" : "Back to Login"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
