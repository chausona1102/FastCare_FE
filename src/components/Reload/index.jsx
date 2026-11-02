import classNames from "classnames/bind";
import styles from "./Reload.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

export default function Reload({
  message = "Đã có lỗi. Vui lòng thử lại.",
  onReload,
}) {
  return (
    <div className={cx("reload-wrapper")}>
      <div className={cx("reload-box")}>
        <FontAwesomeIcon icon={faRedo} className={cx("icon")} />
        <div className={cx("message")}>{message}</div>
        <button className={cx("btn")} onClick={onReload}>
          Tải lại
        </button>
      </div>
    </div>
  );
}
