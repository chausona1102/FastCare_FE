import style from "./SwitchTheme.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
const cx = classNames.bind(style);

function SwitchTheme({ theme, toggle }) {
  return (
    <Tippy content="Dark/Light Mode" placement="bottom">
      <div className={cx("themeSwitch", "form-check form-switch")}>
        <input
          className={cx("form-check-input")}
          type="checkbox"
          id="theme-switch"
          role="switch"
          aria-label="Bật hoặc tắt chế độ tối"
          checked={theme === "dark"}
          onChange={toggle}
        />
        <span className={cx("themeSwitchThumb")} aria-hidden="true">
          <FontAwesomeIcon icon={theme === "dark" ? faMoon : faSun} />
        </span>
      </div>
    </Tippy>
  );
}

export default SwitchTheme;
