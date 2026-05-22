import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import styles from "./NotFound.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

function NotFound() {
  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        <div className={cx("content")}>
          {/* Animated 404 */}
          <div className={cx("error-code")}>
            <span className={cx("digit")}>4</span>
            <span className={cx("circle")}></span>
            <span className={cx("digit")}>4</span>
          </div>

          {/* Title */}
          <h1 className={cx("title")}>Oops! Trang không tồn tại</h1>

          {/* Description */}
          <p className={cx("description")}>
            Trang bạn đang tìm kiếm có thể đã bị xóa, chuyển đổi, hoặc tạm thời không
            khả dụng.
          </p>

          {/* CTA Buttons */}
          <div className={cx("actions")}>
            <Link to="/" className={cx("btn-primary")}>
              <FontAwesomeIcon icon={faHome} />
              <span>Về Trang Chủ</span>
            </Link>
            <button className={cx("btn-secondary")} onClick={() => window.history.back()}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Quay Lại</span>
            </button>
          </div>

          {/* Helpful Links */}
          <div className={cx("suggestions")}>
            <p className={cx("suggestions-title")}>Bạn đang tìm kiếm:</p>
            <div className={cx("suggestion-links")}>
              <Link to="/products" className={cx("suggestion-link")}>
                Sản Phẩm
              </Link>
              <Link to="/products" className={cx("suggestion-link")}>
                Danh Mục
              </Link>
              <Link to="/" className={cx("suggestion-link")}>
                Trang Chủ
              </Link>
            </div>
          </div>
        </div>

        {/* Illustration */}
        <div className={cx("illustration")}>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="60" r="40" className={cx("circle-main")} />
            <rect x="70" y="90" width="60" height="80" rx="10" className={cx("box")} />
            <rect x="75" y="100" width="15" height="15" rx="2" className={cx("window")} />
            <rect x="110" y="100" width="15" height="15" rx="2" className={cx("window")} />
            <line x1="85" y1="150" x2="95" y2="160" className={cx("line")} />
            <line x1="115" y1="150" x2="105" y2="160" className={cx("line")} />
            <circle cx="100" cy="170" r="3" className={cx("dot")} />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
