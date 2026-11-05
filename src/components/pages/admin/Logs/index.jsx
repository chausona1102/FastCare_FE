import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import { LoadingProduct } from "~/components/Loading";
import styles from "./Logs.module.scss";

const cx = classNames.bind(styles);
const PAGE_SIZE = 20;

const TARGETS = [
  { value: "", label: "Tất cả loại thao tác" },
  { value: "Product", label: "Sản phẩm" },
  { value: "Variant", label: "Phiên bản sản phẩm" },
  { value: "User", label: "Người dùng" },
  { value: "Category", label: "Danh mục" },
  { value: "ParentCategory", label: "Nhóm danh mục" },
  { value: "Order", label: "Đơn hàng" },
];

const TARGET_LABELS = Object.fromEntries(
  TARGETS.filter((item) => item.value).map((item) => [item.value, item.label]),
);

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
};

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    const loadLogs = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axiosClient.get(api.logs, {
          params: {
            page,
            limit: PAGE_SIZE,
            search,
            target,
            dateFrom,
            dateTo,
          },
          signal: controller.signal,
        });
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotal(Number(data.total) || 0);
        setTotalPages(Number(data.totalPages) || 0);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.response?.data?.message ||
              "Không thể tải nhật ký hoạt động.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadLogs();
    return () => controller.abort();
  }, [dateFrom, dateTo, page, search, target]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setTarget("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <section className={cx("page")}>
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>Quản trị hệ thống</p>
          <h1>Nhật ký hoạt động</h1>
          <p className={cx("summary")}>
            Theo dõi thao tác trên sản phẩm, phiên bản, người dùng, danh mục và
            đơn hàng.
          </p>
        </div>
      </header>

      <div className={cx("filters")}>
        <label className={cx("searchField")}>
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            placeholder="Tìm thao tác, mã đối tượng hoặc người thực hiện"
            aria-label="Tìm nhật ký"
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </label>
        <label className={cx("filterField")}>
          <span>Đối tượng</span>
          <select
            value={target}
            onChange={(event) => {
              setTarget(event.target.value);
              setPage(1);
            }}
          >
            {TARGETS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={cx("filterField")}>
          <span>Từ ngày</span>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(event) => {
              setDateFrom(event.target.value);
              if (dateTo && event.target.value > dateTo) setDateTo("");
              setPage(1);
            }}
          />
        </label>
        <label className={cx("filterField")}>
          <span>Đến ngày</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => {
              setDateTo(event.target.value);
              if (dateFrom && event.target.value < dateFrom) setDateFrom("");
              setPage(1);
            }}
          />
        </label>
        <button
          className={cx("clearButton")}
          type="button"
          onClick={clearFilters}
        >
          Xóa lọc
        </button>
      </div>

      {error && (
        <div className={cx("alert")} role="alert">
          {error}
        </div>
      )}

      <div className={cx("tableContainer")}>
        <div className={cx("tableSummary")}>
          <strong>Danh sách log</strong>
          <span>{total.toLocaleString("vi-VN")} hoạt động</span>
        </div>
        <div className={cx("tableScroll")}>
          <table className={cx("logTable")}>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Thao tác</th>
                <th>Đối tượng</th>
                <th>Mã đối tượng</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className={cx("stateCell")} colSpan={5}>
                    <LoadingProduct />
                  </td>
                </tr>
              ) : logs.length ? (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className={cx("dateCell")}>
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td>
                      <strong>
                        {log.user?.fullname ||
                          log.user?.username ||
                          "Người dùng đã xóa"}
                      </strong>
                      {log.user?.email && <small>{log.user.email}</small>}
                    </td>
                    <td>
                      <span className={cx("actionBadge")}>{log.action}</span>
                    </td>
                    <td>{TARGET_LABELS[log.target] || log.target || "-"}</td>
                    <td className={cx("targetId")}>{log.targetId || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className={cx("stateCell")} colSpan={5}>
                    Không tìm thấy log phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <footer className={cx("pagination")}>
            <span>
              Trang {page} / {totalPages}
            </span>
            <div>
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Sau
              </button>
            </div>
          </footer>
        )}
      </div>
    </section>
  );
}

export default ActivityLogs;
