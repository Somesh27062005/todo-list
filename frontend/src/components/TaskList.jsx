import { useContext, useMemo, useState } from "react";
import axios from "axios";
import { Modal, Spinner } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import {
  FaEdit,
  FaTrash,
  FaCheck,
  FaTasks,
  FaInbox,
  FaClock,
  FaSearch,
  FaTimes,
  FaCalendarAlt,
  FaBroom,
  FaSortAmountDown,
} from "react-icons/fa";
import { loginContextObj } from "../contexts/loginContextObj";
import { API_BASE_URL } from "../config";
import DateInput from "./DateInput";
import {
  extractDateOnlyStr,
  formatTimestamp,
  getDueDateMeta,
  getLocalDateStr,
  isTaskOverdue,
  isoToDisplayDate,
  parseDisplayDateToIso,
} from "../utils/dateUtils";

function TaskList({ statusFilter: controlledFilter, onStatusFilterChange }) {
  const { currentUser, setCurrentUser, handleSessionExpired, showToast } =
    useContext(loginContextObj);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      taskName: "",
      description: "",
      dueDate: "",
    },
  });

  // Filters & sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [internalFilter, setInternalFilter] = useState("all");
  const statusFilter = controlledFilter ?? internalFilter;
  const setStatusFilter = onStatusFilterChange ?? setInternalFilter;
  const [sortBy, setSortBy] = useState("dueDateAsc");

  // Action loading & modal states
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [modalState, setModalState] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editErr, setEditErr] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [clearCompletedModal, setClearCompletedModal] = useState(false);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);

  const todos = useMemo(() => currentUser?.todos || [], [currentUser]);

  const counts = useMemo(() => {
    const completed = todos.filter((t) => t.status === "completed").length;
    const overdue = todos.filter((t) => isTaskOverdue(t)).length;
    return {
      all: todos.length,
      pending: todos.length - completed,
      overdue,
      completed,
    };
  }, [todos]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const filteredAndSortedTodos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = todos.filter((todo) => {
      if (statusFilter === "overdue") {
        if (!isTaskOverdue(todo)) return false;
      } else if (statusFilter !== "all" && todo.status !== statusFilter) {
        return false;
      }

      if (query) {
        const titleMatch = todo.taskName?.toLowerCase().includes(query);
        const descMatch = todo.description?.toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }

      if (sortBy === "dueDateAsc") {
        // Put pending tasks before completed tasks when sorting by soonest due date
        if (a.status !== b.status) {
          return a.status === "pending" ? -1 : 1;
        }
        const aDue = extractDateOnlyStr(a.dueDate);
        const bDue = extractDateOnlyStr(b.dueDate);
        if (aDue && bDue) {
          const cmp = aDue.localeCompare(bDue);
          if (cmp !== 0) return cmp;
        } else if (aDue) {
          return -1;
        } else if (bDue) {
          return 1;
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      if (sortBy === "dueDateDesc") {
        if (a.status !== b.status) {
          return a.status === "pending" ? -1 : 1;
        }
        const aDue = extractDateOnlyStr(a.dueDate);
        const bDue = extractDateOnlyStr(b.dueDate);
        if (aDue && bDue) {
          const cmp = bDue.localeCompare(aDue);
          if (cmp !== 0) return cmp;
        } else if (aDue) {
          return -1;
        } else if (bDue) {
          return 1;
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      // default: newest first
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [todos, searchQuery, statusFilter, sortBy]);

  const openModal = (taskObj) => {
    if (taskObj.status === "completed") return;
    setEditErr("");
    setTaskBeingEdited(taskObj);
    reset({
      taskName: taskObj.taskName || "",
      description: taskObj.description || "",
      dueDate: isoToDisplayDate(taskObj.dueDate),
    });
    setModalState(true);
  };

  const closeModal = () => {
    if (isSavingEdit) return;
    setModalState(false);
    setEditErr("");
    setTaskBeingEdited(null);
  };

  const saveModifiedTask = async (modifiedTaskObj) => {
    if (!currentUser?._id || !taskBeingEdited?._id || isSavingEdit) return;
    if (taskBeingEdited.status === "completed") return;

    const isoDueDate = parseDisplayDateToIso(modifiedTaskObj.dueDate);
    if (!isoDueDate) return;

    setEditErr("");
    setIsSavingEdit(true);

    const payload = {
      taskName: modifiedTaskObj.taskName.trim(),
      description: modifiedTaskObj.description.trim(),
      dueDate: isoDueDate,
      tzOffset: new Date().getTimezoneOffset(),
    };

    try {
      const res = await axios.put(
        `${API_BASE_URL}/user-api/edit-todo/userid/${currentUser._id}/taskid/${taskBeingEdited._id}`,
        payload,
        { withCredentials: true }
      );

      if (res.status === 200 && res.data?.payload) {
        setCurrentUser(res.data.payload);
        setModalState(false);
        setTaskBeingEdited(null);
        showToast("Task updated successfully!", "success");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setModalState(false);
        handleSessionExpired();
      } else {
        setEditErr(err.response?.data?.message || "Failed to update task.");
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const markTaskCompleted = async (todoObj) => {
    if (!currentUser?._id || completingTaskId || todoObj.status === "completed") return;

    setCompletingTaskId(todoObj._id);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/user-api/edit-status/userid/${currentUser._id}/taskid/${todoObj._id}`,
        null,
        { withCredentials: true }
      );
      if (res.status === 200 && res.data?.payload) {
        setCurrentUser(res.data.payload);
        showToast("Task marked as completed!", "success");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleSessionExpired();
      } else {
        showToast(err.response?.data?.message || "Failed to complete task.", "danger");
      }
    } finally {
      setCompletingTaskId(null);
    }
  };

  const confirmDeleteTask = async () => {
    if (!currentUser?._id || !deleteTarget?._id || isDeleting) return;
    setIsDeleting(true);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/user-api/delete-todo/userid/${currentUser._id}/taskid/${deleteTarget._id}`,
        null,
        { withCredentials: true }
      );
      if (res.status === 200 && res.data?.payload) {
        setCurrentUser(res.data.payload);
        setDeleteTarget(null);
        showToast("Task deleted.", "info");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setDeleteTarget(null);
        handleSessionExpired();
      } else {
        showToast(err.response?.data?.message || "Failed to delete task.", "danger");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmClearCompleted = async () => {
    if (!currentUser?._id || isClearingCompleted) return;
    setIsClearingCompleted(true);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/user-api/clear-completed/${currentUser._id}`,
        null,
        { withCredentials: true }
      );
      if (res.status === 200 && res.data?.payload) {
        setCurrentUser(res.data.payload);
        setClearCompletedModal(false);
        showToast("Completed tasks cleared.", "info");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setClearCompletedModal(false);
        handleSessionExpired();
      } else {
        showToast(err.response?.data?.message || "Failed to clear completed tasks.", "danger");
      }
    } finally {
      setIsClearingCompleted(false);
    }
  };

  return (
    <div className="custom-card">
      {/* Header Row */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <h4 className="fw-bold m-0 d-flex align-items-center gap-2">
            <FaTasks className="text-primary" /> My Tasks
          </h4>
          <span className="badge bg-primary rounded-pill px-3 py-1">
            {counts.all} {counts.all === 1 ? "Task" : "Tasks"}
          </span>
        </div>

        {counts.completed > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 rounded-pill px-3"
            onClick={() => setClearCompletedModal(true)}
          >
            <FaBroom />
            <span>Clear Completed ({counts.completed})</span>
          </button>
        )}
      </div>

      {/* Search, Filter & Sort Controls */}
      {todos.length > 0 && (
        <div className="mb-4 pb-3 border-bottom">
          {/* Status Filter Tabs */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "pending" ? "active" : ""}`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({counts.pending})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "overdue" ? "active" : ""}`}
              onClick={() => setStatusFilter("overdue")}
            >
              Overdue ({counts.overdue})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "completed" ? "active" : ""}`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed ({counts.completed})
            </button>
          </div>

          {/* Search + Sort */}
          <div className="row g-2">
            <div className="col-12 col-sm-7">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control border-start-0"
                  placeholder="Search tasks..."
                  aria-label="Search tasks"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            <div className="col-12 col-sm-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0 text-muted" title="Sort by">
                  <FaSortAmountDown />
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select border-start-0"
                  aria-label="Sort tasks"
                >
                  <option value="newest">Recently Added</option>
                  <option value="oldest">Oldest Added</option>
                  <option value="dueDateAsc">Earliest Due Date</option>
                  <option value="dueDateDesc">Latest Due Date</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task List or Empty States */}
      {todos.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaInbox className="display-4 mb-2 text-secondary opacity-50" />
          <p className="m-0 fw-semibold">No tasks yet</p>
          <small>Create your first task using the form to get started!</small>
        </div>
      ) : filteredAndSortedTodos.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaSearch className="fs-1 mb-2 text-secondary opacity-50" />
          <p className="m-0 fw-semibold">No tasks match your filters</p>
          <small className="d-block mb-3">Try adjusting your search or filter criteria.</small>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        filteredAndSortedTodos.map((todoObj) => {
          const dueMeta = getDueDateMeta(todoObj.dueDate, todoObj.status);
          const isCompleting = completingTaskId === todoObj._id;
          const isCompleted = todoObj.status === "completed";

          return (
            <div
              className={`task-item-card ${isCompleted ? "task-completed-card" : ""}`}
              key={todoObj._id}
            >
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span
                    className={
                      isCompleted
                        ? "badge-completed d-inline-flex align-items-center gap-1"
                        : "badge-pending"
                    }
                  >
                    {isCompleted ? (
                      <>
                        <FaCheck /> Completed
                      </>
                    ) : (
                      "Pending"
                    )}
                  </span>

                  {dueMeta && (
                    <span className={`${dueMeta.className} d-inline-flex align-items-center gap-1`}>
                      <FaCalendarAlt />
                      {dueMeta.label}
                    </span>
                  )}
                </div>

                <div className="d-flex gap-1 flex-shrink-0">
                  {!isCompleted && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary border-0 rounded-circle"
                      title="Edit task"
                      aria-label="Edit task"
                      onClick={() => openModal(todoObj)}
                      disabled={Boolean(completingTaskId)}
                    >
                      <FaEdit />
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                    title="Delete task"
                    aria-label="Delete task"
                    onClick={() => setDeleteTarget(todoObj)}
                    disabled={Boolean(completingTaskId)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <h5
                className={`fw-bold mb-1 text-break ${
                  isCompleted ? "text-decoration-line-through text-muted opacity-75" : ""
                }`}
              >
                {todoObj.taskName}
              </h5>

              {todoObj.description && (
                <p
                  className={`small mb-3 text-break ${
                    isCompleted
                      ? "text-decoration-line-through text-muted opacity-75"
                      : "text-secondary"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {todoObj.description}
                </p>
              )}

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 pt-2 border-top border-light">
                <small
                  className="text-muted d-flex align-items-center gap-1 opacity-75"
                  style={{ fontSize: "0.75rem" }}
                >
                  <FaClock />
                  {todoObj.createdAt && `Created ${formatTimestamp(todoObj.createdAt)}`}
                  {isCompleted &&
                    todoObj.completedAt &&
                    ` • Completed ${formatTimestamp(todoObj.completedAt)}`}
                </small>

                {!isCompleted && (
                  <button
                    type="button"
                    disabled={Boolean(completingTaskId)}
                    className="btn btn-sm btn-success d-inline-flex align-items-center gap-1 rounded-pill px-3"
                    onClick={() => markTaskCompleted(todoObj)}
                  >
                    {isCompleting ? (
                      <>
                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                        <span>Completing...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        <span>Mark as completed</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Edit Task Modal */}
      <Modal show={modalState} onHide={closeModal} centered>
        <Modal.Header closeButton={!isSavingEdit} className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {editErr && (
            <div className="alert alert-danger py-2 small" role="alert">
              {editErr}
            </div>
          )}

          <form onSubmit={handleSubmit(saveModifiedTask)} noValidate>
            <div className="mb-3">
              <label htmlFor="edit-task-title" className="form-label fw-semibold text-secondary small">
                Task Title <span className="text-danger">*</span>
              </label>
              <input
                id="edit-task-title"
                type="text"
                disabled={isSavingEdit}
                {...register("taskName", {
                  required: "Task title is required",
                  validate: (v) => v.trim().length > 0 || "Task title cannot be empty",
                  maxLength: {
                    value: 120,
                    message: "Task title must be 120 characters or fewer",
                  },
                  onChange: () => {
                    if (editErr) setEditErr("");
                  },
                })}
                className="form-control form-control-custom"
              />
              {errors?.taskName && (
                <small className="text-danger mt-1 d-block">{errors.taskName.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-task-desc" className="form-label fw-semibold text-secondary small">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                id="edit-task-desc"
                rows="3"
                disabled={isSavingEdit}
                {...register("description", {
                  required: "Task description is required",
                  validate: (v) => v.trim().length > 0 || "Task description cannot be empty",
                  maxLength: {
                    value: 500,
                    message: "Description must be 500 characters or fewer",
                  },
                  onChange: () => {
                    if (editErr) setEditErr("");
                  },
                })}
                className="form-control form-control-custom"
              ></textarea>
              {errors?.description && (
                <small className="text-danger mt-1 d-block">{errors.description.message}</small>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="edit-task-due" className="form-label fw-semibold text-secondary small">
                Due Date <span className="text-danger">*</span>
              </label>
              <Controller
                name="dueDate"
                control={control}
                rules={{
                  required: "Due date is required",
                  validate: (v) => {
                    const iso = parseDisplayDateToIso(v);
                    if (!iso) return "Please enter a valid date (DD/MM/YYYY)";
                    const origIso = extractDateOnlyStr(taskBeingEdited?.dueDate);
                    if (iso < getLocalDateStr() && iso !== origIso) {
                      return "Due date cannot be in the past";
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <DateInput
                    id="edit-task-due"
                    value={field.value}
                    minDate={getLocalDateStr()}
                    onChange={(val) => {
                      field.onChange(val);
                      if (editErr) setEditErr("");
                    }}
                    onBlur={field.onBlur}
                    disabled={isSavingEdit}
                  />
                )}
              />
              {errors?.dueDate && (
                <small className="text-danger mt-1 d-block">{errors.dueDate.message}</small>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={closeModal}
                disabled={isSavingEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary-custom px-4 d-inline-flex align-items-center gap-2"
                disabled={isSavingEdit}
              >
                {isSavingEdit ? (
                  <>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={Boolean(deleteTarget)}
        onHide={() => !isDeleting && setDeleteTarget(null)}
        centered
        size="sm"
      >
        <Modal.Header closeButton={!isDeleting} className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-danger">Delete Task?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="small text-secondary mb-3 text-break">
            Are you sure you want to delete{" "}
            <strong className="text-dark">&ldquo;{deleteTarget?.taskName}&rdquo;</strong>? This action
            cannot be undone.
          </p>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light btn-sm px-3"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm px-3 d-inline-flex align-items-center gap-2"
              onClick={confirmDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete</span>
              )}
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Clear Completed Confirmation Modal */}
      <Modal
        show={clearCompletedModal}
        onHide={() => !isClearingCompleted && setClearCompletedModal(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton={!isClearingCompleted} className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Clear Completed?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="small text-secondary mb-3">
            Remove all <strong>{counts.completed}</strong> completed{" "}
            {counts.completed === 1 ? "task" : "tasks"} from your list?
          </p>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light btn-sm px-3"
              onClick={() => setClearCompletedModal(false)}
              disabled={isClearingCompleted}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm px-3 d-inline-flex align-items-center gap-2"
              onClick={confirmClearCompleted}
              disabled={isClearingCompleted}
            >
              {isClearingCompleted ? (
                <>
                  <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                  <span>Clearing...</span>
                </>
              ) : (
                <span>Clear All</span>
              )}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default TaskList;
