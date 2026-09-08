import { useContext, useState } from "react";
import { loginContextObj } from "../contexts/LoginContext";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaEdit, FaTrash, FaCheck, FaTasks, FaInbox, FaClock } from "react-icons/fa";

function TaskList() {
  const { currentUser, setCurrentUser } = useContext(loginContextObj);
  const { register, handleSubmit, setValue } = useForm();

  const [modalState, setModalState] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openModal = (taskObj) => {
    setModalState(true);
    setValue("taskName", taskObj.taskName);
    setValue("description", taskObj.description);
    setTaskBeingEdited(taskObj);
  };

  const closeModal = () => {
    setModalState(false);
  };

  const saveModifiedTask = async (modifiedTaskObj) => {
    if (!currentUser?._id || !taskBeingEdited?._id) return;
    let res = await axios.put(
      `http://localhost:8000/user-api/edit-todo/userid/${currentUser._id}/taskid/${taskBeingEdited._id}`,
      modifiedTaskObj,
      { withCredentials: true }
    );

    if (res.status === 200) {
      setCurrentUser(res.data.payload);
      closeModal();
    }
  };

  const setTaskCompleted = async (taskid) => {
    if (!currentUser?._id) return;
    let res = await axios.put(
      `http://localhost:8000/user-api/edit-status/userid/${currentUser._id}/taskid/${taskid}`,
      null,
      { withCredentials: true }
    );
    if (res.status === 200) {
      setCurrentUser(res.data.payload);
    }
  };

  const deleteTask = async (taskid) => {
    if (!currentUser?._id) return;
    let res = await axios.put(
      `http://localhost:8000/user-api/delete-todo/userid/${currentUser._id}/taskid/${taskid}`,
      null,
      { withCredentials: true }
    );
    if (res.status === 200) {
      setCurrentUser(res.data.payload);
    }
  };

  const todos = currentUser?.todos || [];

  return (
    <div className="custom-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold m-0 d-flex align-items-center gap-2">
          <FaTasks className="text-primary" /> My Tasks
        </h3>
        <span className="badge bg-primary rounded-pill px-3 py-2">
          {todos.length} {todos.length === 1 ? "Task" : "Tasks"}
        </span>
      </div>

      {todos.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaInbox className="display-4 mb-2 text-secondary opacity-50" />
          <p className="m-0 fw-semibold">No tasks found</p>
          <small>Create your first task to get started!</small>
        </div>
      ) : (
        todos.map((todoObj) => (
          <div
            className={`task-item-card ${
              todoObj.status === "completed" ? "task-completed-card" : ""
            }`}
            key={todoObj._id}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span
                className={
                  todoObj.status === "completed" ? "badge-completed d-inline-flex align-items-center gap-1" : "badge-pending"
                }
              >
                {todoObj.status === "completed" ? (
                  <>
                    <FaCheck /> Completed
                  </>
                ) : (
                  "Pending"
                )}
              </span>

              <div className="d-flex gap-1">
                {todoObj.status === "pending" && (
                  <button
                    className="btn btn-sm btn-outline-primary border-0 rounded-circle"
                    title="Edit task"
                    onClick={() => openModal(todoObj)}
                  >
                    <FaEdit />
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                  title="Delete task"
                  onClick={() => deleteTask(todoObj._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <h5
              className={`fw-bold mb-1 ${
                todoObj.status === "completed"
                  ? "text-decoration-line-through text-muted opacity-75"
                  : ""
              }`}
            >
              {todoObj.taskName}
            </h5>
            <p
              className={`small mb-3 ${
                todoObj.status === "completed"
                  ? "text-decoration-line-through text-muted opacity-75"
                  : "text-secondary"
              }`}
            >
              {todoObj.description}
            </p>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-light">
              <small className="text-muted d-flex align-items-center gap-1 opacity-75" style={{ fontSize: "0.75rem" }}>
                <FaClock />
                {todoObj.createdAt && `Created ${formatDate(todoObj.createdAt)}`}
                {todoObj.status === "completed" && todoObj.completedAt && ` • Completed ${formatDate(todoObj.completedAt)}`}
              </small>

              {todoObj.status === "pending" && (
                <button
                  className="btn btn-sm btn-success d-inline-flex align-items-center gap-1 rounded-pill px-3"
                  onClick={() => setTaskCompleted(todoObj._id)}
                >
                  <FaCheck /> Mark as completed
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Edit Modal */}
      <Modal show={modalState} onHide={closeModal} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <form onSubmit={handleSubmit(saveModifiedTask)}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Task Title</label>
              <input
                type="text"
                {...register("taskName", { required: true })}
                className="form-control form-control-custom"
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">Description</label>
              <textarea
                rows="3"
                {...register("description", { required: true })}
                className="form-control form-control-custom"
              ></textarea>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light px-4" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary-custom px-4">
                Save Changes
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default TaskList;
