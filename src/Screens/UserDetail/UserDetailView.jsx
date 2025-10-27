import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApprovedSubmitApi } from "../../Networking/APIs/ApprovedApi";
import Loader from "../../Component/Loader";
import {
  GetuserDetail,
  GetuserList,
  NotesDetailSubmit,
} from "../../Networking/APIs/UserGetDetails";
import { toast } from "react-toastify";
import PassportUploadForm from "../../PassportForm";
import { useDashboard } from "../../Context/DashboardContext";
import { DeleteUserApi } from "../../Networking/APIs/ApprovedApi";


export const UserDetailView = () => {
  const { id } = useParams();

  // Hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { actions } = useDashboard();

  // Redux
  const { userData } = useSelector((state) => state.userListSlice);

  // States
  const [showModal, setShowModal] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        await dispatch(GetuserDetail({ id })).unwrap();
      } catch (error) {
        console.error("Failed to load user details:", error);
        toast.error("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, id]);

  useEffect(() => {
    if (userData?.notes) {
      setNote(userData.notes);
    }
  }, [userData]);


  const handleDeleteGuard = async (id) => {
  if (!id) {
    toast.warning("Guard ID not found!");
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this guard?"
  );
  if (!confirmDelete) return;

  try {
    // Dispatch delete API thunk
    await dispatch(DeleteUserApi(id)).unwrap();


    // Show success feedback
    toast.success("Guard deleted successfully!");

    // Navigate back to dashboard or list page
    navigate("/dashboard");
  } catch (error) {
    console.error("Delete Guard Failed:", error);
    toast.error(
      error?.message || "Failed to delete guard. Please try again later."
    );
  }
};

  const handleFilePreview = (user) => {
    const { resume, file_type, file_name } = user;

    if (!resume || !file_type || !file_name) {
      toast.warn("File data is not available for preview.");
      return;
    }

    const mimeToExtMap = {
      "application/pdf": "pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "application/msword": "doc",
      "image/png": "png",
      "image/jpeg": "jpg",
      "text/html": "html",
    };

    const extension = mimeToExtMap[file_type.toLowerCase()] || "bin";
    const cleanFileName = file_name.includes(".")
      ? file_name.split(".")[0]
      : file_name;

    const byteCharacters = atob(resume);
    const byteNumbers = Array.from(byteCharacters).map((c) => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: file_type });
    const blobUrl = URL.createObjectURL(blob);

    if (
      ["application/pdf", "image/png", "image/jpeg", "text/html"].includes(
        file_type
      )
    ) {
      window.open(blobUrl, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${cleanFileName}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  const handleSaveNote = async () => {
    if (!note.trim()) {
      toast.warning("Note cannot be empty.");
      return;
    }
    setSavingNote(true);
    try {
      const payload = { id: userData.id, notes: note };
      await dispatch(NotesDetailSubmit(payload)).unwrap();
      await dispatch(GetuserDetail({ id })).unwrap();
      toast.success("Note saved successfully.");
    } catch (err) {
      toast.error(err.message || "Error saving note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleApproveClick = () => {
    setShowModal(true);
  };

  const handleConfirmApprove = async (id) => {
    setIsApproving(true);
    try {
      const res = await dispatch(
        ApprovedSubmitApi({
          status: "approved",
          id,
          date: new Date().toISOString(),
        })
      ).unwrap();
      if (res.msg === "Data inserted in Zoho CRM with file(s)") {
        setApproved(true);
        toast.success(
          "User approved successfully! Please upload the badge ID."
        );
        dispatch(GetuserList());
      } else {
        setApproved(true);
        toast.info(res.msg || "Approval process returned a notice.");
      }
    } catch (error) {
      console.error("Approval failed:", error);
      const errorMessage = error?.details
        ? "Zoho Access token Expired"
        : "An error occurred during approval.";
      toast.error(errorMessage);
      handleCloseModal();
    } finally {
      setIsApproving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setApproved(false);
  };

  const handleDecline = async (id) => {
    setDeclined(true);
    try {
      await dispatch(
        ApprovedSubmitApi({
          status: "not approved",
          id,
          date: new Date().toISOString(),
        })
      ).unwrap();
      toast.success("User declined successfully.");
      setTimeout(() => {
        setShowDeclineModal(false);
        actions.setReturningFromDetail(true);
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Decline failed:", error);
      const errorMessage =
        error?.message || error?.error || "Decline failed. Please try again.";
      toast.error(errorMessage);
      setDeclined(false);
    }
  };

  const handleBackToDashboard = () => {
    actions.setReturningFromDetail(true);
    navigate("/dashboard");
  };

  if (loading || !userData || Object.keys(userData).length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="p-5"
      style={{
        background: "linear-gradient(135deg, #fffbe6, #f7e0b5)",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        fontSize: "16px",
      }}
    >
      {userData ? (
        <div
          className="card shadow-lg p-4"
          style={{ borderRadius: "12px", background: "#fffef9" }}
        >


          {/* <h4 className="text-center mb-4 fw-bold text-dark position-relative">
            <i className="bi bi-person-lines-fill me-2 text-warning"></i>
            GUARD DETAILS
            <hr className="w-75 mx-auto border-warning" />
            <i
              className="bi bi-trash3-fill text-danger position-absolute end-0 top-0 me-2"
              style={{ cursor: "pointer", fontSize: "1.3rem" }}
              onClick={handleDeleteGuard}
              title="Delete Guard"
            ></i>
          </h4> */}

        {/* GUARD DETAILS Heading */}
<div className="position-relative mb-4 text-center">
  <h4 className="fw-bold text-dark mb-0">
    <i className="bi bi-person-lines-fill me-2 text-warning"></i>
    GUARD DETAILS
  </h4>
  <hr className="w-75 mx-auto border-warning mt-2" />

  {/* Delete Icon — aligned to the right side */}
  <i
    className="bi bi-trash3-fill text-danger position-absolute"
    style={{
      right: "0px",
      top: "-6px",
      fontSize: "1.5rem",
      cursor: "pointer",
    }}
    onClick={() => handleDeleteGuard(userData?.id)}
    title="Delete Guard"
  ></i>
</div>



          <div className="card mb-3 shadow-sm border-0">
            <div className="card-header bg-warning-subtle fw-bold">
              <i className="bi bi-person-fill me-2"></i>Personal Details
            </div>
            <div className="card-body row g-3">
              <div className="col-md-4">
                <strong>First Name:</strong> {userData.first_name || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Last Name:</strong> {userData.last_name || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Full Name:</strong> {userData.full_name || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Gender:</strong> {userData.gender || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Ethnicity:</strong> {userData.ethnicity || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Veteran Status:</strong>{" "}
                {userData.veteran_status || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Disability Status:</strong>{" "}
                {userData.disability_status || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Background:</strong> {userData.background || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>License:</strong> {userData.license || "N/A"}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="card mb-3 shadow-sm border-0">
            <div className="card-header bg-info-subtle fw-bold">
              <i className="bi bi-envelope-fill me-2"></i>Contact Info
            </div>
            <div className="card-body row g-3">
              <div className="col-md-6">
                <strong>Email:</strong> {userData.email || "N/A"}
              </div>
              <div className="col-md-6">
                <strong>Cell Phone:</strong> {userData.cell_phone || "N/A"}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card mb-3 shadow-sm border-0">
            <div className="card-header bg-primary-subtle text-primary fw-bold">
              <i className="bi bi-geo-alt-fill me-2"></i>Address
            </div>
            <div className="card-body row g-3">
              <div className="col-md-4">
                <strong>Street Address:</strong>{" "}
                {userData.street_address || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>City:</strong> {userData.city || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>State:</strong> {userData.state || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Zip Code:</strong> {userData.zip_code || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Country:</strong> {userData.country || "N/A"}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card mb-3 shadow-sm border-0">
            <div className="card-header bg-success-subtle text-success fw-bold">
              <i className="bi bi-sliders2-vertical me-2"></i>Preferences
            </div>
            <div className="card-body row g-3">
              <div className="col-md-4">
                <strong>On Call:</strong>{" "}
                <span
                  className={`badge ${userData.on_call ? "bg-success" : "bg-secondary"
                    }`}
                >
                  {userData.on_call ? "Yes" : "No"}
                </span>
              </div>
              <div className="col-md-4">
                <strong>Job Alerts:</strong>{" "}
                <span
                  className={`badge ${userData.job_alerts ? "bg-success" : "bg-secondary"
                    }`}
                >
                  {userData.job_alerts ? "Yes" : "No"}
                </span>
              </div>
              <div className="col-md-4">
                <strong>Smartphone:</strong> {userData.smartphone || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Transport:</strong> {userData.transport || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Referral:</strong> {userData.referral || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Privacy Consent:</strong>{" "}
                <span
                  className={`badge ${userData.privacy_consent ? "bg-success" : "bg-danger"
                    }`}
                >
                  {userData.privacy_consent ? "Yes" : "No"}
                </span>
              </div>
              <div className="col-md-4">
                <strong>Armed:</strong> {userData.armed || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>UnArmed:</strong> {userData.unarmed || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>License Number:</strong>{" "}
                {userData.license_number || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Expiration Date:</strong>{" "}
                {userData.expiration_date
                  ? new Date(userData.expiration_date)
                    .toISOString()
                    .split("T")[0]
                  : "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Speaking English:</strong>{" "}
                {userData.english_language || "N/A"}
              </div>
            </div>
          </div>

          {/* All Uploaded Images */}
          <div className="card mb-3 shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold">
              <i className="bi bi-images me-2"></i>All Uploaded Images
            </div>
            <div className="card-body row g-3">
              {[
                "driver_license",
                "firewatch_certificate",
                "security_guard_license",
                "social_security_card",
              ].map((key) => {
                const imageUrl = userData?.[key]?.image;
                if (!imageUrl) return null;
                return (
                  <div
                    className="col-md-3 col-sm-6 d-flex justify-content-center align-items-center"
                    key={key}
                  >
                    <div className="text-center">
                      <p className="fw-bold text-capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <img
                        src={imageUrl}
                        alt={key}
                        className="img-thumbnail shadow-sm"
                        style={{
                          height: "150px",
                          width: "220px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedImage(imageUrl)}
                      />
                    </div>
                  </div>
                );
              })}

              {userData?.images?.map((imgObj, i) => {
                const [fileName, imageUrl] = Object.entries(imgObj)[0];
                return (
                  <div className="col-md-3 col-sm-6 text-center" key={i}>
                    <p className="fw-bold">HeadShot</p>
                    <div className="d-flex justify-content-center">
                      <img
                        src={imageUrl}
                        alt={fileName}
                        className="img-thumbnail shadow-sm"
                        style={{
                          height: "150px",
                          width: "220px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedImage(imageUrl)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Preview for Images */}
          {selectedImage && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
              onClick={() => setSelectedImage(null)}
            >
              <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content bg-transparent border-0 text-center">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: "90vh", objectFit: "contain" }}
                  />
                  <button
                    className="btn btn-light mt-3 mx-auto"
                    style={{ width: "100px" }}
                    onClick={() => setSelectedImage(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="card mb-3 shadow-sm border-0">
            <div className="card-header bg-light fw-bold">
              <i className="bi bi-journal-text me-2"></i>Admin Notes
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows="4"
                placeholder="Write your notes here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="text-end mt-3">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveNote}
                  disabled={savingNote}
                >
                  {savingNote ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>Save Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Resume Document */}
          <div className="card mb-3 shadow-sm border-0">
            <div className="card-header bg-secondary-subtle fw-bold">
              <i className="bi bi-file-earmark-text-fill me-2"></i>Resume
              Document
            </div>
            <div className="card-body">
              <div className="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                <div>
                  <i className="bi bi-file-earmark-text me-2"></i>
                  {userData.file_name || "No resume uploaded"}
                </div>
                {userData.resume && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleFilePreview(userData)}
                  >
                    <i className="bi bi-eye me-1"></i>Preview
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-4 d-flex justify-content-center gap-4">
            <button
              className="btn btn-success btn-lg rounded-pill px-5 shadow d-flex align-items-center gap-2"
              onClick={handleApproveClick}
            >
              <i className="bi bi-check-circle-fill"></i> Approve
            </button>
            <button
              className="btn btn-danger btn-lg rounded-pill px-5 shadow d-flex align-items-center gap-2"
              onClick={() => setShowDeclineModal(true)}
            >
              <i className="bi bi-x-circle-fill"></i> Decline
            </button>
          </div>

          <div
            className="card-footer text-center text-muted mt-4"
            style={{ fontSize: "14px" }}
          >
            <i className="bi bi-clock-history me-1"></i>Last Updated:{" "}
            {new Date(userData.updatedAt || Date.now()).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div className="d-flex align-items-center justify-content-center vh-100">
          <Loader />
        </div>
      )}

      {/* Approve Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content text-center p-3">
              {!approved ? (
                <>
                  <div className="modal-header border-0">
                    <h5 className="modal-title w-100">Confirm Approval</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to approve this user?</p>
                  </div>
                  <div className="modal-footer d-flex justify-content-center border-0">
                    <button
                      className="btn btn-secondary me-2"
                      onClick={handleCloseModal}
                      disabled={isApproving}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => handleConfirmApprove(userData.id)}
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Approving...
                        </>
                      ) : (
                        "Yes, Approve"
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="modal-body">
                  <div className="d-flex flex-column align-items-center mb-4">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/845/845646.png"
                      alt="Approved"
                      style={{ width: "80px", height: "80px" }}
                    />
                    <p className="mt-3 mb-0 fs-5">
                      User Approved Successfully!
                    </p>
                  </div>
                  <div className="card shadow-sm mb-3 border-0">
                    <div className="card-header bg-light fw-bold">
                      <i className="bi bi-journal-text me-2"></i>FAST GUARD
                      BADGE ID
                    </div>
                    <div className="card-body">
                      <PassportUploadForm email={userData?.email} />
                    </div>
                  </div>
                  <div className="modal-footer d-flex justify-content-center border-0 mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={handleCloseModal}
                    >
                      Finish & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center">
              {!declined ? (
                <>
                  <div className="modal-header border-0">
                    <h5 className="modal-title w-100">Confirm Decline</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDeclineModal(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to decline this user?</p>
                  </div>
                  <div className="modal-footer d-flex justify-content-center border-0">
                    <button
                      className="btn btn-secondary me-2"
                      onClick={() => setShowDeclineModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleDecline(userData.id);
                      }}
                    >
                      Yes, Decline
                    </button>
                  </div>
                </>
              ) : (
                <div className="modal-body text-center p-4">
                  <div className="d-flex flex-column align-items-center">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1828/1828665.png"
                      alt="Declined"
                      style={{ width: "80px", height: "80px" }}
                    />
                    <p className="mt-3 mb-0 text-danger fw-bold fs-5">
                      User Declined!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
