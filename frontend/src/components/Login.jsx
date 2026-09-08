import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginContextObj } from "../contexts/LoginContext";
import { useNavigate } from "react-router-dom";
import { IoLogInOutline } from "react-icons/io5";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { userLogin, loginErrMessage, loginStatus } = useContext(loginContextObj);
  const navigate = useNavigate();

  const onLoginFormSubmit = (userCredObj) => {
    userLogin(userCredObj);
  };

  useEffect(() => {
    if (loginStatus === true) {
      navigate("/user-profile");
    }
  }, [loginStatus, navigate]);

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5">
        <div className="custom-card">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">Welcome Back</h2>
            <p className="text-muted small">Log in to manage your tasks</p>
          </div>

          {loginErrMessage.length !== 0 && (
            <div className="alert alert-danger text-center py-2" role="alert">
              {loginErrMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onLoginFormSubmit)} autoComplete="off">
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
              <IoLogInOutline className="fs-4" /> Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
