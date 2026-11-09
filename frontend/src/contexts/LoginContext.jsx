import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { loginContextObj } from "./loginContextObj";

const ContextProvider = loginContextObj.Provider;

function LoginContext({ children }) {
  const [loginStatus, setLoginStatus] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginErrMessage, setLoginErrorMessage] = useState("");
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearLoginError = useCallback(() => {
    setLoginErrorMessage("");
  }, []);

  const handleSessionExpired = useCallback(() => {
    setLoginStatus(false);
    setCurrentUser(null);
    setLoginErrorMessage("Your session expired. Please log in again.");
    showToast("Session expired. Please log in again.", "warning");
  }, [showToast]);

  // Verify existing HTTP-only cookie session on initial load
  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/refresh`, {
          withCredentials: true,
        });

        if (active && res.data?.payload) {
          setCurrentUser(res.data.payload);
          setLoginStatus(true);
          setLoginErrorMessage("");
        }
      } catch (err) {
        if (active) {
          setLoginStatus(false);
          setCurrentUser(null);
          if (err.response?.status && err.response.status !== 401) {
            console.error("Error restoring session:", err?.response?.data?.message || err.message);
          }
        }
      } finally {
        if (active) {
          setIsAuthChecking(false);
        }
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  // User login
  const userLogin = async (userCredObj) => {
    if (isLoggingIn) return false;

    setLoginErrorMessage("");
    setIsLoggingIn(true);

    try {
      const payload = {
        email: userCredObj.email?.trim().toLowerCase(),
        password: userCredObj.password,
      };
      const res = await axios.post(`${API_BASE_URL}/user-api/login`, payload, {
        withCredentials: true,
      });

      if (res.status === 200 && res.data?.payload) {
        setCurrentUser(res.data.payload);
        setLoginStatus(true);
        setLoginErrorMessage("");
        showToast(`Welcome back, ${res.data.payload.name || "User"}!`, "success");
        return true;
      }
      return false;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Cannot reach the server right now. Please try again in a moment."
          : "Login failed. Please check your credentials.");
      setLoginErrorMessage(msg);
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  // User logout
  const userLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await axios.get(`${API_BASE_URL}/user-api/logout`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoginStatus(false);
      setCurrentUser(null);
      setLoginErrorMessage("");
      setIsLoggingOut(false);
      showToast("You have been logged out.", "info");
    }
  };

  return (
    <ContextProvider
      value={{
        loginStatus,
        currentUser,
        setCurrentUser,
        loginErrMessage,
        clearLoginError,
        isAuthChecking,
        isLoggingIn,
        isLoggingOut,
        userLogin,
        userLogout,
        handleSessionExpired,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </ContextProvider>
  );
}

export default LoginContext;
