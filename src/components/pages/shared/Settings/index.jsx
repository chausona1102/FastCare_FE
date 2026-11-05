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
          <p className={cx("eyebrow")}>Cài đặt</p>
          <h1>Thông tin cá nhân</h1>
        </div>
      </div>
    </main>
  );
}

export default Settings;
