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
import { logout } from "~/store/slices/authSlice"
import {
  faBars,
  faUserCircle,
  faShoppingCart,
  faHeart,
  faSignOut,
  faBagShopping,
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
        <Link to="/">
          <div className={cx("logo")}>
            <Tippy
              content="Trang chủ"
              className={cx("logo-tooltip")}
              placement="bottom"
            >
              <img src={logo} alt="logo" />
            </Tippy>
          </div>
        </Link>
        <div
          className={cx("category-wrapper")}
        >
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
          <div>
            <button className={cx("profile-btn")} onClick={() => {setIsProfileOpen(!isProfileOpen)}}>
              <img src={user?.avatar} alt="Avatar" />
            </button>
            <ul className={cx("profile-dropdown", { open: isProfileOpen })}>
                <button onClick={() => (window.location.href = "/wishlist")}><FontAwesomeIcon icon={faHeart} className={cx("profile-icon")} /><span>Yêu thích</span></button>
                <button onClick={() => (window.location.href = "/cart")}><FontAwesomeIcon icon={faShoppingCart} className={cx("profile-icon")} /><span>Giỏ hàng</span></button>
                <button onClick={() => (window.location.href = "/order")}><FontAwesomeIcon icon={faBagShopping} className={cx("profile-icon")} /><span>Đơn hàng của tôi</span></button>
                <button onClick={() => (window.location.href = "/profile")}><FontAwesomeIcon icon={faUserCircle} className={cx("profile-icon")} /><span>Thông tin cá nhân</span></button>
                <button onClick={handleLogout} className={cx("logout-btn")}><FontAwesomeIcon icon={faSignOut} className={cx("profile-icon")} /><span>Đăng xuất</span></button>
            </ul>
            {isProfileOpen && (
              <div
                className={cx("backdrop")}
                onClick={() => setIsProfileOpen(false)}
              />
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
