import styles from "./Header.module.scss";
import classNames from "classnames/bind";
import { logo } from "~/assets/images";
import Button from "~/components/Button";
import Search from "~/components/Search";
import useCart from "~/hook/useCart.jsx";
import CategoryPopper from "./Category";
import Tippy from "@tippyjs/react";
import { Link } from "react-router-dom";
import "tippy.js/dist/tippy.css";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "~/store/slices/authSlice";
import {
  faBars,
  faUserCircle,
  faShoppingCart,
  faTimes,
  faHeart,
  faGear,
  faSignOut,
  faBagShopping,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import api from "~/api";
import axios from "axios";
import axiosClient from "~/api/axiosClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const cx = classNames.bind(styles);

function Header() {
  const dispatch = useDispatch();
  const { items } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [categories, setCategories] = useState();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData } = await axios.get(api.parentCategory);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
    }
  }, [token]);

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
      <header className={cx("header")}>
        <Link to="/" aria-label="Trang chủ">
          <div className={cx("logo")}>
            <Tippy
              content="Trang chủ"
              className={cx("logo-tooltip")}
              placement="bottom"
            >
              <span className={cx("logo-desktop")}>
                <img src={logo} alt="" />
              </span>
            </Tippy>
            <FontAwesomeIcon
              icon={faHome}
              className={cx("logo-mobile-icon")}
              aria-hidden="true"
            />
          </div>
        </Link>
        <div className={cx("category-wrapper")}>
          <Button
            primary
            rightIcon={faBars}
            size="medium"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <span className={cx("menu-text")}>Danh mục</span>
          </Button>
        </div>
        {isCategoryOpen && (
          <div
            className={cx("backdrop")}
            onClick={() => setIsCategoryOpen(false)}
          />
        )}
        <CategoryPopper isOpen={isCategoryOpen} categories={categories} />
        <div className={cx("search")}>
          <Search />
        </div>
        <Tippy content="Giỏ hàng" placement="bottom">
          <div className={cx("cart-wrapper")}>
            <Button
              rightIcon={faShoppingCart}
              size="medium"
              className={cx("cart-btn")}
              to="/cart"
            >
              <span className={cx("cart-text")}>Giỏ hàng</span>
            </Button>
            {items.length > 0 && (
              <span className={cx("cart-badge")}>{items.length}</span>
            )}
          </div>
        </Tippy>
        {isLoggedIn ? (
          <div className={cx("profile-menu")}>
            <button
              className={cx("profile-btn")}
              type="button"
              aria-label="Mở menu tài khoản"
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              aria-controls="profile-dropdown"
              onClick={() => setIsProfileOpen((open) => !open)}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} />
              )}
            </button>
            {isProfileOpen && (
              <>
                <div
                  className={cx("backdrop")}
                  aria-hidden="true"
                  onClick={() => setIsProfileOpen(false)}
                />
                <nav
                  id="profile-dropdown"
                  className={cx("profile-dropdown")}
                  aria-label="Điều hướng tài khoản"
                >
                  <div className={cx("profile-card")}>
                    <div className={cx("profile-avatar")}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" />
                      ) : (
                        <FontAwesomeIcon icon={faUserCircle} />
                      )}
                    </div>
                    <div className={cx("profile-info")}>
                      <strong>{user?.fullname || "Tài khoản FastCare"}</strong>
                      <span>{user?.email || "Quản lý tài khoản của bạn"}</span>
                    </div>
                    <button
                      type="button"
                      className={cx("profile-close")}
                      aria-label="Đóng menu tài khoản"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>

                  <div className={cx("profile-section")}>
                    <span className={cx("profile-section-title")}>Mua sắm</span>
                    <Link
                      to="/wishlist"
                      className={cx("profile-link")}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                      <span>Yêu thích</span>
                    </Link>
                    <Link
                      to="/cart"
                      className={cx("profile-link")}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      <span>Giỏ hàng</span>
                    </Link>
                    <Link
                      to="/order"
                      className={cx("profile-link")}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FontAwesomeIcon icon={faBagShopping} />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                  </div>

                  <div className={cx("profile-section")}>
                    <span className={cx("profile-section-title")}>
                      Tài khoản
                    </span>
                    <Link
                      to="/profile"
                      className={cx("profile-link")}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FontAwesomeIcon icon={faUserCircle} />
                      <span>Thông tin cá nhân</span>
                    </Link>
                    <Link
                      to="/settings"
                      className={cx("profile-link")}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FontAwesomeIcon icon={faGear} />
                      <span>Cài đặt</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    className={cx("profile-logout")}
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOut} />
                    <span>Đăng xuất</span>
                  </button>
                </nav>
              </>
            )}
          </div>
        ) : (
          <Tippy content="Đăng nhập" placement="bottom">
            <div>
              <Button
                primary
                rightIcon={faUserCircle}
                size="medium"
                to="/login"
                className={cx("login-btn")}
              >
                <span className={cx("login-text")}>Đăng nhập</span>
              </Button>
            </div>
          </Tippy>
        )}
      </header>
    </div>
  );
}

export default Header;
