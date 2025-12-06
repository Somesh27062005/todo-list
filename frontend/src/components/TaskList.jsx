import { useContext, useState } from "react";
import { loginContextObj } from "../contexts/LoginContext";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { CiEdit } from "react-icons/ci";


function TaskList() {
  const { currentUser, setCurrentUser } = useContext(loginContextObj);
  const { register, handleSubmit, setValue } = useForm();

  //modal state
  const [modalState, setModalState] = useState(false);

  const [taskBeingEdited, setTaskBeingEdited] = useState(null);

  const openModal = (taskObj) => {
    setModalState(true);
    setValue("taskName", taskObj.taskName);
    setValue("description", taskObj.description);
    setTaskBeingEdited(taskObj);
  };
  const closeModal = () => {
    setModalState(false);
  };

  //save modified task
  const saveModifiedTask = async (modifiedTaskObj) => {
    let res = await axios.put(
      `http://localhost:8000/user-api/edit-todo/userid/${currentUser._id}/taskid/${taskBeingEdited._id}`,
      modifiedTaskObj,
      {
        withCredentials: true,
      }
    );

    console.log("res is ", res);

    if (res.status === 200) {
      setCurrentUser(res.data.payload);
      //close modal
      closeModal();
    }
  };

  const setTaskCompleted = async (taskid) => {
    let res = await axios.put(
      `http://localhost:8000/user-api/edit-status/userid/${currentUser._id}/taskid/${taskid}`,
      null,
      { withCredentials: true }
    );
    console.log(res);
    if (res.status === 200) {
      setCurrentUser(res.data.payload);
    }
  };

  //delete a task
  const deleteTask = async (taskid) => {
    let res = await axios.put(`http://localhost:8000/user-api/delete-todo/userid/${currentUser._id}/taskid/${taskid}`);
    if (res.status === 200) {
      setCurrentUser(res.data.payload);
    }
  };

  return (
    <div className="mt-4">
      <h1>List of Tasks</h1>
      {currentUser?.todos.map((todoObj) => (
        <div className="mb-3 border border-2 p-3" key={todoObj._id}>
          {/* edit button */}
          <div className="text-start">
            <button className="btn btn-primary" onClick={() => openModal(todoObj)}>
              <CiEdit />
            </button>
          </div>
          <div className="text-end mb-2">
            <button className="btn btn-close" onClick={() => deleteTask(todoObj._id)}></button>
          </div>
          <div className="text-end">
            <button className="bg-warning border-0 rounded ">{todoObj.status}</button>
          </div>
          <h2>{todoObj.taskName}</h2>
          <small>{todoObj.description}</small>
          <div className="text-end mt-2">
            {/* display this button only when status is pending, otherwise remove it */}
            {todoObj.status === "pending" && (
              <button className="btn btn-success" onClick={() => setTaskCompleted(todoObj._id)}>
                Mark as completed
              </button>
            )}
          </div>
        </div>
      ))}

      {/* modal */}
      <Modal show={modalState} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(saveModifiedTask)}>
            <input type="text" {...register("taskName")} className="form-control mb-3" />
            <input type="text" {...register("description")} className="form-control mb-3" />
            <button type="submit" className="btn btn-success">
              save
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default TaskList;
