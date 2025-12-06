import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginContextObj } from "../contexts/LoginContext";
import {useNavigate} from 'react-router-dom'
import { IoLogInOutline } from "react-icons/io5";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { userLogin, loginErrMessage ,loginStatus} = useContext(loginContextObj);
  const navigate=useNavigate()

  //login form submit
  const onLoginFormSubmit = (userCredObj) => {
    console.log(userCredObj);
    userLogin(userCredObj);
  };


  useEffect(()=>{
    if(loginStatus===true){
      //navigate to user profile
      navigate("/user-profile")
    }
  },[loginStatus])

  return (
    <div>
      <h1 className="text-center text-info display-3">User Login</h1>

      {/* display login error message */}
      {
        loginErrMessage.length !== 0 && 
        <p className="fs-3 text-center text-danger">{loginErrMessage}</p>
      }
      {/* registration form */}
      <form className="w-50 mx-auto mt-5" onSubmit={handleSubmit(onLoginFormSubmit)}>
        <div className="mb-3">
          <input type="email" {...register("email", { required: true })} className="form-control" placeholder="Email" />
          {/* email vaildation error messages */}
          {errors.email?.type === "required" && <p className="text-danger">Email is required</p>}
        </div>
        <div className="mb-3">
          <input
            type="password"
            {...register("password", { required: true })}
            className="form-control"
            placeholder="Password"
          />
          {/* name vaildation error messages */}
          {errors.password?.type === "required" && <p className="text-danger">Password is required</p>}
        </div>
        <button type="submit" className="btn btn-success">
          <IoLogInOutline />
        </button>
      </form>
    </div>
  );
}

export default Login;
