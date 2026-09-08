import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaUserCheck } from "react-icons/fa";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  let [registerErr, setRegisterErr] = useState("");
  const navigate = useNavigate();

  const onFormSubmit = async (newUser) => {
    newUser.todos = [];
    try {
      let res = await axios.post("http://localhost:8000/user-api/user", newUser);
      if (res.status === 201) {
        navigate("/login");
      } else {
        setRegisterErr(res.data.message);
      }
    } catch (err) {
      setRegisterErr(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5">
        <div className="custom-card">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">Create Account</h2>
            <p className="text-muted small">Get started with your task list</p>
          </div>

          {registerErr.length !== 0 && (
            <div className="alert alert-warning text-center py-2" role="alert">
              {registerErr}
            </div>
          )}

          <form onSubmit={handleSubmit(onFormSubmit)} autoComplete="off">
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Full Name</label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="form-control form-control-custom"
                placeholder="Name"
                autoComplete="off"
              />
              {errors.name?.type === "required" && (
                <small className="text-danger mt-1 d-block">Name is required</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Email Address</label>
              <input
                type="email"
                {...register("email", { required: true })}
                className="form-control form-control-custom"
                placeholder="Email"
                autoComplete="off"
              />
              {errors.email?.type === "required" && (
                <small className="text-danger mt-1 d-block">Email is required</small>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">Password</label>
              <input
                type="password"
                {...register("password", { required: true })}
                className="form-control form-control-custom"
                placeholder="Password"
                autoComplete="new-password"
              />
              {errors.password?.type === "required" && (
                <small className="text-danger mt-1 d-block">Password is required</small>
              )}
            </div>

            <button type="submit" className="btn btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2">
              <FaUserCheck className="fs-5" /> Register Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
