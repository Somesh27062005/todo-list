import CreateTask from "./CreateTask";
import TasksList from "./TaskList";
import { useContext, useEffect } from "react";
import { loginContextObj } from "../contexts/LoginContext";
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const { currentUser, loginStatus } = useContext(loginContextObj);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loginStatus && !currentUser) {
      navigate("/");
    }
  }, [loginStatus, currentUser, navigate]);

  return (
    <div className="py-3">
      {/* User Welcome Banner */}
      <div className="mb-4">
        <h2 className="fw-bold m-0">Welcome, {currentUser?.name} 👋</h2>
        <p className="text-muted small">Task Dashboard</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <CreateTask />
        </div>
        <div className="col-lg-7">
          <TasksList />
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
