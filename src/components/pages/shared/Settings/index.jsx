import style from "./Settings.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

function Settings() {
  return (
    <main className={cx("page")}>
      <div className={cx("topline")}>
        <div>
          <p className={cx("eyebrow")}>TÀI KHOẢN CỦA BẠN</p>
          <h1>Thông tin cá nhân</h1>
        </div>
        <Link to="/order" className={cx("orders-link")}>
          Đơn hàng của tôi
          <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}

export default Settings;
