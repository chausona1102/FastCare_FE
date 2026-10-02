import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminLayout.module.scss";
import classNames from "classnames/bind";
import {
  faHome,
  faUsers,
  faBox,
  faShoppingCart,
  faCog,
  faSignOutAlt,
  faBars,
  faTimes,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: faHome, path: "/admin" },
    { id: "users", label: "Users", icon: faUsers, path: "/admin/User" },
    { id: "products", label: "Products", icon: faBox, path: "/admin/products" },
    {
      id: "orders",
      label: "Orders",
      icon: faShoppingCart,
      path: "/admin/orders",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: faChartLine,
      path: "/admin/analytics",
    },
    { id: "settings", label: "Settings", icon: faCog, path: "/admin/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // TODO: Implement logout logic
    localStorage.removeItem("fastcare_access_token");
    localStorage.removeItem("fastcare_user");
    window.location.href = "/login";
  };

  return (
    <div className={cx("wrapper")}>
      {/* Sidebar */}
      <aside className={cx("sidebar", { active: sidebarOpen })}>
        <div className={cx("logo")}>
          <FontAwesomeIcon icon={faHome} />
          <span>FastCare</span>
        </div>

        <ul className={cx("navMenu")}>
          {navItems.map((item) => (
            <li key={item.id} className={cx("navItem")}>
              <Link
                to={item.path}
                className={cx("navLink", { active: isActive(item.path) })}
                onClick={() => setSidebarOpen(false)}
              >
                <FontAwesomeIcon icon={item.icon} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li className={cx("navItem")}>
            <button
              className={cx("navLink")}
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                width: "100%",
                textAlign: "left",
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className={cx("mainContent")}>
        {/* Header */}
        <header className={cx("header")}>
          <button
            className={cx("toggleSidebar")}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.8rem",
              cursor: "pointer",
              display: "none",
            }}
          >
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
          </button>
          <h1 className={cx("headerTitle")}>Admin Dashboard</h1>
          <div className={cx("headerRight")}>
            <div className={cx("userAvatar")}>AD</div>
          </div>
        </header>

        {/* Content */}
        <main className={cx("content")}>{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
