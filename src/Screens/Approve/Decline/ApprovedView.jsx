import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../Component/Loader";
import { GetuserDetail } from "../../../Networking/APIs/UserGetDetails";
import PassportUploadForm from "../../../PassportForm";
import { Button, Modal } from "react-bootstrap";

export const ApprovedView = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const id = location.state.userId;
  console.log(id,"id");
  

  const { userData } = useSelector((state) => state.userListSlice);

  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const downloadBadge = () => {
    if (!userData?.guard_badge) return;

    const link = document.createElement("a");
    link.href = userData.guard_badge;
    link.download = userData.first_name + ".png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await dispatch(GetuserDetail({ id }));
      setLoading(false);
    };
    fetchData();
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(GetuserDetail({ id }));
  }, [dispatch, id]);

  const handleFilePreview = (user) => {
    const { resume, file_type, file_name } = user;
    if (!resume || !file_type || !file_name) {
      alert("File data not available.");
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

    let cleanFileName = file_name;
    if (file_name.includes(".")) {
      cleanFileName = file_name.split(".")[0];
    }

    const byteCharacters = atob(resume);
    const byteNumbers = Array.from(byteCharacters).map((c) =>
      c.charCodeAt(0)
    );
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

  const badgeId = userData?.guard_badge

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "300px" }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <div>
      {userData ? (
        <div
          className="d-flex justify-content-center"
          style={{
            background: "linear-gradient(135deg, #fff8dc, #fceabb)",
            minHeight: "100vh",
            padding: "40px",
          }}
        >
          <div
            className="card shadow"
            style={{ width: "100%", maxWidth: "800px", borderRadius: "12px" }}
          >
            <div
              className="card-header d-flex justify-content-between align-items-center"
              style={{
                backgroundColor: "#d4a52e",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                fontSize: "20px",
                padding: "15px",
              }}
            >
              <div className="text-black fw-bold">GUARD DETAILS</div>

              <div className="d-flex align-items-center">
                {badgeId ? (
                  <span className="me-3 fw-bold text-dark">
                    FAST GUARD BADGE ID – Available
                  </span>
                ) : (
                  <button
                    className="btn btn-sm btn-dark me-3"
                    onClick={() => setShowBadgeModal(true)}
                  >
                    <i className="bi bi-journal-text me-2"></i>
                    Create Badge ID
                  </button>
                )}

                <div className="d-flex align-items-center">
                  <span className="text-success fw-bold">APPROVED</span>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/845/845646.png"
                    alt="Approved"
                    style={{ width: "30px", height: "30px", marginLeft: "8px" }}
                  />
                </div>
              </div>
            </div>

            {!badgeId && (
              <div className="card-body text-muted small">
                this guard don’t have a <strong>Badge ID</strong> yet.
                Click the <strong>Create Badge ID</strong> button to generate one.
              </div>
            )}

            <div
              className="p-4"
              style={{ borderRadius: "12px", background: "#fffef9" }}
            >
              <div className="card mb-3 shadow-sm border-0">
                <div className="card-header bg-warning-subtle fw-bold">
                  <i className="bi bi-person-fill me-2"></i>Personal Details
                </div>
                <div className="card-body row g-3">
                  <div className="col-md-4">
                    <strong>First Name:</strong> {userData.first_name}
                  </div>
                  <div className="col-md-4">
                    <strong>Last Name:</strong> {userData.last_name}
                  </div>
                  <div className="col-md-4">
                    <strong>Full Name:</strong> {userData.full_name}
                  </div>
                  <div className="col-md-4">
                    <strong>Gender:</strong> {userData.gender}
                  </div>
                  <div className="col-md-4">
                    <strong>Ethnicity:</strong> {userData.ethnicity}
                  </div>
                  <div className="col-md-4">
                    <strong>Veteran Status:</strong> {userData.veteran_status}
                  </div>
                  <div className="col-md-4">
                    <strong>Disability Status:</strong>{" "}
                    {userData.disability_status}
                  </div>
                  <div className="col-md-4">
                    <strong>Background:</strong> {userData.background}
                  </div>
                  <div className="col-md-4">
                    <strong>License:</strong> {userData.license}
                  </div>
                </div>
              </div>

              <div className="card mb-3 shadow-sm border-0">
                <div className="card-header bg-info-subtle fw-bold">
                  <i className="bi bi-envelope-fill me-2"></i>Contact Info
                </div>
                <div className="card-body row g-3">
                  <div className="col-md-4">
                    <strong>Email:</strong> {userData.email}
                  </div>
                  <div className="col-md-4">
                    <strong>Cell Phone:</strong> {userData.cell_phone}
                  </div>
                </div>
              </div>

              <div className="card mb-3 shadow-sm border-0">
                <div className="card-header bg-primary-subtle text-primary fw-bold">
                  <i className="bi bi-geo-alt-fill me-2"></i>Address
                </div>
                <div className="card-body row g-3">
                  <div className="col-md-4">
                    <strong>City:</strong> {userData.city}
                  </div>
                  <div className="col-md-4">
                    <strong>State:</strong> {userData.state}
                  </div>
                  <div className="col-md-4">
                    <strong>Country:</strong> {userData.country}
                  </div>
                  <div className="col-md-4">
                    <strong>Street Address:</strong> {userData.street_address}
                  </div>
                  <div className="col-md-4">
                    <strong>Zip Code:</strong> {userData.zip_code}
                  </div>
                </div>
              </div>

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
                      {userData.on_call}
                    </span>
                  </div>
                  <div className="col-md-4">
                    <strong>Job Alerts:</strong>{" "}
                    <span
                      className={`badge ${userData.job_alerts ? "bg-success" : "bg-secondary"
                        }`}
                    >
                      {userData.job_alerts}
                    </span>
                  </div>
                  <div className="col-md-4">
                    <strong>Smartphone:</strong> {userData.smartphone}
                  </div>
                  <div className="col-md-4">
                    <strong>Transport:</strong> {userData.transport}
                  </div>
                  <div className="col-md-4">
                    <strong>Referral:</strong> {userData.referral}
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
                    <strong>Armed:</strong> {userData.armed}
                  </div>
                  <div className="col-md-4">
                    <strong>UnArmed:</strong> {userData.unarmed}
                  </div>
                  <div className="col-md-4">
                    <strong>License Number:</strong> {userData.license_number}
                  </div>
                  <div className="col-md-4">
                    <strong>Expiration Date:</strong>{" "}
                    {userData.expiration_date
                      ? new Date(userData.expiration_date)
                        .toISOString()
                        .split("T")[0]
                      : null}
                  </div>
                  <div className="col-md-4">
                    <strong>Speaking English:</strong>{" "}
                    {userData.english_language}
                  </div>
                </div>
              </div>

              <div
                className="card shadow-sm mb-3 border-0"
                style={{ maxWidth: "800px", margin: "0 auto" }}
              >
                <div className="card-header bg-light fw-bold d-flex justify-content-between align-items-center">
                  <span>
                    <i className="bi bi-award me-2"></i> FAST GUARD BADGE ID
                  </span>
                  {!userData?.file_name && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setShowBadgeModal(true)}
                    >
                      Upload Badge
                    </button>
                  )}
                </div>
                <div className="card-body text-center">
                  <>
                    {userData?.guard_badge ? (
                      <img
                        src={userData.guard_badge}
                        alt="Badge ID"
                        className="img-fluid rounded border"
                        onClick={handleShow}
                        style={{ maxHeight: "250px", cursor: "pointer" }}
                      />
                    ) : (
                      <p className="text-muted mb-0">Badge ID not available</p>
                    )}

                    <Modal show={show} onHide={handleClose} centered>
                      <Modal.Header closeButton>
                        <Modal.Title>Badge ID</Modal.Title>
                      </Modal.Header>
                      <Modal.Body className="d-flex justify-content-center">
                        {userData?.guard_badge ? (
                          <img
                            src={userData.guard_badge}
                            alt="Badge ID"
                            className="img-fluid rounded border"
                            style={{ maxHeight: "250px" }}
                          />
                        ) : (
                          <p className="text-muted mb-0">Badge ID not available</p>
                        )}
                      </Modal.Body>
                      <Modal.Footer className="d-flex justify-content-center">
                        {userData?.guard_badge && (
                          <Button variant="success" onClick={downloadBadge}>
                            Download
                          </Button>
                        )}
                      </Modal.Footer>
                    </Modal>
                  </>
                </div>

              </div>

              <div className="card mb-3 shadow-sm border-0">
                <div className="card-header bg-secondary-subtle fw-bold">
                  <i className="bi bi-file-earmark-text-fill me-2"></i>Resume
                  Document
                </div>
                <div className="card-body">
                  <div className="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-file-earmark-text me-2"></i>
                      {userData.file_name}
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleFilePreview(userData)}
                    >
                      <i className="bi bi-eye me-1"></i>Preview
                    </button>
                  </div>
                </div>
              </div>
              {showBadgeModal && (
                <>
                  <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    <div
                      className="modal-dialog modal-lg modal-dialog-centered"
                      role="document"
                    >
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Upload FAST GUARD BADGE ID</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowBadgeModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <PassportUploadForm email={userData?.email || ""} setShowBadgeModal={showBadgeModal} />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ height: "300px" }}
        >
          <Loader />
        </div>
      )}

    </div>
  );
};
