import style from "./Settings.module.scss";
import classNames from "classnames/bind";
import { useTheme } from "~/contexts/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faPalette, faSun } from "@fortawesome/free-solid-svg-icons";
import SwitchTheme from "~/components/SwitchTheme";

const cx = classNames.bind(style);

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <main className={cx("page")}>
      <header className={cx("topline")}>
        <div className={cx("titleGroup")}>
          <div className={cx("titleIcon")} aria-hidden="true">
            <FontAwesomeIcon icon={faPalette} />
          </div>
          <div>
            <p className={cx("eyebrow")}>Tùy chỉnh</p>
            <h1>Cài đặt</h1>
          </div>
        </div>
        <p className={cx("description")}>
          Cá nhân hóa trải nghiệm FastCare theo sở thích của bạn.
        </p>
      </header>

      <section className={cx("settingsSection")}>
        <div className={cx("sectionHeader")}>
          <div>
            <p className={cx("eyebrow")}>Giao diện</p>
            <h2 id="theme-title">Tùy chỉnh giao diện</h2>
          </div>
          <span className={cx("currentTheme", { dark: isDark })}>
            <span className={cx("statusDot")} aria-hidden="true" />
            Đang dùng: {isDark ? "Tối" : "Sáng"}
          </span>
        </div>

        <div className={cx("themeSection")} aria-labelledby="theme-title">
          <div className={cx("themeIcon", { dark: isDark })} aria-hidden="true">
            <FontAwesomeIcon icon={isDark ? faMoon : faSun} />
          </div>
          <div className={cx("sectionHeading")}>
            <h3>{isDark ? "Chế độ tối" : "Chế độ sáng"}</h3>
            <p>
              {isDark
                ? "Dịu mắt hơn trong môi trường thiếu sáng."
                : "Sáng rõ, dễ quan sát trong môi trường nhiều ánh sáng."}
            </p>
            <span className={cx("saveNote")}>
              Lựa chọn của bạn được tự động lưu cho lần truy cập tiếp theo.
            </span>
          </div>
          <div className={cx("switchControl")}>
            <span className={cx("switchLabel")}>Chế độ tối</span>
            <SwitchTheme theme={theme} toggle={toggleTheme} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default Settings;
