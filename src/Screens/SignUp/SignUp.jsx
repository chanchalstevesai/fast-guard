
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../Networking/APIs/SignUpApi";
import { getMembers } from "../../Networking/APIs/MemberApi";
import { deleteMember } from "../../Networking/APIs/DeleteMemberApi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignUp = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const { list: members, loading } = useSelector((state) => state.members);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(getMembers());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    try {
      const response =  await dispatch(signupUser(form)).unwrap();
      console.log("Signup success response:", response);
      const successMessage = response?.msg || "Member added successfully!";
      alert(successMessage);
      setForm({ email: "", password: "" });
      dispatch(getMembers());
    }
    catch (error) {
  console.error("Signup failed:", error);
  const errorMessage = error?.msg
  alert(errorMessage);
}

  };

  const handleDeleteMember = (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      dispatch(deleteMember(id)).then(() => {
        dispatch(getMembers());
      });
    }
  };
  const togglePassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fffbe6, #f7e0b5)",
        minHeight: "100vh",
      }}
    >
      <div
        className="p-5 card-body d-flex flex-col gap-4 justify-content-center"
        style={{ maxWidth: "1000px", margin: "auto" }}
      >
        <h2 className="mb-6 text-center text-black fw-bold text-2xl">Add Member</h2>
        <form onSubmit={handleAddMember} autoComplete="off">
          <div className="mb-3 flex flex-row gap-3">
            <div className="d-flex flex-column gap-1 w-50">
              <label className="px-1 font-semibold">Email :</label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={form.email}
                onChange={handleChange}
                required
                className="form-control"
                autoComplete="off"
                style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
            </div>

            <div className="d-flex flex-column gap-1 w-50 position-relative">
              <label className="px-1 font-semibold">Password :</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                value={form.password}
                onChange={handleChange}
                required
                className="form-control"
                style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <span
                onClick={togglePassword}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "42px",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>

            </div>



            <div className="d-flex flex-column justify-end gap-1 w-50">
              <button
                type="submit"
                className="btn btn-primary w-100"
                style={{ padding: "10px", borderRadius: "5px" }}
              >
                Add
              </button>
            </div>
          </div>
        </form>

        <div className="mt-5">
          <h3 className="text-lg font-bold mb-3">Members List</h3>
          {loading ? (
            <p>Loading members...</p>
          ) : (

            <ul className="list-group mt-4 shadow-sm rounded">
              {Array.isArray(members) && members.map((m) => (
                <li
                  key={m.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <span className="fw-bold text-dark">{m.email}</span>
                    {/* <small className="ms-2 text-muted">({m.role})</small> */}
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteMember(m.id)}
                  >
                    <i className="bi bi-trash me-1"></i>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;



