import { useEffect, useRef, useState } from "react";
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
const INITIAL_ORDER_LIMIT = 50;
const ADDITIONAL_ORDER_LIMIT = 20;
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
  return_request: "Yêu cầu trả hàng",
  return_approved: "Đã duyệt - chờ mang đến",
  return_rejected: "Đã từ chối trả hàng",
  return_received: "Đã tiếp nhận - chờ xử lý",
  return_completed: "Đã hoàn tất trả hàng",
  return_expired: "Yêu cầu trả hàng quá hạn",
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [activeView, setActiveView] = useState("all");
  const activeViewRef = useRef(activeView);
  const searchRef = useRef(search);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState("");
  const [rejectingOrderId, setRejectingOrderId] = useState("");
  const [returnRejectionReason, setReturnRejectionReason] = useState("");
  const [returnResolution, setReturnResolution] = useState("refund");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const { showToast } = useToast();

  const applyOrderUpdate = (updatedOrder) => {
    const orderId = updatedOrder._id || updatedOrder.id;
    setOrders((currentOrders) => currentOrders.map((order) =>
      (order._id || order.id) === orderId ? { ...order, ...updatedOrder } : order
    ));
    setSelectedOrder((currentOrder) =>
      currentOrder && (currentOrder._id || currentOrder.id) === orderId
        ? { ...currentOrder, ...updatedOrder }
        : currentOrder
    );
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      setError("");
      try {
        const { data } = await axiosClient.get(api.order, {
          params: {
            view: activeView,
            search: search.trim(),
            ...(activeView === "all" ? { skip: 0, limit: INITIAL_ORDER_LIMIT } : {}),
          },
          signal: controller.signal,
        });
        const fetchedOrders = Array.isArray(data) ? data : [];
        setOrders(fetchedOrders);
        setHasMoreOrders(activeView === "all" && fetchedOrders.length === INITIAL_ORDER_LIMIT);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || "Không thể tải danh sách đơn hàng.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setSearching(false);
        }
      }
    };

    const timeoutId = window.setTimeout(fetchOrders, search.trim() ? 500 : 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [activeView, search]);

  const handleLoadMore = async () => {
    const requestedSearch = search.trim();
    setLoadingMore(true);
    setError("");
    try {
      const { data } = await axiosClient.get(api.order, {
        params: {
          view: "all",
          search: requestedSearch,
          skip: orders.length,
          limit: ADDITIONAL_ORDER_LIMIT,
        },
      });
      const fetchedOrders = Array.isArray(data) ? data : [];
      if (activeViewRef.current === "all" && searchRef.current.trim() === requestedSearch) {
        setOrders((currentOrders) => [...currentOrders, ...fetchedOrders]);
        setHasMoreOrders(fetchedOrders.length === ADDITIONAL_ORDER_LIMIT);
      }
    } catch (requestError) {
      if (activeViewRef.current === "all" && searchRef.current.trim() === requestedSearch) {
        setError(requestError.response?.data?.message || "Không thể tải thêm đơn hàng.");
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
  const visibleOrders = orders.slice(
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

  const handleRejectOrder = async (order) => {
    const orderId = order._id || order.id;
    if (!window.confirm(`Từ chối đơn ${order.clientOrderCode || orderId}? Tồn kho sẽ được hoàn lại.`)) {
      return;
    }

    setRejectingOrderId(orderId);
    try {
      const { data: updatedOrder } = await axiosClient.put(`${api.order}/reject/${orderId}`);
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
      showToast({ title: "Đã từ chối đơn hàng và hoàn lại tồn kho.", type: "success" });
    } catch (requestError) {
      showToast({
        title: requestError.response?.data?.message || "Từ chối đơn hàng thất bại.",
        type: "error",
      });
    } finally {
      setRejectingOrderId("");
    }
  };

  const handleReviewReturn = async (order, decision) => {
    const orderId = order._id || order.id;
    if (decision === "reject" && returnRejectionReason.trim().length < 5) {
      showToast({ title: "Nhập lý do từ chối (ít nhất 5 ký tự).", type: "error" });
      return;
    }
    const actionLabel = decision === "approve" ? "duyệt" : "từ chối";
    if (!window.confirm(`Xác nhận ${actionLabel} yêu cầu trả hàng ${order.clientOrderCode || orderId}?`)) {
      return;
    }

    setReturnSubmitting(true);
    try {
      const { data: response } = await axiosClient.put(`${api.order}/return/${orderId}/review`, {
        decision,
        rejectionReason: returnRejectionReason.trim(),
      });
      const updatedOrder = response.order || response;
      applyOrderUpdate(updatedOrder);
      setReturnRejectionReason("");
      showToast({
        title: response.notificationWarning
          || (decision === "approve"
          ? "Đã duyệt yêu cầu và gửi hướng dẫn mang hàng đến cửa hàng."
          : "Đã từ chối yêu cầu và gửi lý do cho khách hàng."),
        type: response.notificationWarning ? "error" : "success",
      });
    } catch (requestError) {
      showToast({
        title: requestError.response?.data?.message || `Không thể ${actionLabel} yêu cầu trả hàng.`,
        type: "error",
      });
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleCompleteReturn = async (order) => {
    const orderId = order._id || order.id;
    setReturnSubmitting(true);
    try {
      const { data: updatedOrder } = await axiosClient.put(`${api.order}/return/${orderId}/complete`, {
        resolution: returnResolution,
      });
      applyOrderUpdate(updatedOrder);
      showToast({ title: "Đã ghi nhận hoàn tất xử lý trả hàng.", type: "success" });
    } catch (requestError) {
      showToast({
        title: requestError.response?.data?.message || "Không thể hoàn tất xử lý trả hàng.",
        type: "error",
      });
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleReceiveReturn = async (order) => {
    const orderId = order._id || order.id;
    if (!window.confirm(`Xác nhận đã kiểm tra và tiếp nhận sản phẩm trả của đơn ${order.clientOrderCode || orderId}?`)) {
      return;
    }

    setReturnSubmitting(true);
    try {
      const { data: updatedOrder } = await axiosClient.put(`${api.order}/return/${orderId}/receive`);
      applyOrderUpdate(updatedOrder);
      showToast({ title: "Đã ghi nhận đã kiểm tra và tiếp nhận sản phẩm.", type: "success" });
    } catch (requestError) {
      showToast({
        title: requestError.response?.data?.message || "Không thể ghi nhận tiếp nhận sản phẩm.",
        type: "error",
      });
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleExpireReturn = async (order) => {
    const orderId = order._id || order.id;
    setReturnSubmitting(true);
    try {
      const { data: updatedOrder } = await axiosClient.put(`${api.order}/return/${orderId}/expire`);
      applyOrderUpdate(updatedOrder);
      showToast({ title: "Đã đóng yêu cầu trả hàng quá hạn.", type: "success" });
    } catch (requestError) {
      showToast({
        title: requestError.response?.data?.message || "Không thể đóng yêu cầu trả hàng.",
        type: "error",
      });
    } finally {
      setReturnSubmitting(false);
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
              activeViewRef.current = view.key;
              setLoading(true);
              setError("");
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
        <span>{activeView === "all" ? "đơn hàng đã tải" : "đơn hàng"}</span>
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
              const value = event.target.value;
              searchRef.current = value;
              setSearch(value);
              setSearching(true);
              setCurrentPage(1);
            }}
          />
        </label>
        <span className={cx("result-count")}>
          {searching ? "Đang tìm..." : `${orders.length} đơn hàng`}
        </span>
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
                    <small className={cx("secondary-code")}>
                      {order.source === "in_store" ? "Bán tại quầy" : "Đơn online"}
                    </small>
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
                        <>
                          <button
                            className={cx("confirm-button")}
                            type="button"
                            title="Xác nhận và tạo đơn GHN"
                            aria-label={`Xác nhận đơn ${order.clientOrderCode || orderId}`}
                            disabled={confirmingOrderId === orderId || rejectingOrderId === orderId}
                            onClick={() => handleConfirmOrder(order)}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button
                            className={cx("reject-button")}
                            type="button"
                            title="Từ chối đơn và hoàn tồn kho"
                            aria-label={`Từ chối đơn ${order.clientOrderCode || orderId}`}
                            disabled={confirmingOrderId === orderId || rejectingOrderId === orderId}
                            onClick={() => handleRejectOrder(order)}
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </>
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

      {activeView === "all" && hasMoreOrders && (
        <div className={cx("load-more-wrap")}>
          <button
            className={cx("load-more")}
            type="button"
            disabled={loadingMore || searching}
            onClick={handleLoadMore}
          >
            {loadingMore ? "Đang tải..." : "Tải thêm 20 đơn"}
          </button>
        </div>
      )}

      {/* Modal Order Details */}
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
                <h3>{selectedOrder.source === "in_store" ? "Khách hàng" : "Người nhận"}</h3>
                <p>{selectedOrder.toName || selectedOrder.user?.fullname || "-"}</p>
                <p>{selectedOrder.toPhone || selectedOrder.user?.phone || "-"}</p>
                <p>
                  {selectedOrder.source === "in_store"
                    ? "Nhận tại cửa hàng"
                    : selectedOrder.toAddress || "Chưa có địa chỉ"}
                </p>
                <p className={cx("note")}>Ghi chú: {selectedOrder.note || "Không có"}</p>
              </div>
              <div className={cx("detail-section")}>
                <h3>Thanh toán & trạng thái</h3>
                <p>
                  {selectedOrder.source === "in_store"
                    ? "Bán tại quầy"
                    : "Đơn online"}
                </p>
                <p>
                  {{
                    cash: "Tiền mặt",
                    bank_transfer: "Chuyển khoản",
                    cod: "Thanh toán khi nhận hàng (COD)",
                    vnpay: "VNPAY",
                  }[selectedOrder.paymentMethod]
                    || (selectedOrder.paymentTypeId === 2
                      ? "Thanh toán khi nhận hàng (COD)"
                      : "VNPAY")}
                </p>
                {(selectedOrder.paymentTypeId === 1 || selectedOrder.source === "in_store") && (
                  <p>
                    Trạng thái thanh toán: {
                      { paid: "Đã thanh toán", failed: "Thất bại", pending: "Đang chờ thanh toán" }[
                        selectedOrder.paymentStatus || "pending"
                      ] || "Chưa xác định"
                    }
                  </p>
                )}
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
            {selectedOrder.returnRequest && (
              <section className={cx("detail-section", "items-section", "return-detail")}>
                <h3>Yêu cầu trả hàng</h3>
                <p><strong>Lý do:</strong> {selectedOrder.returnRequest.reason || "-"}</p>
                <p><strong>Mô tả:</strong> {selectedOrder.returnRequest.description || "-"}</p>
                <p><strong>Gửi lúc:</strong> {formatDate(selectedOrder.returnRequest.requestedAt)}</p>
                {selectedOrder.returnRequest.images?.length > 0 && (
                  <div className={cx("return-images")}>
                    {selectedOrder.returnRequest.images.map((image, index) => (
                      <a href={image} target="_blank" rel="noreferrer" key={image}>
                        <img src={image} alt={`Ảnh tình trạng sản phẩm ${index + 1}`} />
                      </a>
                    ))}
                  </div>
                )}
                {selectedOrder.returnRequest.rejectionReason && (
                  <p><strong>Lý do từ chối:</strong> {selectedOrder.returnRequest.rejectionReason}</p>
                )}
                {selectedOrder.returnRequest.instructions && (
                  <>
                    <p><strong>Hướng dẫn:</strong> {selectedOrder.returnRequest.instructions}</p>
                    <p><strong>Hạn mang đến:</strong> {formatDate(selectedOrder.returnRequest.dropoffDeadline)}</p>
                  </>
                )}
                {selectedOrder.returnRequest.receivedAt && (
                  <p><strong>Nhân viên tiếp nhận lúc:</strong> {formatDate(selectedOrder.returnRequest.receivedAt)}</p>
                )}
                {selectedOrder.returnRequest.resolution && (
                  <p><strong>Kết quả:</strong> {selectedOrder.returnRequest.resolution === "refund" ? "Hoàn tiền" : "Đổi hàng"}</p>
                )}

                {selectedOrder.status === "return_request" && (
                  <div className={cx("return-actions")}>
                    <button
                      type="button"
                      className={cx("return-approve")}
                      disabled={returnSubmitting}
                      onClick={() => handleReviewReturn(selectedOrder, "approve")}
                    >
                      Duyệt yêu cầu
                    </button>
                    <label className={cx("return-reason-label")} htmlFor="returnRejectionReason">Lý do từ chối (bắt buộc)</label>
                    <textarea
                      id="returnRejectionReason"
                      value={returnRejectionReason}
                      onChange={(event) => setReturnRejectionReason(event.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Nêu rõ lý do để khách hàng biết"
                    />
                    <button
                      type="button"
                      className={cx("return-reject")}
                      disabled={returnSubmitting || returnRejectionReason.trim().length < 5}
                      onClick={() => handleReviewReturn(selectedOrder, "reject")}
                    >
                      Từ chối yêu cầu
                    </button>
                  </div>
                )}
                {selectedOrder.status === "return_received" && (
                  <div className={cx("return-actions")}>
                    <label className={cx("return-reason-label")} htmlFor="returnResolution">Xử lý sau khi kiểm tra</label>
                    <select
                      id="returnResolution"
                      value={returnResolution}
                      onChange={(event) => setReturnResolution(event.target.value)}
                    >
                      <option value="refund">Hoàn tiền</option>
                      <option value="exchange">Đổi hàng</option>
                    </select>
                    <button
                      type="button"
                      className={cx("return-approve")}
                      disabled={returnSubmitting}
                      onClick={() => handleCompleteReturn(selectedOrder)}
                    >
                      Trả hàng hoàn tất
                    </button>
                  </div>
                )}
                {selectedOrder.status === "return_approved" && (
                  <div className={cx("return-actions")}>
                    <p>Kiểm tra sản phẩm khách mang đến cửa hàng, sau đó ghi nhận tiếp nhận tại đây.</p>
                    <button
                      type="button"
                      className={cx("return-approve")}
                      disabled={returnSubmitting}
                      onClick={() => handleReceiveReturn(selectedOrder)}
                    >
                      Xác nhận đã kiểm tra và tiếp nhận
                    </button>
                    <p>Nếu khách không mang sản phẩm đến trước hạn, đóng yêu cầu tại đây.</p>
                      <button
                        type="button"
                        className={cx("return-reject")}
                        disabled={returnSubmitting}
                        onClick={() => handleExpireReturn(selectedOrder)}
                      >
                        Đóng yêu cầu hết hạn
                      </button>
                  </div>
                )}
              </section>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export default AdminOrders;