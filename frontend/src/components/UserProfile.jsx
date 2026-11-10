import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";
import { FaPlus, FaPlusCircle } from "react-icons/fa";
import CreateTask from "./CreateTask";
import TasksList from "./TaskList";
import { loginContextObj } from "../contexts/loginContextObj";
import { isTaskOverdue } from "../utils/dateUtils";

const DESKTOP_BREAKPOINT = "(min-width: 992px)";

function UserProfile() {
  const { currentUser, loginStatus, isAuthChecking } = useContext(loginContextObj);
  const [isDesktopLayout, setIsDesktopLayout] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_BREAKPOINT).matches : true
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  useEffect(() => {
    if (!isAuthChecking && (!loginStatus || !currentUser)) {
      navigate("/login", { replace: true });
    }
  }, [isAuthChecking, loginStatus, currentUser, navigate]);

  const taskSummary = useMemo(() => {
    const todos = currentUser?.todos || [];
    const pending = todos.filter((t) => t.status !== "completed").length;
    const overdue = todos.filter((t) => isTaskOverdue(t)).length;
    return { total: todos.length, pending, overdue };
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
      <div className="mb-3 mb-md-4">
        <h2 className="fw-bold mb-1 text-break">Welcome, {currentUser?.name || "there"}</h2>
        <p className="text-muted small m-0">
          {taskSummary.total === 0 ? (
            "Ready to get organized? Add your first task."
          ) : taskSummary.pending === 0 ? (
            "All caught up! Every task is completed."
          ) : (
            <>
              You have {taskSummary.pending} pending{" "}
              {taskSummary.pending === 1 ? "task" : "tasks"}
              {taskSummary.overdue > 0 && (
                <span className="text-danger fw-medium"> ({taskSummary.overdue} overdue)</span>
              )}
              .
            </>
          )}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4 align-items-start">
        {isDesktopLayout && (
          <div className="col-lg-5">
            <CreateTask />
          </div>
        )}
        <div className={isDesktopLayout ? "col-lg-7" : "col-12"}>
          <TasksList
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
