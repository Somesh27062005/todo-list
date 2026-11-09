import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { FaUserCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from "../config";
import { loginContextObj } from "../contexts/loginContextObj";

function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { loginStatus, isAuthChecking } = useContext(loginContextObj);
  const [registerErr, setRegisterErr] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [slowServerHint, setSlowServerHint] = useState(false);
  const navigate = useNavigate();

  const passwordValue = watch("password", "");

  useEffect(() => {
    if (!isAuthChecking && loginStatus === true) {
      navigate("/user-profile", { replace: true });
    }
  }, [isAuthChecking, loginStatus, navigate]);

  useEffect(() => {
    if (!isRegistering) return undefined;
    const timer = setTimeout(() => {
      setSlowServerHint(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [isRegistering]);

  const onFormSubmit = async (formData) => {
    if (isRegistering) return;

    setRegisterErr("");
    setSlowServerHint(false);
    setIsRegistering(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/user-api/user`, payload);
      if (res.status === 201) {
        navigate("/login", {
          state: {
            successMessage: "Account created successfully! Please log in.",
            prefillEmail: payload.email,
          },
        });
      } else {
        setRegisterErr(res.data?.message || "Registration failed");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Cannot reach the server right now. Please try again in a moment."
          : "Registration failed");
      setRegisterErr(msg);
    } finally {
      setIsRegistering(false);
      setSlowServerHint(false);
    }
  };

  return (
    <div className="row justify-content-center mt-4 mt-md-5">
      <div className="col-md-7 col-lg-5">
        <div className="custom-card">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">Create Account</h2>
            <p className="text-muted small">Get started with your personal task list</p>
          </div>

          {registerErr.length !== 0 && (
            <div className="alert alert-danger text-center py-2 small" role="alert">
              {registerErr}
            </div>
          )}

          <form onSubmit={handleSubmit(onFormSubmit)} autoComplete="off" noValidate>
            <div className="mb-3">
              <label htmlFor="register-name" className="form-label fw-semibold text-secondary small">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                disabled={isRegistering}
                {...register("name", {
                  required: "Name is required",
                  validate: (value) =>
                    value.trim().length >= 2 || "Name must be at least 2 characters",
                  onChange: () => {
                    if (registerErr) setRegisterErr("");
                  },
                })}
                className="form-control form-control-custom"
                placeholder="John Doe"
                autoComplete="name"
              />
              {errors.name && (
                <small className="text-danger mt-1 d-block">{errors.name.message}</small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="register-email" className="form-label fw-semibold text-secondary small">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                disabled={isRegistering}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                  onChange: () => {
                    if (registerErr) setRegisterErr("");
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

            <div className="mb-3">
              <label htmlFor="register-password" className="form-label fw-semibold text-secondary small">
                Password
              </label>
              <div className="input-group">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  disabled={isRegistering}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    onChange: () => {
                      if (registerErr) setRegisterErr("");
                    },
                  })}
                  className="form-control form-control-custom password-input-with-toggle"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isRegistering}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <small className="text-danger mt-1 d-block">{errors.password.message}</small>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="register-confirm-password" className="form-label fw-semibold text-secondary small">
                Confirm Password
              </label>
              <div className="input-group">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  disabled={isRegistering}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === passwordValue || "Passwords do not match",
                    onChange: () => {
                      if (registerErr) setRegisterErr("");
                    },
                  })}
                  className="form-control form-control-custom password-input-with-toggle"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={isRegistering}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <small className="text-danger mt-1 d-block">{errors.confirmPassword.message}</small>
              )}
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="btn btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2"
            >
              {isRegistering ? (
                <>
                  <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <FaUserCheck className="fs-5" />
                  <span>Register Now</span>
                </>
              )}
            </button>

            {isRegistering && slowServerHint && (
              <p className="text-muted text-center small mt-2 mb-0">
                Waking up the server, this may take a few seconds...
              </p>
            )}
          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">Already have an account? </span>
            <Link to="/login" className="fw-semibold text-decoration-none small" style={{ color: "var(--primary-color)" }}>
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
