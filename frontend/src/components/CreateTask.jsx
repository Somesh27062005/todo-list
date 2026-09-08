import { useForm } from "react-hook-form";
import { useContext } from "react";
import { loginContextObj } from "../contexts/LoginContext";
import axios from "axios";
import { FaPlusCircle } from "react-icons/fa";

function CreateTask() {
  const { currentUser, setCurrentUser } = useContext(loginContextObj);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmitNewtask = async (newTask) => {
    if (!currentUser?._id) return;
    try {
      let res = await axios.put(
        `http://localhost:8000/user-api/todo/${currentUser._id}`,
        newTask,
        { withCredentials: true }
      );
      if (res.data.message === "todo added") {
        setCurrentUser(res.data.payload);
        reset();
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  return (
    <div className="custom-card mb-4 mb-md-0">
      <h3 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <FaPlusCircle className="text-primary" /> Create New Task
      </h3>
      <p className="text-muted small mb-4">Add a new item to your personal to-do list</p>

      <form onSubmit={handleSubmit(onSubmitNewtask)}>
        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary small">Task Title</label>
          <input
            type="text"
            {...register("taskName", { required: true })}
            className="form-control form-control-custom"
            placeholder="Task Title"
          />
          {errors?.taskName?.type === "required" && (
            <small className="text-danger mt-1 d-block">Task title is required</small>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Description</label>
          <textarea
            rows="3"
            {...register("description", { required: true })}
            className="form-control form-control-custom"
            placeholder="Task Description"
          ></textarea>
          {errors?.description?.type === "required" && (
            <small className="text-danger mt-1 d-block">Task description is required</small>
          )}
        </div>

        <button type="submit" className="btn btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2">
          <FaPlusCircle className="fs-5" /> Add Task
        </button>
      </form>
    </div>
  );
}

export default CreateTask;
