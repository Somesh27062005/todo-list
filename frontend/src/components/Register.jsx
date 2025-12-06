import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  let [registerErr, setRegisterErr] = useState("");

  const navigate = useNavigate();

  //function to form submit
  const onFormSubmit = async (newUser) => {
    newUser.todos = [];
    console.log(newUser);
    try {
      //Make HTTP POST req tio create new User in Backend
      let res = await axios.post("http://localhost:8000/user-api/user", newUser);
      console.log("res is ", res);
      //if resourse is created
      if (res.status === 201) {
        //naviagte to login component programatically
        navigate("/login");
      } else {
        //display error message
        console.log(res.data.message);
      }
    } catch (err) {
      console.log("err is ", err.response.data.message);
      setRegisterErr(err.response.data.message);
    }
  };

  return (
    <div>
      <h1 className="text-center text-info display-3">User Registration</h1>

      {/* display registration error message */}
      {registerErr.length !== 0 && <p className="fs-3 text-warning text-center">{registerErr}</p>}
      {/* registration form */}
      <form className="w-50 mx-auto mt-5" onSubmit={handleSubmit(onFormSubmit)}>
        <div className="mb-3">
          <input type="text" {...register("name", { required: true })} className="form-control" placeholder="Name" />
          {/* name vaildation error messages */}
          {errors.name?.type === "required" && <p className="text-danger">Name is required</p>}
        </div>
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
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
