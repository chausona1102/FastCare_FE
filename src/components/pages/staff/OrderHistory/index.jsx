import { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames/bind";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import Loading from "~/components/Loading";
import styles from "./OrderHistory.module.scss";

const cx = classNames.bind(styles);
const INITIAL_LIMIT = 50;
const ADDITIONAL_LIMIT = 20;

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "delivered", label: "Đã giao" },
  { value: "return_completed", label: "Đã hoàn tất trả hàng" },
  { value: "cancelled", label: "Đã hủy" },
];

const STATUS_LABELS = {
  delivered: "Đã giao",
  return_completed: "Đã hoàn tất trả hàng",
  cancelled: "Đã hủy",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loadedQueryKey, setLoadedQueryKey] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  const requestGenerationRef = useRef(0);

  const queryKey = `${debouncedSearch.trim()}\u001f${status}`;
  const loading = loadedQueryKey !== queryKey;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search), 400);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    requestGenerationRef.current += 1;
    const requestedQueryKey = `${debouncedSearch.trim()}\u001f${status}`;

    const loadOrders = async () => {
      try {
        const { data } = await axiosClient.get(api.order, {
          params: {
            view: "history",
            skip: 0,
            limit: INITIAL_LIMIT,
            search: debouncedSearch.trim(),
            status,
          },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          const fetchedOrders = Array.isArray(data) ? data : [];
          setOrders(fetchedOrders);
          setHasMore(fetchedOrders.length === INITIAL_LIMIT);
          setError(null);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError({
            queryKey: requestedQueryKey,
            message: requestError.response?.data?.message || "Không thể tải lịch sử đơn hàng.",
          });
        }
      } finally {
        if (!controller.signal.aborted) setLoadedQueryKey(requestedQueryKey);
      }
    };

    loadOrders();
    return () => controller.abort();
  }, [debouncedSearch, status]);

  const visibleCount = orders.length;
  const totalItems = useMemo(
    () => orders.reduce((total, order) => total + (order.items || []).reduce(
      (orderTotal, item) => orderTotal + (Number(item.quantity) || 0),
      0,
    ), 0),
    [orders],
  );

  const handleLoadMore = async () => {
    const requestGeneration = requestGenerationRef.current;
    setLoadingMore(true);
    try {
      const { data } = await axiosClient.get(api.order, {
        params: {
          view: "history",
          skip: orders.length,
          limit: ADDITIONAL_LIMIT,
          search: debouncedSearch.trim(),
          status,
        },
      });
      const fetchedOrders = Array.isArray(data) ? data : [];
      if (requestGenerationRef.current === requestGeneration) {
        setOrders((currentOrders) => [...currentOrders, ...fetchedOrders]);
        setHasMore(fetchedOrders.length === ADDITIONAL_LIMIT);
      }
    } catch (requestError) {
      if (requestGenerationRef.current === requestGeneration) {
        setError({
          queryKey,
          message: requestError.response?.data?.message || "Không thể tải thêm đơn hàng.",
        });
      }
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className={cx("page")}>
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>Quản lý đơn hàng</p>
          <h1>Lịch sử đơn hàng</h1>
          <p className={cx("summary")}>Tra cứu các đơn đã giao, đã hủy và các trường hợp trả hàng đã hoàn tất.</p>
        </div>
      </header>

      <div className={cx("summaryCards")}>
        <article className={cx("summaryCard")}>
          <span className={cx("summaryLabel")}>Đơn đang hiển thị</span>
          <strong>{visibleCount}</strong>
          <small>tải theo từng đợt</small>
        </article>
        <article className={cx("summaryCard")}>
          <span className={cx("summaryLabel")}>Sản phẩm trong danh sách</span>
          <strong>{totalItems}</strong>
          <small>tổng số lượng trên các đơn đã tải</small>
        </article>
      </div>

      <div className={cx("toolbar")}>
        <label className={cx("searchField")}>
          <span>Tìm kiếm</span>
          <input
            type="search"
            value={search}
            placeholder="Mã đơn, tên hoặc số điện thoại khách hàng"
            aria-label="Tìm kiếm lịch sử đơn hàng"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className={cx("filterField")}>
          <span>Lọc trạng thái</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <span className={cx("resultCount")}>{visibleCount} đơn hàng</span>
      </div>

      {error?.queryKey === queryKey && <div className={cx("alert")} role="alert">{error.message}</div>}

      <div className={cx("tableWrap")}>
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Ngày tạo</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className={cx("emptyState")} colSpan="6"><Loading /></td></tr>
            ) : orders.length > 0 ? (
              orders.map((order) => {
                const orderId = order._id || order.id;
                const itemCount = (order.items || []).reduce(
                  (total, item) => total + (Number(item.quantity) || 0),
                  0,
                );
                const customerName = order.user?.fullname || order.toName || "Khách hàng";

                return (
                  <tr key={orderId}>
                    <td>
                      <span className={cx("orderCode")}>{order.clientOrderCode || order.ghnOrderCode || orderId}</span>
                      {order.ghnOrderCode && <small className={cx("secondaryText")}>GHN: {order.ghnOrderCode}</small>}
                    </td>
                    <td>
                      <span className={cx("customerName")}>{customerName}</span>
                      <small className={cx("secondaryText")}>{order.user?.phone || order.toPhone || "-"}</small>
                    </td>
                    <td>
                      <span>{itemCount} sản phẩm</span>
                      {order.items?.[0] && (
                        <small className={cx("secondaryText")}>
                          {order.items[0].title || order.items[0].product?.title || "Sản phẩm"}
                          {order.items.length > 1 ? ` và ${order.items.length - 1} mặt hàng khác` : ""}
                        </small>
                      )}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className={cx("amount")}>{formatCurrency(order.totalPrice)}</td>
                    <td>
                      <span className={cx("status", `status-${order.status}`)}>
                        {STATUS_LABELS[order.status] || order.status || "Không xác định"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className={cx("emptyState")} colSpan="6">
                  {search.trim() || status !== "all"
                    ? "Không tìm thấy đơn hàng phù hợp với điều kiện lọc."
                    : "Chưa có đơn hàng trong lịch sử."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && hasMore && (
        <div className={cx("loadMoreWrap")}>
          <button type="button" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? "Đang tải..." : "Tải thêm 20 đơn hàng"}
          </button>
        </div>
      )}
    </section>
  );
}

export default OrderHistory;
