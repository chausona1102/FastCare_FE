import styles from "./Header.module.scss";
import classNames from "classnames/bind";
import { logo } from "~/assets/images";
import Button from "~/components/Button";
import Search from "../../../Search";
import Tippy from "@tippyjs/react";
import { Link } from "react-router-dom";
import "tippy.js/dist/tippy.css";
import {
  faBars,
  faUserCircle,
  faShoppingCart,
  faGrip,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
const cx = classNames.bind(styles);

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = JSON.parse(localStorage.getItem("fastcare_user"));

  useEffect(() => {
    const token = localStorage.getItem("fastcare_access_token");
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fastcare_access_token");
    localStorage.removeItem("fastcare_user");
    setIsLoggedIn(false);
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
        <Tippy content="Danh mục" placement="bottom">
          <Button
            primary
            rightIcon={faBars}
            leftIcon={faGrip}
            size="medium"
            className={cx("category-btn")}
          >
            <span className={cx("menu-text")}>Danh mục</span>
          </Button>
        </Tippy>
        <div className={cx("search")}>
          <Search />
        </div>
        <Tippy content="Giỏ hàng" placement="bottom">
          <Button
            rightIcon={faShoppingCart}
            size="medium"
            className={cx("cart-btn")}
          >
            <span className={cx("cart-text")}>Giỏ hàng</span>
          </Button>
        </Tippy>
        {isLoggedIn ? (
          <Button
            onClick={handleLogout}
            primary
            rightIcon={faSignOut}
            size="medium"
            className={cx("login-btn")}
          >
            <span className={cx("login-text")}>
              {user?.fullname || "Người dùng"}
            </span>
          </Button>
        ) : (
          <Button
            primary
            rightIcon={faUserCircle}
            size="medium"
            to="/login"
            className={cx("login-btn")}
          >
            <span className={cx("login-text")}>Đăng nhập</span>
          </Button>
        )}
      </header>
    </div>
  );
}

export default Header;
