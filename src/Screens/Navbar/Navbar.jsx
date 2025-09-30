import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../../Images/logo.png";
import { useDispatch } from "react-redux";
import { ApprovedList } from "../../Networking/APIs/ApprovedApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { guardPriceList } from "../../Networking/APIs/GuardPriceApi";

export const NavbarComponent = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleApprovelist = () => {
    dispatch(ApprovedList({ params: { status: "approved" } }));
  };

  const handleNotApprovelist = () => {
    dispatch(ApprovedList({ params: { status: "not approved" } }));
  };

  const handleGuardPricelist = () => {
    dispatch(guardPriceList());
  };

  const handleLogout = () => {
    toast.error("Logged Out...");
    localStorage.removeItem("token");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar expand="lg" bg="light" sticky="top" className="shadow-sm py-2">
        <Container>
          {/* Logo */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img
              src={logo}
              alt="Logo"
              style={{ width: "140px" }}
              className="me-2"
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar-nav" />
          <Navbar.Collapse
            id="main-navbar-nav"
            className="justify-content-between"
          >
            {/* Center nav */}
            <Nav className="mx-auto text-center">
              <Nav.Link
                as={Link}
                to="/dashboard"
                className={`nav-item mx-2 fw-semibold ${
                  location.pathname === "/dashboard"
                    ? "text-primary"
                    : "text-dark"
                }`}
              >
                <i className="bi bi-house-door-fill me-1"></i> Home
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/ApprovedList"
                onClick={handleApprovelist}
                className={`nav-item mx-2 fw-semibold ${
                  location.pathname === "/ApprovedList"
                    ? "text-success"
                    : "text-dark"
                }`}
              >
                <i className="bi bi-check-circle-fill me-1"></i> Approved
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/NotApprovelist"
                onClick={handleNotApprovelist}
                className={`nav-item mx-2 fw-semibold ${
                  location.pathname === "/NotApprovelist"
                    ? "text-danger"
                    : "text-dark"
                }`}
              >
                <i className="bi bi-x-circle-fill me-1"></i> Not Approved
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/GuardPriceList"
                onClick={handleGuardPricelist}
                className={`nav-item mx-2 fw-semibold ${
                  location.pathname === "/GuardPriceList"
                    ? "text-primary"
                    : "text-dark"
                }`}
              >
                <i className="bi bi-shield-lock-fill me-1"></i> Guard Price
              </Nav.Link>
            </Nav>

            {/* Logout */}
            <Nav className="text-end">
              <Button
                variant="outline-danger"
                className="fw-semibold rounded-pill px-3 py-1"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};
