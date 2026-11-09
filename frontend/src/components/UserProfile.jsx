import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, ProgressBar, Spinner } from "react-bootstrap";
import {
  FaTasks,
  FaHourglassHalf,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaPlusCircle,
} from "react-icons/fa";
import CreateTask from "./CreateTask";
import TasksList from "./TaskList";
import { loginContextObj } from "../contexts/loginContextObj";
import { isTaskOverdue } from "../utils/dateUtils";

const DESKTOP_BREAKPOINT = "(min-width: 992px)";

function UserProfile() {
  const { currentUser, loginStatus, isAuthChecking } = useContext(loginContextObj);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDesktopLayout, setIsDesktopLayout] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_BREAKPOINT).matches : true
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const taskListRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT);
    const handleViewportChange = (e) => {
      setIsDesktopLayout(e.matches);
      if (e.matches) {
        setShowCreateModal(false);
      }
    };
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  const handleStatCardSelect = (targetFilter) => {
    setStatusFilter(targetFilter);
    if (taskListRef.current) {
      const rect = taskListRef.current.getBoundingClientRect();
      if (rect.top < 72 || rect.top > window.innerHeight * 0.65) {
        taskListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

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
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, pending, overdue, completionRate };
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
    <div className="py-1 py-md-3 dashboard-mobile-clearance">
      {/* User Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-3 mb-md-4 gap-3 gap-md-2">
        <div>
          <h2 className="fw-bold mb-1 text-break">Welcome, {currentUser?.name || "there"}</h2>
          <p className="text-muted small m-0">
            {stats.total === 0
              ? "Ready to get organized? Add your first task."
              : stats.pending === 0
              ? "All caught up! Every task is completed."
              : `You have ${stats.pending} pending ${stats.pending === 1 ? "task" : "tasks"}.`}
          </p>
        </div>

        {stats.total > 0 && (
          <div className="progress-summary-box">
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
      <div className="row g-2 g-md-3 mb-3 mb-md-4">
        <div className="col-6 col-md-3">
          <button
            type="button"
            className={`stat-card stat-card-btn w-100 text-start d-flex align-items-center justify-content-between ${
              statusFilter === "all" ? "stat-card-active" : ""
            }`}
            onClick={() => handleStatCardSelect("all")}
            aria-pressed={statusFilter === "all"}
          >
            <div>
              <div className="text-muted small fw-medium">Total Tasks</div>
              <div className="fs-4 fw-bold text-dark">{stats.total}</div>
            </div>
            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
              <FaTasks className="fs-5" />
            </div>
          </button>
        </div>

        <div className="col-6 col-md-3">
          <button
            type="button"
            className={`stat-card stat-card-btn w-100 text-start d-flex align-items-center justify-content-between ${
              statusFilter === "pending" ? "stat-card-active" : ""
            }`}
            onClick={() => handleStatCardSelect("pending")}
            aria-pressed={statusFilter === "pending"}
          >
            <div>
              <div className="text-muted small fw-medium">Pending</div>
              <div className="fs-4 fw-bold text-warning-emphasis">{stats.pending}</div>
            </div>
            <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning">
              <FaHourglassHalf className="fs-5" />
            </div>
          </button>
        </div>

        <div className="col-6 col-md-3">
          <button
            type="button"
            className={`stat-card stat-card-btn w-100 text-start d-flex align-items-center justify-content-between ${
              statusFilter === "completed" ? "stat-card-active" : ""
            }`}
            onClick={() => handleStatCardSelect("completed")}
            aria-pressed={statusFilter === "completed"}
          >
            <div>
              <div className="text-muted small fw-medium">Completed</div>
              <div className="fs-4 fw-bold text-success">{stats.completed}</div>
            </div>
            <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
              <FaCheckCircle className="fs-5" />
            </div>
          </button>
        </div>

        <div className="col-6 col-md-3">
          <button
            type="button"
            className={`stat-card stat-card-btn w-100 text-start d-flex align-items-center justify-content-between ${
              statusFilter === "overdue" ? "stat-card-active" : ""
            }`}
            onClick={() => handleStatCardSelect("overdue")}
            aria-pressed={statusFilter === "overdue"}
          >
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
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4 align-items-start">
        {isDesktopLayout && (
          <div className="col-lg-5">
            <CreateTask />
          </div>
        )}
        <div
          className={isDesktopLayout ? "col-lg-7" : "col-12"}
          ref={taskListRef}
          style={{ scrollMarginTop: "84px" }}
        >
          <TasksList
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onRequestCreate={!isDesktopLayout ? () => setShowCreateModal(true) : undefined}
          />
        </div>
      </div>

      {/* Mobile Floating Action Button (+) */}
      {!isDesktopLayout && !showCreateModal && (
        <button
          type="button"
          className="mobile-fab-btn"
          onClick={() => setShowCreateModal(true)}
          aria-label="Add new task"
          title="Add new task"
        >
          <FaPlus />
        </button>
      )}

      {/* Mobile Create Task Modal */}
      {!isDesktopLayout && (
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
              <FaPlusCircle className="text-primary" /> Create New Task
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-2">
            <CreateTask
              isModal
              onCancel={() => setShowCreateModal(false)}
              onTaskCreated={() => setShowCreateModal(false)}
            />
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}

export default UserProfile;
