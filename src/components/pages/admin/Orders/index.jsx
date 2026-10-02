import { useEffect, useMemo, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEye, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import Loading from "~/components/Loading";
import { useToast } from "~/contexts/ToastContext";
import styles from "./Orders.module.scss";

const cx = classNames.bind(styles);
const ORDERS_PER_PAGE = 10;
const ORDER_VIEWS = [
  { key: "all", label: "Tất cả đơn hàng" },
  { key: "pending", label: "Đơn chờ xác nhận" },
  { key: "returns", label: "Yêu cầu trả hàng" },
];
const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  ready_to_pick: "Đang xử lý",
  picking: "Đang lấy hàng",
  picked: "Đang vận chuyển",
  delivering: "Đang giao hàng",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  returning: "Đang hoàn hàng",
};

const formatCurrency = (amount) =>
  `${Number(amount || 0).toLocaleString("vi-VN")} đ`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const fetchOrders = async () => {
      setError("");
      try {
        const { data } = await axiosClient.get(api.order, {
          params: { view: activeView },
          signal: controller.signal,
        });
        setOrders(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || "Không thể tải danh sách đơn hàng.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchOrders();
    return () => controller.abort();
  }, [activeView]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return orders.filter((order) => {
      const searchableValues = [
        order.clientOrderCode,
        order.ghnOrderCode,
        order._id,
        order.user?.fullname,
        order.user?.username,
        order.user?.email,
        order.toName,
        order.toPhone,
      ];
      const matchesSearch = !keyword || searchableValues
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("vi").includes(keyword));
      return matchesSearch;
    });
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handleConfirmOrder = async (order) => {
    const orderId = order._id || order.id;
    if (!window.confirm(`Xác nhận đơn ${order.clientOrderCode || orderId} và tạo vận đơn GHN?`)) {
      return;
    }

    setConfirmingOrderId(orderId);
    try {
      const { data: updatedOrder } = await axiosClient.put(`${api.order}/confirm/${orderId}`);
      if (activeView === "pending") {
        setOrders((currentOrders) => currentOrders.filter(
          (currentOrder) => (currentOrder._id || currentOrder.id) !== orderId
        ));
        if ((selectedOrder?._id || selectedOrder?.id) === orderId) setSelectedOrder(null);
      } else {
        setOrders((currentOrders) => currentOrders.map((currentOrder) =>
          (currentOrder._id || currentOrder.id) === orderId
            ? { ...currentOrder, ...updatedOrder, items: currentOrder.items }
            : currentOrder
        ));
        if ((selectedOrder?._id || selectedOrder?.id) === orderId) {
          setSelectedOrder((currentOrder) => ({ ...currentOrder, ...updatedOrder }));
        }
      }
      showToast({ title: "Đã xác nhận đơn hàng và tạo vận đơn GHN.", type: "success" });
    } catch (requestError) {
      showToast({
        title: requestError.response?.data?.message || "Xác nhận đơn hàng thất bại. Đơn vẫn ở trạng thái chờ xác nhận.",
        type: "error",
      });
    } finally {
      setConfirmingOrderId("");
    }
  };

  if (loading) return <div className={cx("loading")}><Loading /></div>;

  return (
    <section className={cx("page")}>
      <header className={cx("page-header")}>
        <div>
          <p className={cx("eyebrow")}>Vận hành Đơn hàng</p>
          <p className={cx("subtitle")}>Theo dõi đơn hàng và thông tin giao nhận</p>
        </div>
      </header>

      {error && <div className={cx("alert")} role="alert">{error}</div>}

      <div className={cx("order-tabs")} role="tablist" aria-label="Danh sách đơn hàng">
        {ORDER_VIEWS.map((view) => (
          <button
            key={view.key}
            className={cx("order-tab", { active: activeView === view.key })}
            type="button"
            role="tab"
            aria-selected={activeView === view.key}
            onClick={() => {
              setActiveView(view.key);
              setCurrentPage(1);
              setSelectedOrder(null);
            }}
          >
            {view.label}
          </button>
        ))}
      </div>

      <div className={cx("pending-bar")} role="status" aria-live="polite">
        <span className={cx("pending-label")}>
          {ORDER_VIEWS.find((view) => view.key === activeView)?.label}
        </span>
        <strong className={cx("pending-count")}>{orders.length}</strong>
        <span>{activeView === "all" ? "đơn mới nhất (tối đa 50)" : "đơn hàng"}</span>
      </div>

      <div className={cx("toolbar")}>
        <label className={cx("search-field")}>
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <input
            type="search"
            value={search}
            aria-label="Tìm đơn hàng"
            placeholder="Mã đơn, khách hàng, email hoặc số điện thoại"
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </label>
        <span className={cx("result-count")}>{filteredOrders.length} đơn hàng</span>
      </div>

      <div className={cx("table-wrap")}>
        <table className={cx("order-table")}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày tạo</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th aria-label="Thao tác" />
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => {
              const orderId = order._id || order.id;
              const itemCount = (order.items || []).reduce(
                (count, item) => count + Number(item.quantity || 0),
                0
              );
              return (
                <tr key={orderId}>
                  <td>
                    <strong className={cx("order-code")}>
                      {order.clientOrderCode || order.ghnOrderCode || orderId}
                    </strong>
                    {order.ghnOrderCode && (
                      <small className={cx("secondary-code")}>GHN: {order.ghnOrderCode}</small>
                    )}
                  </td>
                  <td>
                    <strong className={cx("customer-name")}>{order.user?.fullname || order.toName || "Khách hàng"}</strong>
                    <small className={cx("customer-meta")}>{order.user?.email || order.toPhone || "-"}</small>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{itemCount} sản phẩm</td>
                  <td className={cx("amount")}>{formatCurrency(order.totalPrice)}</td>
                  <td>
                    <span className={cx("status", `status-${order.status || "unknown"}`)}>
                      {STATUS_LABELS[order.status] || order.status || "Không rõ"}
                    </span>
                  </td>
                  <td>
                    <div className={cx("row-actions")}>
                      <button
                        className={cx("view-button")}
                        type="button"
                        title="Xem chi tiết đơn hàng"
                        aria-label={`Xem đơn ${order.clientOrderCode || orderId}`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      {order.status === "pending" && (
                        <button
                          className={cx("confirm-button")}
                          type="button"
                          title="Xác nhận và tạo đơn GHN"
                          aria-label={`Xác nhận đơn ${order.clientOrderCode || orderId}`}
                          disabled={confirmingOrderId === orderId}
                          onClick={() => handleConfirmOrder(order)}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {visibleOrders.length === 0 && (
              <tr><td className={cx("empty-state")} colSpan="7">Không tìm thấy đơn hàng phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className={cx("pagination")} aria-label="Phân trang đơn hàng">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
            Trước
          </button>
          <span>Trang {currentPage} / {totalPages}</span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
            Sau
          </button>
        </nav>
      )}

      {selectedOrder && (
        <div className={cx("modal-backdrop")} role="presentation" onMouseDown={() => setSelectedOrder(null)}>
          <section
            className={cx("detail-modal")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className={cx("modal-header")}>
              <div>
                <p className={cx("eyebrow")}>Chi tiết đơn hàng</p>
                <h2 id="order-detail-title">{selectedOrder.clientOrderCode || selectedOrder._id}</h2>
              </div>
              <button className={cx("close-button")} type="button" aria-label="Đóng" onClick={() => setSelectedOrder(null)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </header>
            <div className={cx("detail-grid")}>
              <div className={cx("detail-section")}>
                <h3>Người nhận</h3>
                <p>{selectedOrder.toName || selectedOrder.user?.fullname || "-"}</p>
                <p>{selectedOrder.toPhone || selectedOrder.user?.phone || "-"}</p>
                <p>{selectedOrder.toAddress || "Chưa có địa chỉ"}</p>
                <p className={cx("note")}>Ghi chú: {selectedOrder.note || "Không có"}</p>
              </div>
              <div className={cx("detail-section")}>
                <h3>Thanh toán & trạng thái</h3>
                <p>{selectedOrder.paymentTypeId === 2 ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản"}</p>
                <p>{STATUS_LABELS[selectedOrder.status] || selectedOrder.status || "Không rõ"}</p>
                <p>Mã GHN: {selectedOrder.ghnOrderCode || "-"}</p>
                <p>Ngày tạo: {formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>
            <div className={cx("detail-section", "items-section")}>
              <h3>Sản phẩm</h3>
              {(selectedOrder.items || []).length ? (
                <div className={cx("item-list")}>
                  {selectedOrder.items.map((item) => (
                    <div className={cx("order-item")} key={item._id || item.code}>
                      {item.product?.avatar && <img src={item.product.avatar} alt="" />}
                      <div className={cx("item-copy")}>
                        <strong>{item.title || item.product?.title || "Sản phẩm"}</strong>
                        <span>{item.variant?.storage || ""}{item.color ? ` · ${item.color}` : ""}</span>
                      </div>
                      <span className={cx("item-quantity")}>x{item.quantity || 0}</span>
                      <strong>{formatCurrency(Number(item.currentPrice || 0) * Number(item.quantity || 0))}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={cx("note")}>Không có thông tin sản phẩm.</p>
              )}
              <div className={cx("detail-total")}>
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(selectedOrder.totalPrice)}</strong>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default AdminOrders;