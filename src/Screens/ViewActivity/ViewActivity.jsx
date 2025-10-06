
import React, { useState } from "react";
import { viewMemberActivity } from "../../Networking/APIs/ViewActivityApi"; // adjust path
import NoData from "../../../Images/NoData.png";
import userImage from "../../../Images/userImage.jpg"

const ViewActivity = () => {
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalGuards, setTotalGuards] = useState(0);


    const handleFilter = async () => {
        setLoading(true);
       try {
    setLoading(true);
    const filters = {
      status,
      date_from: fromDate,
      date_to: toDate,
    };

    const { members, totalGuards } = await viewMemberActivity(filters);
    setMembers(members);
    setTotalGuards(totalGuards);
  } catch (error) {
    console.error("Error loading members:", error);
  } finally {
    setLoading(false);
  }
    };

    const handleView = (id) => {
        console.log("View member ID:", id);
        
    };

    const handleDelete = (id) => {
        console.log("Delete member ID:", id);
        
    };

    return (
        <div className="container mt-4 mb-5 p-4">
                <p className="text-center text-2xl">Total : {totalGuards}</p>
  <div className="flex flex-col sm:flex-row sm:items-end gap-4">

    <div className="flex-1">
      <label className="block mb-1 text-gray-700 font-medium">Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2"
      >
        <option value="">Select Status</option>
        <option value="approved">Approved</option>
        <option value="not approved">Not Approved</option>
      </select>
    </div>

    <div className="flex-1">
      <label className="block mb-1 text-gray-700 font-medium">Date From</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2"
      />
    </div>

    <div className="flex-1 flex flex-col sm:flex-row sm:items-end gap-2">
      <div className="flex-1">
        <label className="block mb-1 text-gray-700 font-medium">Date To</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      <button
        onClick={handleFilter}
        className="mt-2 sm:mt-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        {loading ? "Loading..." : "Filter"}
      </button>
    </div>
  </div>

  {/* Display section */}
  <div className="mt-6">
    {members.length === 0 ? (
      <div className="d-flex flex-column align-items-center justify-content-center text-center mt-5">
        <img
          src={NoData}
          style={{ maxWidth: "300px" }}
          alt="No Data Found"
          className="img-fluid"
        />
        <h4 className="mt-3 text-muted">No Data Found</h4>
      </div>
    ) : (
      <div className="row">
        {members.map((member) => {
          const isNotApproved = member.status?.toLowerCase() === "not approved";

          return (
            <div className="col-lg-4 col-md-6 mb-4" key={member.id}>
              <div
                className="card approved_card card-hover shadow-sm h-100 border-0"
                style={{ borderRadius: "15px", cursor: "pointer" }}
                onClick={() => handleView(member.id)}
              >
                <div
                  className="card-body p-3 d-flex align-items-center justify-between"
                  style={{
                    background: "linear-gradient(145deg, #fffbe6, #fdf5d3)",
                    borderRadius: "15px",
                  }}
                >
                  <img
                    src={member.profile_image || userImage}
                    alt={`${member.first_name} ${member.last_name}`}
                    className="rounded-circle shadow-sm flex-shrink-0"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      border: isNotApproved
                        ? "3px solid #dc3545"
                        : "3px solid #d4a52e",
                    }}
                  />

                  <div className="ms-3 flex-grow-1">
                    <div className="d-flex justify-content-end mt-2">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member.id);
                        }}
                      >
                        <i className="bi bi-trash me-1"></i>
                      </button>
                    </div>

                    <h5 className="card-title fw-bold mb-1">
                      {member.first_name} {member.last_name}
                    </h5>
                    <h6 className="card-subtitle mb-2 text-muted">
                      <i className="bi bi-geo-alt-fill me-1 text-secondary"></i>
                      {member.country || "N/A"}
                    </h6>

                    <p className="card-text small mt-2 mb-0 text-dark">
                      <i className="bi bi-envelope-fill me-2 text-secondary"></i>
                      {member.email}
                      <br />
                      <i className="bi bi-telephone-fill me-2 text-secondary"></i>
                      {member.cell_phone}
                      <br />
                      
                      {isNotApproved ? (
                        <i className="bi bi-person-x-fill me-2 text-danger"></i>
                      ) : (
                        <i className="bi bi-person-check-fill me-2 text-success"></i>
                      )}
                      {member.status_change_by || "Null"}
                    </p>

            
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</div>

    );
};

export default ViewActivity;


