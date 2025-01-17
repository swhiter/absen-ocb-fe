import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import navigationLinks from "../data/navigation";
const VITE_API_IMAGE = import.meta.env.VITE_API_IMAGE;

const Sidebar = ({ isSidebarOpen }) => {
  const [name, setName] = useState([]);

  useEffect(() => {
    const userProfile = sessionStorage.getItem("userProfile");
    if (userProfile) {
      const userData = JSON.parse(userProfile);
      setName(userData[0]);
    }
  }, []);

  return (
    <nav className={`sidebar sidebar-offcanvas ${isSidebarOpen ? "active" : ""}`} id="sidebar">
      <ul className="nav">
        <li className="nav-item nav-profile">
          <a className="nav-link">
            <div className="nav-profile-image">
            <img src={name.photo_url ? `${VITE_API_IMAGE}${name.photo_url}` : "https://via.placeholder.com/50"} alt="profile" />

              <span className="login-status online"></span>
            </div>
            <div className="nav-profile-text d-flex flex-column">
              <span className="font-weight-bold mb-2">{name.name || "Nama Dashboard"}</span>
              <span className="text-secondary text-small">{name.category_user}</span>
            </div>
          </a>
        </li>
        {navigationLinks.map((link, index) => (
          <li className="nav-item" key={index}>
            {/* Jika menu memiliki submenu */}
            {link.submenu ? (
              <>
                <a
                  className="nav-link"
                  data-bs-toggle="collapse"
                  href={`#${link.submenuId}`}
                  aria-expanded="false"
                  aria-controls={link.submenuId}
                >
                  <span className="menu-title">{link.name}</span>
                  <i className="menu-arrow"></i>
                  <i className={`mdi ${link.icon} menu-icon`}></i>
                </a>
                <div className="collapse" id={link.submenuId}>
                  <ul className="nav flex-column sub-menu">
                    {link.submenu.map((sublink, subIndex) => (
                      <li className="nav-item" key={subIndex}>
                        <Link className="nav-link" to={sublink.path}>
                          {sublink.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              // Jika menu tidak memiliki submenu
              <Link className="nav-link" to={link.path}>
                <span className="menu-title">{link.name}</span>
                <i className={`mdi ${link.icon} menu-icon`}></i>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
