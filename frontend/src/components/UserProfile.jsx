import React from "react";
import CreateTask from "./CreateTask";
import TasksList from "./TaskList";

function UserProfile() {
  return (
    <div>
      <div className="row mt-5 text-center">
        <div className="col-sm-6">
          <CreateTask />
        </div>
        <div className="col-sm-6">
          <TasksList />
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
