import classNames from "classnames/bind";
import style from "./Loading.module.scss";
const cx = classNames.bind(style);

function LoadingProduct() {
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

// Loading circle - positioned in the center of the screen z-index: 9999
function LoadingCircle() {
  return (
    <div className={cx("loading-circle")} role="status" aria-label="Đang tải">
      <div className={cx("circle")} aria-hidden="true"></div>
    </div>
  );
}

// Loading list - for management pages
function LoadingList() {
  return (
    <div
      className={cx("loading-list")}
      aria-busy="true"
      aria-label="Đang tải danh sách"
    >
      <div className={cx("list-header")} aria-hidden="true">
        <div className={cx("skeleton-line", "title")}></div>
        <div className={cx("skeleton-line", "short")}></div>
      </div>
      <div className={cx("list-items")} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div className={cx("list-item")} key={index}>
            <div className={cx("list-avatar")}></div>
            <div className={cx("list-item-info")}>
              <div className={cx("skeleton-line", "item-title")}></div>
              <div className={cx("skeleton-line", "short")}></div>
            </div>
            <div className={cx("list-item-action")}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingProducts() {
  return (
    <div
      className={cx("products-loading")}
      aria-busy="true"
      aria-label="Đang tải sản phẩm"
    >
      <div className={cx("products-loading-breadcrumb")} aria-hidden="true">
        <div className={cx("skeleton-line", "breadcrumb-line")}></div>
        <div className={cx("skeleton-line", "breadcrumb-line", "short")}></div>
      </div>
      <div className={cx("products-loading-title")} aria-hidden="true">
        <div className={cx("skeleton-line", "page-title-line")}></div>
      </div>
      <div className={cx("products-loading-filters")} aria-hidden="true">
        <div className={cx("skeleton-line", "filter-heading-line")}></div>
        <div className={cx("filter-control")}></div>
        <div className={cx("filter-control")}></div>
        <div className={cx("filter-control")}></div>
        <div className={cx("skeleton-line", "result-count-line")}></div>
      </div>
      <div className={cx("products-loading-grid")} aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <div className={cx("products-loading-card")} key={index}>
            <div className={cx("products-loading-image")}></div>
            <div className={cx("products-loading-info")}>
              <div className={cx("skeleton-line", "product-title-line")}></div>
              <div
                className={cx("skeleton-line", "product-title-line", "short")}
              ></div>
              <div className={cx("skeleton-line", "product-price-line")}></div>
              <div className={cx("products-loading-tags")}>
                <div className={cx("products-loading-tag")}></div>
                <div className={cx("products-loading-tag", "short")}></div>
              </div>
              <div className={cx("skeleton-line", "product-meta-line")}></div>
            </div>
          </div>
        ))}
      </div>
      <div className={cx("products-loading-more")} aria-hidden="true">
        <div className={cx("filter-control", "load-more-control")}></div>
      </div>
    </div>
  );
}

export { LoadingProduct, LoadingCircle, LoadingList, LoadingProducts };
