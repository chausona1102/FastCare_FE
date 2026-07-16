import style from "./Order.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

import { converseStatus, hideNumberPhone, converseVND } from "~/utils/functions.jsx"
import React, { useState, useEffect } from "react";

import axios from 'axios';
import api from "~/api";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faDongSign } from "@fortawesome/free-solid-svg-icons";

function formatDate(dateVal, locale = 'vi-VN') {
  try {
    const d = new Date(dateVal);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }).format(d);
  } catch (e) {
    return new Date(dateVal).toLocaleString();
  }
}

function Order() {
  const user = JSON.parse(localStorage.getItem("fastcare_user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("fastcare_access_token");
    setLoading(true);
    axios
      .get(`${api.order}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setOrders(data);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  function statusMatches(order, filterKey) {
    if (filterKey === "all") return true;
    if (!order) return false;
    const s = (order.status || "").toString().toLowerCase();
    return s.includes(filterKey);
  }

  const filters = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "processing", label: "Đang xử lý" },
    { key: "shipping", label: "Đang vận chuyển" },
    { key: "delivered", label: "Đã nhận hàng" },
    { key: "cancel", label: "Đã hủy" },
  ];

  const filtered = orders.filter((o) => statusMatches(o, filter));
  const visible = filtered.slice(0, visibleCount);

  return (
    <React.Fragment>
    <div className={cx("summary")}>
        <div className={cx("row")}>
          <div className={cx("section-1", "section")}>
            <img src={user?.avatar}/>
            <div className={cx("info")}>
              <span className={cx("title")}>{user?.fullname}</span>
              <span className={cx('sub-title')}>{hideNumberPhone(user?.phone)}</span>
            </div>
          </div>
          <div className={cx("section-2", "section")}>
            <div className={cx("icon")}>
              <FontAwesomeIcon icon={faCartShopping} />
            </div>
            <div className={cx("info")}>
              <span className={cx("title"), "fs-3 fw-bold"}>0</span>
              <span className={cx("sub-title")}>Tổng số đơn hàng đã mua</span>
            </div>
          </div>
          <div className={cx("section-3", "section")}>
            <div className={cx("icon")}>
              <FontAwesomeIcon icon={faDongSign} />
            </div>
            <div className={cx("info")}>
              <span className={cx("title"), "fs-3 fw-bold"}>0 <FontAwesomeIcon icon={faDongSign} /></span>
              <span className={cx("sub-title")}>Tổng tiền tích lũy</span>
            </div>
          </div>
        </div>
      </div>
    <div className={cx("order")}>
      <h1 className={cx("title"), "fs-2 mb-4"}>Đơn hàng của tôi</h1>
      <div className={cx("controls")}> 
        <div className={cx("tabs")}>
          {filters.map((f) => (
            <button
              key={f.key}
              className={cx("tab", { active: filter === f.key })}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cx("content")}> 
        {loading ? (
          <div className={cx("loader")}>Đang tải đơn hàng...</div>
        ) : !filtered || filtered.length === 0 ? (
          <div className={cx("empty")}>
            <div className={cx("emptyIcon")} />
            <p className={cx("emptyText")}>Bạn chưa có đơn hàng nào.</p>
            <p className={cx("emptySub")}>Hãy mua sắm để tạo đơn hàng đầu tiên.</p>
          </div>
        ) : (
          <div className={cx("orderList")}>
              {visible.map((o) => (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/order/${o._id || o.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/order/${o._id || o.id}`); }}
                  className={cx("orderCard")}
                  key={o._id || o.id || Math.random()}
                >
                  <div className={cx("cardLeft")}> 
                    <div className={cx("orderCode")}>Mã: {o._id || "-"}</div>
                    <div className={cx("orderDate")}>{formatDate(o.createdAt || Date.now())}</div>
                    <div className={cx("orderItems")}>{(o.items && o.items.length) || o.itemCount || 0} sản phẩm</div>
                  </div>
                  <div className={cx("cardRight")}> 
                    <div className={cx("orderTotal")}>{converseVND(o.totalPrice || o.amount || o.price)}</div>
                    <div className={cx("orderStatus")}>{(converseStatus(o.status) || "-").toString()}</div>
                  </div>
                </div>
              ))}
              {visibleCount < filtered.length && (
                <div className={cx('loadMoreWrap')}>
                  <button className={cx('loadMore')} onClick={() => setVisibleCount((v) => v + 8)}>Xem thêm</button>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
    </React.Fragment>
  );
}

export default Order;