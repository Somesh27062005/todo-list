import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { loginContextObj } from "../contexts/loginContextObj";
import { API_BASE_URL } from "../config";

const DEFAULT_TASK_VALUES = {
  taskName: "",
  description: "",
  dueDate: "",
};

function CreateTask() {
  const { currentUser, setCurrentUser, handleSessionExpired, showToast } =
    useContext(loginContextObj);

  const [isCreating, setIsCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: DEFAULT_TASK_VALUES,
  });

  const onSubmitNewTask = async (newTask) => {
    if (!currentUser?._id || isCreating) return;

    setCreateErr("");
    setIsCreating(true);

    const payload = {
      taskName: newTask.taskName.trim(),
      description: newTask.description.trim(),
      dueDate: newTask.dueDate,
    };

    try {
      const res = await axios.put(
        `${API_BASE_URL}/user-api/todo/${currentUser._id}`,
        payload,
        { withCredentials: true }
      );
      if (res.status === 200 && res.data?.payload) {
        setCurrentUser(res.data.payload);
        reset(DEFAULT_TASK_VALUES);
        showToast("Task added successfully!", "success");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleSessionExpired();
      } else {
        setCreateErr(err.response?.data?.message || "Failed to add task. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="custom-card mb-4 mb-md-0">
      <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
        <FaPlusCircle className="text-primary" /> Create New Task
      </h4>
      <p className="text-muted small mb-4">Add a new item to your personal to-do list</p>

      {createErr && (
        <div className="alert alert-danger py-2 small" role="alert">
          {createErr}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmitNewTask)} noValidate>
        <div className="mb-3">
          <label htmlFor="create-task-title" className="form-label fw-semibold text-secondary small">
            Task Title <span className="text-danger">*</span>
          </label>
          <input
            id="create-task-title"
            type="text"
            disabled={isCreating}
            {...register("taskName", {
              required: "Task title is required",
              validate: (value) => value.trim().length > 0 || "Task title cannot be empty",
              maxLength: {
                value: 120,
                message: "Task title must be 120 characters or fewer",
              },
              onChange: () => {
                if (createErr) setCreateErr("");
              },
            })}
            className="form-control form-control-custom"
            placeholder="e.g., Prepare sprint review slides"
          />
          {errors?.taskName && (
            <small className="text-danger mt-1 d-block">{errors.taskName.message}</small>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="create-task-desc" className="form-label fw-semibold text-secondary small">
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            id="create-task-desc"
            rows="3"
            disabled={isCreating}
            {...register("description", {
              required: "Task description is required",
              validate: (value) => value.trim().length > 0 || "Task description cannot be empty",
              maxLength: {
                value: 500,
                message: "Description must be 500 characters or fewer",
              },
              onChange: () => {
                if (createErr) setCreateErr("");
              },
            })}
            className="form-control form-control-custom"
            placeholder="Add notes, links, or details..."
          ></textarea>
          {errors?.description && (
            <small className="text-danger mt-1 d-block">{errors.description.message}</small>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="create-task-due" className="form-label fw-semibold text-secondary small">
            Due Date <span className="text-danger">*</span>
          </label>
          <input
            id="create-task-due"
            type="date"
            disabled={isCreating}
            {...register("dueDate", {
              required: "Due date is required",
              onChange: () => {
                if (createErr) setCreateErr("");
              },
            })}
            className="form-control form-control-custom"
          />
          {errors?.dueDate && (
            <small className="text-danger mt-1 d-block">{errors.dueDate.message}</small>
          )}
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="btn btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2"
        >
          {isCreating ? (
            <>
              <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
              <span>Adding Task...</span>
            </>
          ) : (
            <>
              <FaPlusCircle className="fs-5" />
              <span>Add Task</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CreateTask;
