import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

//create context object
export const loginContextObj = createContext();

function LoginContext({ children }) {
  //state
  const [loginStatus, setLoginStatus] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginErrMessage, setLoginErrorMessage] = useState("");

  const pageRefresh = async () => {
    try {
      let res = await axios.get(`${API_BASE_URL}/refresh`, {
        withCredentials: true,
      });

      if (res.data?.payload) {
        setCurrentUser(res.data.payload);
        setLoginStatus(true);
        setLoginErrorMessage("");
      }
    } catch (err) {
      setLoginStatus(false);
      setCurrentUser(null);
      if (err.response?.status !== 401) {
        console.log("Error in page refresh: ", err?.response?.data?.message || err.message);
      }
    }
  };

  //user login
  const userLogin = async (userCredObj) => {
    try {
      let res = await axios.post(`${API_BASE_URL}/user-api/login`, userCredObj, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setCurrentUser(res.data.payload);
        setLoginStatus(true);
        setLoginErrorMessage("");
      }
    } catch (err) {
      let msg = err.response?.data?.message || "Login failed";
      console.log("err is ", msg);
      setLoginErrorMessage(msg);
    }
  };

  useEffect(() => {
    pageRefresh();
  }, []);

  //user logout
  const userLogout = async () => {
    try {
      let res = await axios.get(`${API_BASE_URL}/user-api/logout`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setLoginStatus(false);
        setCurrentUser(null);
        setLoginErrorMessage("");
      }
    } catch (err) {
      console.error("Logout error:", err);
      setLoginStatus(false);
      setCurrentUser(null);
    }
  };

  console.log("Current user is ", currentUser);
  console.log("login err is ",loginErrMessage)

  return (
    <loginContextObj.Provider value={{ loginStatus, currentUser, setCurrentUser,loginErrMessage, userLogin, userLogout }}>
      {children}
    </loginContextObj.Provider>
  );
}

export default LoginContext;
