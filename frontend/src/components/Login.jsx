import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { IoLogInOutline } from "react-icons/io5";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { loginContextObj } from "../contexts/loginContextObj";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefillEmail = location.state?.prefillEmail || "";
  const registrationMessage = location.state?.successMessage || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: prefillEmail,
      password: "",
    },
  });

  const {
    userLogin,
    loginErrMessage,
    clearLoginError,
    loginStatus,
    isAuthChecking,
    isLoggingIn,
  } = useContext(loginContextObj);

  const [showPassword, setShowPassword] = useState(false);
  const [slowServerHint, setSlowServerHint] = useState(false);

  useEffect(() => {
    if (!isAuthChecking && loginStatus === true) {
      navigate("/user-profile", { replace: true });
    }
  }, [isAuthChecking, loginStatus, navigate]);

  useEffect(() => {
    return () => {
      clearLoginError();
    };
  }, [clearLoginError]);

  useEffect(() => {
    if (!isLoggingIn) return undefined;
    const timer = setTimeout(() => {
      setSlowServerHint(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [isLoggingIn]);

  const onLoginFormSubmit = async (userCredObj) => {
    setSlowServerHint(false);
    await userLogin(userCredObj);
    setSlowServerHint(false);
  };

  if (isAuthChecking) {
    return (
      <div className="row justify-content-center mt-5">
        <div className="col-md-6 col-lg-5">
          <div className="custom-card text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted fw-medium m-0">Checking your session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center mt-4 mt-md-5">
      <div className="col-md-7 col-lg-5">
        <div className="custom-card">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">Welcome Back</h2>
            <p className="text-muted small">Log in to manage your tasks</p>
          </div>

          {registrationMessage && loginErrMessage.length === 0 && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 small" role="alert">
              <FaCheckCircle className="flex-shrink-0" />
              <span>{registrationMessage}</span>
            </div>
          )}

          {loginErrMessage.length !== 0 && (
            <div className="alert alert-danger text-center py-2 small" role="alert">
              {loginErrMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onLoginFormSubmit)} autoComplete="off" noValidate>
            <div className="mb-3">
              <label htmlFor="login-email" className="form-label fw-semibold text-secondary small">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                disabled={isLoggingIn}
                {...register("email", {
                  required: "Email is required",
                  setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                  maxLength: {
                    value: 100,
                    message: "Email must be 100 characters or fewer",
                  },
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                  onChange: () => {
                    if (loginErrMessage) clearLoginError();
                  },
                })}
                className="form-control form-control-custom"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <small className="text-danger mt-1 d-block">{errors.email.message}</small>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="login-password" className="form-label fw-semibold text-secondary small">
                Password
              </label>
              <div className="input-group">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  disabled={isLoggingIn}
                  {...register("password", {
                    required: "Password is required",
                    onChange: () => {
                      if (loginErrMessage) clearLoginError();
                    },
                  })}
                  className="form-control form-control-custom password-input-with-toggle"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoggingIn}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <small className="text-danger mt-1 d-block">{errors.password.message}</small>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <IoLogInOutline className="fs-4" />
                  <span>Log In</span>
                </>
              )}
            </button>

            {isLoggingIn && slowServerHint && (
              <p className="text-muted text-center small mt-2 mb-0">
                Waking up the server, this may take a few seconds...
              </p>
            )}
          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">Don&apos;t have an account? </span>
            <Link to="/register" className="fw-semibold text-decoration-none small" style={{ color: "var(--primary-color)" }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
