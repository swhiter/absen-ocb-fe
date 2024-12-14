
import { Link } from "react-router-dom";
import navigationLinks from "../data/navigation";

const Sidebar = () => {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
    <ul className="nav">
      <li className="nav-item nav-profile">
        <a href="#" className="nav-link">
          <div className="nav-profile-image">
            <img src='/faces/face1.jpg' alt="profile" />
            <span className="login-status online"></span>
        
          </div>
          <div className="nav-profile-text d-flex flex-column">
            <span className="font-weight-bold mb-2">David Grey. H</span>
            <span className="text-secondary text-small">Project Manager</span>
          </div>
          <i className="mdi mdi-bookmark-check text-success nav-profile-badge"></i>
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