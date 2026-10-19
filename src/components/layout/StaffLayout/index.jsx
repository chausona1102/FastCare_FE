import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./StaffLayout.module.scss";
import classNames from "classnames/bind";
import { useDispatch } from "react-redux";
import { logout } from "~/store/slices/authSlice";
import axiosClient from "~/api/axiosClient";
import { logo } from "~/assets/images";
import {
  faHome,
  faShoppingCart,
  faBox,
  faTruck,
  faSignOutAlt,
  faBars,
  faTimes,
  faChartLine,
  faUsers,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const cx = classNames.bind(styles);

function StaffLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  // Nhóm menu theo chức năng như trong prompt
  const navGroups = [
    {
      id: "main",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: faHome,
          path: "/staff/dashboard",
        },
      ],
    },
    {
      id: "orders",
      title: "Quản Lý Đơn Hàng",
      items: [
        {
          id: "orders-list",
          label: "Danh sách đơn hàng",
          icon: faShoppingCart,
          path: "/staff/orders",
        },
        {
          id: "orders-history",
          label: "Lịch sử đơn hàng",
          icon: faChartLine,
          path: "/staff/orders/history",
        },
      ],
    },
    {
      id: "products",
      title: "Quản Lý Sản Phẩm",
      items: [
        {
          id: "products-list",
          label: "Danh sách sản phẩm",
          icon: faBox,
          path: "/staff/products",
        },
        {
          id: "products-categories",
          label: "Danh mục sản phẩm",
          icon: faBox,
          path: "/staff/products/categories",
        },
        {
          id: "products-parent-categories",
          label: "Nhóm danh mục",
          icon: faLayerGroup,
          path: "/staff/products/parent-categories",
        },
        {
          id: "products-inventory",
          label: "Tồn kho",
          icon: faChartLine,
          path: "/staff/products/inventory",
        },
      ],
    },
    {
      id: "imports",
      title: "Nhập Hàng",
      items: [
        {
          id: "imports-create",
          label: "Tạo phiếu nhập",
          icon: faTruck,
          path: "/staff/imports/create",
        },
        {
          id: "imports-list",
          label: "Danh sách phiếu nhập",
          icon: faShoppingCart,
          path: "/staff/imports",
        },
      ],
    },
    {
      id: "users",
      title: "Khách hàng",
      items: [
        {
          id: "users-list",
          label: "Quản lý khách hàng",
          icon: faUsers,
          path: "/staff/users",
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
          {/* <FontAwesomeIcon icon={faHome} />
          <span>FastCare</span> */}
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
                      className={cx("navLink", { active: isActive(item.path) })}
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

          {/* Logout Button */}
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
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
          </button>
          <h1 className={cx("headerTitle")}>Staff Dashboard</h1>
          <div className={cx("headerRight")}>
            <div className={cx("userAvatar")}>ST</div>
          </div>
        </header>

        {/* Content */}
        <main className={cx("content")}>{children}</main>
      </div>
    </div>
  );
}

export default StaffLayout;
