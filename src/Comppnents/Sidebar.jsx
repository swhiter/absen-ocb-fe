
import { Link } from "react-router-dom";
import navigationLinks from "../data/navigation";
import { useState, useEffect } from "react";
const VITE_API_IMAGE = import.meta.env.VITE_API_IMAGE;

const Sidebar = ({ isSidebarOpen }) => {
  const [name, setName] = useState([]);
    useEffect(() => {
        
        // Ambil data user dari sessionStorage
        const userProfile = sessionStorage.getItem("userProfile");
       
        if (userProfile) {
          const userData = JSON.parse(userProfile); // Parse JSON
          setName(userData[0]);// Ambil nama dari data
        }
  
        
      }, []);

  return (
    <nav className={`sidebar sidebar-offcanvas ${isSidebarOpen ? "active" : ""}`}  id="sidebar">
    <ul className="nav">
      <li className="nav-item nav-profile">
        <a  className="nav-link">
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
        <Link className="nav-link" to={link.path}>
          <span className="menu-title">{link.name}</span>
          <i className={`mdi ${link.icon} menu-icon`} ></i>
        </Link>
      </li>
      ))}
    </ul>
  </nav>
  )
}

export default Sidebar