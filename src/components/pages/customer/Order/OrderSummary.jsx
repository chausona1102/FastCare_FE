import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMedal,
  faCartShopping,
  faDongSign,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import style from "./Order.module.scss";

const cx = classNames.bind(style);

const rankLabels = {
  black: "Siêu cấp",
  silver: "Bạc",
  gold: "Vàng",
  platinum: "Bạch kim",
  diamond: "Kim cương",
};

export default function OrderSummary({
  user,
  completedOrder,
  totalPrice,
  hideNumberPhone,
  converseVND,
  rank,
}) {
  const rankLabel = rank?.rank
    ? rankLabels[rank.rank.toLowerCase()] || rank.rank
    : "Chưa có";

  return (
    <div className={cx("summary")}>
      <div className={cx("row")}>
        <div className={cx("section-1", "section")}>
          <img
            src={user?.avatar}
            className="mx-2"
            alt={user?.fullname || "User avatar"}
          />
          <div className={cx("info")}>
            <span className={cx("title")}>{user?.fullname}</span>
            <span className={cx("sub-title")}>
              {hideNumberPhone(user?.phone)}
            </span>
          </div>
        </div>
        <div className={cx("section-2", "section")}>
          <div className={cx("icon")}>
            <FontAwesomeIcon icon={faCartShopping} />
          </div>
          <div className={cx("info")}>
            <span className={cx("title", "fs-3 fw-bold")}>
              {completedOrder.length}
            </span>
            <span className={cx("sub-title")}>Tổng số đơn hàng đã mua</span>
          </div>
        </div>

        <div className={cx("section-3", "section")}>
          <div className={cx("icon")}>
            <FontAwesomeIcon icon={faDongSign} />
          </div>
          <div className={cx("info")}>
            <span className={cx("title", "fs-3 fw-bold")}>
              {converseVND(totalPrice(completedOrder))}
            </span>
            <span className={cx("sub-title")}>Tổng tiền tích lũy</span>
          </div>
        </div>

        <div className={cx("section-4", "section")}>
          <div className={cx("icon")}>
            <FontAwesomeIcon icon={faMedal} />
          </div>
          <div className={cx("info")}>
            <span className={cx("title", "fs-3 fw-bold")}>{rankLabel}</span>
            <span className={cx("sub-title")}>Hạng thành viên</span>
          </div>
        </div>
      </div>
    </div>
  );
}
