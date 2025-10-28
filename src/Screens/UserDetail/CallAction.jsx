import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCallAction } from "../../Networking/APIs/CallActionApi";

const CallAction = ({ userId }) => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [attempt, setAttempt] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("");
  const [attempts, setAttempts] = useState([]);

  // Read attempts from user detail in Redux
  const { userData } = useSelector((state) => state.userListSlice);
  

  // Initialize attempts from server response: userData.call_actions.attempts
  useEffect(() => {
    if (userData && userData.call_actions && Array.isArray(userData.call_actions.attempts)) {
      setAttempts(userData.call_actions.attempts);
    } else {
      setAttempts([]);
    }
  }, [userData]);

  const hasAnyAnswer = attempts.some((a) => a.call_status === "Answer");
  const usedAttemptNos = new Set(attempts.map((a) => a.attempt_no));

  // Handle Add button click
  const handleAdd = () => {
    if (attempts.length >= 3 || hasAnyAnswer) return;
    setIsAdding(true);
    setAttempt("");
    setTime("");
    setStatus("");
  };

  // Handle Save button click
  const handleSave = () => {
    if (!attempt || !time || !status) {
      alert("Please fill all fields before saving!");
      return;
    }
    if (!userId) {
      alert("User ID is missing. Please reload the page and try again.");
      return;
    }

    // Map dropdown to numeric attempt_no
    const attemptNoMap = {
      "First Attempt": 1,
      "Second Attempt": 2,
      "Last Attempt": 3,
    };
    const today = new Date().toISOString().split("T")[0];
    const timestamp = `${today}T${time}`;
    const attemptObj = {
      timestamp,
      attempt_no: attemptNoMap[attempt] || attempts.length + 1,
      call_status: status,
    };

    // Prevent duplicate attempt numbers when selecting manually
    if (usedAttemptNos.has(attemptObj.attempt_no)) {
      alert("This attempt has already been recorded. Please choose a different attempt.");
      return;
    }
    // New full array for the session, append this one
    const updatedAttempts = [...attempts, attemptObj];
    const apiBody = {
      guard_id: userId,
      attempts: updatedAttempts,
    };
    dispatch(addCallAction(apiBody))
      .unwrap()
      .then((res) => {
        // Hard reload to refetch /guard?id={userId} and refresh UI from server
        window.location.reload();
      })
      .catch((err) => {
        console.error("❌ Error saving Call Action:", err);
        alert("Failed to save Call Action!");
      });
  };

  return (
    <div className="w-[1000px] bg-white shadow-md rounded-lg p-4">
      {/* Heading */}
      <div className="position-relative mb-4 text-center">
        <h4 className="fw-bold text-dark mb-0">
          <i className="bi bi-telephone-fill me-2 text-success"></i>
          CALL ACTION
        </h4>
        <hr className="w-75 mx-auto border-success mt-2" />
      </div>
      {/* Timeline Container */}
      <div className="position-relative border-start border-success" style={{ minHeight: "50px" }}>
        {/* Timeline dots and items */}
        {attempts.map((item, index) => (
          <div key={index} className="mb-4 position-relative">
            <div
              className="position-absolute bg-success rounded-circle"
              style={{
                width: "10px",
                height: "10px",
                left: "-6px",
                top: "8px",
              }}
            ></div>
            <div className="ms-3">
              <p className="mb-1 fw-semibold text-dark">
                {(() => {
                  const n = item.attempt_no || index + 1;
                  const label = n === 1 ? "First Attempt" : n === 2 ? "Second Attempt" : n === 3 ? "Last Attempt" : `Attempt ${n}`;
                  return `${label} at ${item.timestamp} — `;
                })()}
                <span className={item.call_status === "Answer" ? "text-success" : "text-danger"}>
                  {item.call_status}
                </span>
              </p>
            </div>
          </div>
        ))}
        {/* Add form */}
        {isAdding && (
          <div className="d-flex align-items-center gap-1 ms-3 mb-3">
            <select
              className="form-select"
              style={{ width: "150px" }}
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
            >
              <option value="">Attempt</option>
              <option value="First Attempt" disabled={usedAttemptNos.has(1)}>First Attempt</option>
              <option value="Second Attempt" disabled={usedAttemptNos.has(2)}>Second Attempt</option>
              <option value="Last Attempt" disabled={usedAttemptNos.has(3)}>Last Attempt</option>
            </select>
            <input
              type="time"
              className="form-control"
              style={{ width: "120px" }}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: "130px" }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Status</option>
              <option value="Answer">Answer</option>
              <option value="No Answer">No Answer</option>
            </select>
            <button
              onClick={handleSave}
              className="btn btn-outline-success fw-semibold"
            >
              Save
            </button>
          </div>
        )}
        {/* Add Button (Show only when last attempt = No Answer OR no data) */}
        {!isAdding && attempts.length < 3 && !hasAnyAnswer && (
          <div className="ms-3 mb-3">
            <button
              onClick={handleAdd}
              className="btn btn-success btn-sm fw-semibold"
            >
              + Add
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default CallAction;
