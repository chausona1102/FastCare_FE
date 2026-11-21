import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminLayout.module.scss";
import classNames from "classnames/bind";
import { useDispatch } from "react-redux";
import { logout } from "~/store/slices/authSlice";
import axiosClient from "~/api/axiosClient";
import Tippy from "@tippyjs/react";
import { useTheme } from "~/contexts/ThemeContext";
import { useAuth } from "~/hook/useAuth";
import { logo } from "~/assets/images";
import SwitchTheme from "~/components/SwitchTheme";
import {
  faHome,
  faUsers,
  faBox,
  faShoppingCart,
  faSignOutAlt,
  faBars,
  faTimes,
  faLayerGroup,
  faTags,
  faClipboardList,
  faChartLine,
  faMoneyBillWave,
  faKey,
  faTrophy,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const navGroups = [
    {
      id: "main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: faHome, path: "/admin" },
        {
          id: "profit",
          label: "Báo cáo lợi nhuận",
          icon: faChartLine,
          path: "/admin/profit",
        },
      ],
    },
    {
      id: "management",
      title: "Quản lý",
      items: [
        {
          id: "users",
          label: "Khách hàng",
          icon: faUsers,
          path: "/admin/users",
        },
        {
          id: "leaderboard",
          label: "Bảng xếp hạng",
          icon: faTrophy,
          path: "/admin/leaderboard",
        },
        {
          id: "orders",
          label: "Đơn hàng",
          icon: faShoppingCart,
          path: "/admin/orders",
        },
        {
          id: "payments",
          label: "Thanh toán online",
          icon: faMoneyBillWave,
          path: "/admin/payments",
        },
        {
          id: "products",
          label: "Sản phẩm",
          icon: faBox,
          path: "/admin/products",
        },
        {
          id: "inventory",
          label: "Tồn kho",
          icon: faBox,
          path: "/admin/inventory",
        },
        {
          id: "imports",
          label: "Đơn nhập hàng",
          icon: faTruck,
          path: "/admin/imports",
        },
        {
          id: "categories",
          label: "Danh mục sản phẩm",
          icon: faTags,
          path: "/admin/categories",
        },
        {
          id: "parent-categories",
          label: "Nhóm danh mục",
          icon: faLayerGroup,
          path: "/admin/parent-categories",
        },
      ],
    },
    {
      id: "system",
      title: "Hệ thống",
      items: [
        {
          id: "logs",
          label: "Nhật ký hoạt động",
          icon: faClipboardList,
          path: "/admin/logs",
        },
        {
          id: "refresh-tokens",
          label: "Phiên đăng nhập",
          icon: faKey,
          path: "/admin/refresh-tokens",
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await axiosClient.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch(logout());
      window.location.href = "/login";
    }
  };

  return (
    <div className={cx("wrapper")}>
      {/* Sidebar */}
      <aside className={cx("sidebar", { active: sidebarOpen })}>
        <div className={cx("logo")}>
          {/* <FontAwesomeIcon icon={faHome} /> */}
          {/* <span>FastCare</span> */}
          <img src={logo} alt="Logo" />
        </div>

        <div className={cx("navContainer")}>
          {navGroups.map((group) => (
            <div key={group.id} className={cx("navGroup")}>
              {group.title && (
                <div className={cx("groupTitle")}>{group.title}</div>
              )}
              <ul className={cx("navMenu")}>
                {group.items.map((item) => (
                  <li key={item.id} className={cx("navItem")}>
                    <Link
                      to={item.path}
                      className={cx("navLink", {
                        active: isActive(item.path),
                      })}
                      onClick={() => setSidebarOpen(false)}
                      title={item.label}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={cx("icon")}
                      />
                      <span className={cx("label")}>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className={cx("navGroup", "logoutGroup")}>
            <ul className={cx("navMenu")}>
              <li className={cx("navItem")}>
                <button
                  className={cx("navLink", "logoutBtn")}
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className={cx("icon")} />
                  <span className={cx("label")}>Đăng Xuất</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cx("mainContent")}>
        {/* Header */}
        <header className={cx("header")}>
          <button
            className={cx("toggleSidebar")}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
          </button>
          <h1 className={cx("headerTitle")}>Admin Dashboard</h1>
          <div className={cx("headerRight")}>
            {/* <div className={cx("themeSwitch", "form-check form-switch")}>
              <input
                className={cx("form-check-input")}
                type="checkbox"
                id="theme-switch"
                role="switch"
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
              <span className={cx("themeSwitchThumb")} aria-hidden="true" />
            </div> */}
            <SwitchTheme theme={theme} toggle={toggleTheme} />
            <Tippy
              content={
                user ? (
                  <div className={cx("userTooltip")}>
                    <p>{user.fullname}</p>
                    <p>{user.email}</p>
                  </div>
                ) : (
                  "Người dùng"
                )
              }
              placement="bottom"
            >
              <div className={cx("userAvatar")}>AD</div>
            </Tippy>
          </div>
        </header>

        {/* Content */}
        <main className={cx("content")}>{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
