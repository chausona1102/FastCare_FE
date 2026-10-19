import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faDongSign } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import style from "./Order.module.scss";

const cx = classNames.bind(style);

export default function OrderSummary({ user, completedOrder, totalPrice, hideNumberPhone, converseVND }) {
  return (
    <div className={cx("summary")}>
      <div className={cx("row")}>
        <div className={cx("section-1", "section")}>
          <img src={user?.avatar} className="mx-2" alt={user?.fullname || "User avatar"} />
          <div className={cx("info")}>
            <span className={cx("title")}>{user?.fullname}</span>
            <span className={cx("sub-title")}>{hideNumberPhone(user?.phone)}</span>
          </div>
        </div>
        <div className={cx("section-2", "section")}>
          <div className={cx("icon")}>
            <FontAwesomeIcon icon={faCartShopping} />
          </div>
          <div className={cx("info")}>
            <span className={cx("title", "fs-3 fw-bold")}>{completedOrder.length}</span>
            <span className={cx("sub-title")}>Tổng số đơn hàng đã mua</span>
          </div>
        </div>

        <div className={cx("section-3", "section")}>
          <div className={cx("icon")}>
            <FontAwesomeIcon icon={faDongSign} />
          </div>
          <div className={cx("info")}>
            <span className={cx("title", "fs-3 fw-bold")}>{converseVND(totalPrice(completedOrder))}</span>
            <span className={cx("sub-title")}>Tổng tiền tích lũy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
