// Cart/index.jsx
import styles from "./Cart.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faHeart } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { converseVND, converseKilo } from "~/utils/functions.jsx";
import { useSelector } from "react-redux";
import axiosClient from "~/api/axiosClient";
import api from "~/api";
const cx = classNames.bind(styles);

function Cart({
  id,
  title,
  minPrice,
  avatar,
  sold,
  discount,
  installment,
  screenSize,
  rom,
  to,
}) {
  const user = useSelector((state) => state.auth.user);

  const handleClick = () => {
    if (user) {
      axiosClient
        .post(api.behavior, { action: "click", product: id })
        .catch((e) => console.error("Unable to record click behavior: ", e));
    }
  };

  return (
    <Link to={to} onClick={handleClick}>
      <div className={cx("wrapper")}>
        {/* Badges góc trên */}
        {discount > 0 && (
          <div className={cx("badge-discount")}>Giảm {discount}%</div>
        )}
        {installment >= 0 && (
          <div className={cx("badge-installment")}>Trả góp {installment}%</div>
        )}

        {/* Ảnh */}
        <div className={cx("image-wrap")}>
          <img src={avatar} alt={title} className={cx("image")} />
          <button
            className={cx("btn-add")}
            //  onClick={(e) => {
            //       e.preventDefault();
            //       alert(id);
            //     }}
          >
            <FontAwesomeIcon icon={faCartPlus} />
            <span>Thêm vào giỏ</span>
          </button>
        </div>

        {/* Thông tin */}
        <div className={cx("info")}>
          <h3 className={cx("title")}>{title}</h3>

          {/* Giá */}
          <div className={cx("price-wrap")}>
            <span className={cx("price")}>{converseVND(minPrice)}</span>
            {discount > 0 && (
              <span className={cx("price-original")}>
                {converseVND(Math.round(minPrice / (1 - discount / 100)))}
              </span>
            )}
          </div>

          {/* Tags: screenSize, rom */}
          <div className={cx("tags")}>
            {screenSize && (
              <span className={cx("tag")}>{screenSize} inches</span>
            )}
            {rom && <span className={cx("tag")}>{rom}</span>}
          </div>

          {/* Trả góp */}
          {installment >= 0 && (
            <p className={cx("installment-text")}>
              Trả góp {installment}% - 0đ phụ phí - 0đ trả trước
            </p>
          )}

          {/* Rating + Yêu thích */}
          <div className={cx("bottom")}>
            <div className={cx("rating")}>
              <span className={cx("sold")}>Lượt bán:</span>
              <span className={cx("sold-amount")}>{converseKilo(sold)}</span>
            </div>
            <button
              className={cx("btn-favorite")}
              // onClick={(e) => {
              //   e.preventDefault();
              //   alert(id);
              // }}
            >
              <FontAwesomeIcon icon={faHeart} />
              <span>Yêu thích</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Cart;
