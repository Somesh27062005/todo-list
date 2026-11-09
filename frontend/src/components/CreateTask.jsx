import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { loginContextObj } from "../contexts/loginContextObj";
import { API_BASE_URL } from "../config";
import { TASK_CATEGORIES, PRIORITY_OPTIONS } from "../constants/tasks";

const DEFAULT_TASK_VALUES = {
  taskName: "",
  description: "",
  priority: "medium",
  category: "General",
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
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: DEFAULT_TASK_VALUES,
  });

  const selectedPriority = watch("priority", "medium");

  const onSubmitNewTask = async (newTask) => {
    if (!currentUser?._id || isCreating) return;

    setCreateErr("");
    setIsCreating(true);

    const payload = {
      taskName: newTask.taskName.trim(),
      description: newTask.description?.trim() || "",
      priority: newTask.priority || "medium",
      category: newTask.category || "General",
      dueDate: newTask.dueDate || null,
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
      <p className="text-muted small mb-4">Organize your work with priority, category, and due date</p>

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
            Description <span className="text-muted fw-normal">(optional)</span>
          </label>
          <textarea
            id="create-task-desc"
            rows="3"
            disabled={isCreating}
            {...register("description", {
              maxLength: {
                value: 500,
                message: "Description must be 500 characters or fewer",
              },
            })}
            className="form-control form-control-custom"
            placeholder="Add notes, links, or details..."
          ></textarea>
          {errors?.description && (
            <small className="text-danger mt-1 d-block">{errors.description.message}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary small d-block">Priority</label>
          <div className="d-flex gap-2">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={isCreating}
                onClick={() => setValue("priority", option.value)}
                className={`priority-pill-btn ${
                  selectedPriority === option.value ? `active-${option.value}` : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input type="hidden" {...register("priority")} />
        </div>

        <div className="row g-2 mb-4">
          <div className="col-sm-6">
            <label htmlFor="create-task-category" className="form-label fw-semibold text-secondary small">
              Category
            </label>
            <select
              id="create-task-category"
              disabled={isCreating}
              {...register("category")}
              className="form-select form-select-custom"
            >
              {TASK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="col-sm-6">
            <label htmlFor="create-task-due" className="form-label fw-semibold text-secondary small">
              Due Date <span className="text-muted fw-normal">(optional)</span>
            </label>
            <input
              id="create-task-due"
              type="date"
              disabled={isCreating}
              {...register("dueDate")}
              className="form-control form-control-custom"
            />
          </div>
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
