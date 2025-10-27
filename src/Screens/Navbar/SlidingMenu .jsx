import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

export const SlidingMenu = () => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const menuRef = useRef();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get role from localStorage
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  // All menu items
  const menuItems = [
    { to: "/signup", label: "Add Member", icon: "bi bi-person-plus-fill" },
    { to: "/Reset_password", label: "Reset Password", icon: "bi bi-key-fill" },
    { to: "/member-activity", label: "Member Activity", icon: "bi bi-people-fill" },
    { to: "/token-generator", label: "Token Generator", icon: "bi bi-shield-lock" },
  ];

  // Filter menu items based on role
  const filteredMenuItems =
    role === "member"
      ? menuItems.filter((item) => item.label === "Reset Password")
      : menuItems; // admin sees all

  return (
    <div className="d-none d-lg-flex" style={{ position: "relative" }}>
      <Button
        className="p-2 border-0 shadow-none"
        style={{
          backgroundColor: "#f8f9fa",
          outline: "none",
          boxShadow: "none",
          color: "gray",
        }}
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-list" style={{ fontSize: "38px", color: "gray" }}></i>
      </Button>

      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "220px",
          backgroundColor: "#f8f9fa",
          boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
          padding: "1rem",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          zIndex: 1000,
        }}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredMenuItems.map((item, index) => (
            <li key={index} style={{ marginBottom: "12px" }}>
              <Link
                to={item.to}
                style={{
                  textDecoration: "none",
                  color: "#495057",
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 15px",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e9ecef";
                  e.currentTarget.style.color = "#007bff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#495057";
                }}
              >
                <i className={item.icon} style={{ marginRight: "10px" }}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
