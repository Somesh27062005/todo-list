import { useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar, Spinner } from "react-bootstrap";
import { FaTasks, FaHourglassHalf, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import CreateTask from "./CreateTask";
import TasksList from "./TaskList";
import { loginContextObj } from "../contexts/loginContextObj";
import { isTaskOverdue } from "../utils/dateUtils";

function UserProfile() {
  const { currentUser, loginStatus, isAuthChecking } = useContext(loginContextObj);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthChecking && (!loginStatus || !currentUser)) {
      navigate("/login", { replace: true });
    }
  }, [isAuthChecking, loginStatus, currentUser, navigate]);

  const stats = useMemo(() => {
    const todos = currentUser?.todos || [];
    const total = todos.length;
    const completed = todos.filter((t) => t.status === "completed").length;
    const pending = total - completed;
    const overdue = todos.filter((t) => isTaskOverdue(t)).length;
    const highPriorityPending = todos.filter(
      (t) => t.status === "pending" && t.priority === "high"
    ).length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, pending, overdue, highPriorityPending, completionRate };
  }, [currentUser]);

  if (isAuthChecking || !currentUser) {
    return (
      <div className="row justify-content-center mt-5">
        <div className="col-md-6 col-lg-5">
          <div className="custom-card text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted fw-medium m-0">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 py-md-3">
      {/* User Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Welcome, {currentUser?.name || "there"}</h2>
          <p className="text-muted small m-0">
            {stats.total === 0
              ? "Ready to get organized? Add your first task below."
              : stats.pending === 0
              ? "All caught up! Every task is completed."
              : `You have ${stats.pending} pending ${stats.pending === 1 ? "task" : "tasks"}${
                  stats.highPriorityPending > 0
                    ? ` (${stats.highPriorityPending} high priority)`
                    : ""
                }.`}
          </p>
        </div>

        {stats.total > 0 && (
          <div style={{ minWidth: "220px" }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small fw-semibold text-secondary">Overall Progress</span>
              <span className="small fw-bold text-primary">{stats.completionRate}%</span>
            </div>
            <ProgressBar
              now={stats.completionRate}
              variant={stats.completionRate === 100 ? "success" : "primary"}
              style={{ height: "8px", borderRadius: "999px" }}
            />
          </div>
        )}
      </div>

      {/* Summary Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-medium">Total Tasks</div>
              <div className="fs-4 fw-bold text-dark">{stats.total}</div>
            </div>
            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
              <FaTasks className="fs-5" />
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-medium">Pending</div>
              <div className="fs-4 fw-bold text-warning-emphasis">{stats.pending}</div>
            </div>
            <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning">
              <FaHourglassHalf className="fs-5" />
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-medium">Completed</div>
              <div className="fs-4 fw-bold text-success">{stats.completed}</div>
            </div>
            <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
              <FaCheckCircle className="fs-5" />
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-medium">Overdue</div>
              <div className={`fs-4 fw-bold ${stats.overdue > 0 ? "text-danger" : "text-secondary"}`}>
                {stats.overdue}
              </div>
            </div>
            <div
              className={`p-2 rounded-3 ${
                stats.overdue > 0
                  ? "bg-danger bg-opacity-10 text-danger"
                  : "bg-secondary bg-opacity-10 text-secondary"
              }`}
            >
              <FaExclamationTriangle className="fs-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4 align-items-start">
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
