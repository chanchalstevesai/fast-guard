import React, { useState } from "react";

const CallAction = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [attempt, setAttempt] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("");
  const [savedData, setSavedData] = useState(null);

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!attempt || !time || !status) {
      alert("Please fill all fields before saving!");
      return;
    }

    // Save the data (API call can go here)
    const newData = { attempt, time, status };
    setSavedData(newData);

    // Reset states
    setIsAdding(false);
  };

  return (
    <div className="w-[550px] bg-white shadow-md rounded-lg p-4">
      {/* Heading */}
      <div className="position-relative mb-4 text-center">
        <h4 className="fw-bold text-dark mb-0">
          <i className="bi bi-telephone-fill me-2 text-success"></i>
          CALL ACTION
        </h4>
        <hr className="w-75 mx-auto border-success mt-2" />
      </div>

      {/* Add Button (initial state) */}
      {!isAdding && !savedData && (
        <div className="text-end mb-3">
          <button
            onClick={handleAdd}
            className="btn btn-success btn-sm fw-semibold"
          >
            + Add
          </button>
        </div>
      )}

      {/* Form Row */}
      {isAdding && (
        <div className="d-flex align-items-center gap-3 flex-wrap">
          {/* Attempt Dropdown */}
          <select
            className="form-select"
            style={{ width: "150px" }}
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
          >
            <option value="">Select Attempt</option>
            <option value="First Attempt">First Attempt</option>
            <option value="Second Attempt">Second Attempt</option>
            <option value="Last Attempt">Last Attempt</option>
          </select>

          {/* Time Picker */}
          <input
            type="time"
            className="form-control"
            style={{ width: "120px" }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          {/* Status Dropdown */}
          <select
            className="form-select"
            style={{ width: "130px" }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Answer">Answer</option>
            <option value="No Answer">No Answer</option>
          </select>

          {/* Save Button */}
          <button onClick={handleSave} className="btn btn-outline-success fw-semibold">
            Save
          </button>
        </div>
      )}

      {/* After Save — Summary View */}
      {savedData && (
        <div className="mt-4 border rounded p-3 bg-light">
          <p className="mb-0 fw-semibold text-dark">
            {savedData.attempt} at {savedData.time} —{" "}
            <span
              className={
                savedData.status === "Answer" ? "text-success" : "text-danger"
              }
            >
              {savedData.status}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CallAction;
