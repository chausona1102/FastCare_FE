import classNames from "classnames/bind";
import style from "./Loading.module.scss";
const cx = classNames.bind(style);

function Loading() {
  return (
    <div className={cx("wrapper")}>
      <div className={cx("loading-container")}>
        <div className={cx("loading-header")}>
          <div className={cx("skeleton-breadcrumb")}></div>
          <div className={cx("skeleton-breadcrumb", "short")}></div>
        </div>
        <div className={cx("loading-content")}>
          <div className={cx("skeleton-image")}></div>
          <div className={cx("skeleton-info")}>
            <div className={cx("skeleton-line", "title")}></div>
            <div className={cx("skeleton-line", "subtitle")}></div>
            <div className={cx("skeleton-line")}></div>
            <div className={cx("skeleton-line", "short")}></div>
            <div style={{ marginTop: "20px" }}>
              <div className={cx("skeleton-line")}></div>
              <div className={cx("skeleton-line")}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
