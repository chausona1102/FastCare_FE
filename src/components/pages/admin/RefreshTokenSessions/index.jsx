import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import styles from "./RefreshTokenSessions.module.scss";

const cx = classNames.bind(styles);
const PAGE_SIZE = 20;

const ROLE_LABELS = {
  admin: "Admin",
  staff: "Nhân viên",
  customer: "Khách hàng",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Asia/Ho_Chi_Minh",
      });
};

function RefreshTokenSessions() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState("");
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
    const loadSessions = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axiosClient.get(api.refreshSessions, {
          params: { search, dateFrom, dateTo, page, limit: PAGE_SIZE },
          signal: controller.signal,
        });
        setSessions(data.sessions);
        setTotal(data.total);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.response?.data?.message ||
              "Không thể tải danh sách phiên đăng nhập.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadSessions();
    return () => controller.abort();
  }, [dateFrom, dateTo, page, search]);

  const handleRevoke = async (session) => {
    const userName =
      session.user?.fullname || session.user?.username || "người dùng này";
    if (
      !window.confirm(
        `Thu hồi phiên đăng nhập của ${userName}? Thiết bị này sẽ không thể làm mới phiên đăng nhập.`,
      )
    ) {
      return;
    }

    setRevokingId(session._id);
    setError("");
    try {
      await axiosClient.delete(`${api.refreshSessions}/${session._id}`);
      setSessions((currentSessions) =>
        currentSessions.filter((item) => item._id !== session._id),
      );
      setTotal((currentTotal) => currentTotal - 1);
      if (sessions.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể thu hồi phiên đăng nhập.",
      );
    } finally {
      setRevokingId("");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const clearDates = () => {
    setSearchInput("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <section className={cx("page")}>
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>Quản trị hệ thống</p>
          <h1>Phiên đăng nhập</h1>
          <p className={cx("summary")}>
            Theo dõi và thu hồi refresh token đang còn hiệu lực.
          </p>
        </div>
      </header>

      <div className={cx("filters")} aria-label="Lọc phiên đăng nhập">
        <label className={cx("searchField")}>
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            placeholder="Tìm tài khoản, email, số điện thoại, thiết bị hoặc IP"
            aria-label="Tìm phiên đăng nhập"
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className={cx("filterField")}>
          <span>Từ ngày tạo</span>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(event) => {
              const nextDate = event.target.value;
              setDateFrom(nextDate);
              if (dateTo && nextDate > dateTo) setDateTo("");
              setPage(1);
            }}
          />
        </label>
        <label className={cx("filterField")}>
          <span>Đến ngày tạo</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => {
              const nextDate = event.target.value;
              setDateTo(nextDate);
              if (dateFrom && nextDate < dateFrom) setDateFrom("");
              setPage(1);
            }}
          />
        </label>
        {(searchInput || dateFrom || dateTo) && (
          <button
            className={cx("clearButton")}
            type="button"
            onClick={clearDates}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <p className={cx("securityNote")}>
        Khi thu hồi, refresh token bị xóa ngay; access token hiện tại có thể còn
        sử dụng đến khi hết hạn (tối đa 15 phút).
      </p>

      {error && (
        <div className={cx("alert")} role="alert">
          {error}
        </div>
      )}

      <div className={cx("tableContainer")}>
        <div className={cx("tableSummary")} role="status" aria-live="polite">
          <strong>Danh sách phiên đang hoạt động</strong>
          <span>{total.toLocaleString("vi-VN")} phiên</span>
        </div>
        <div className={cx("tableScroll")}>
          <table className={cx("sessionTable")}>
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Vai trò</th>
                <th>Thiết bị</th>
                <th>Địa chỉ IP</th>
                <th>Đăng nhập lúc</th>
                <th>Hết hạn lúc</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className={cx("stateCell")} colSpan={7}>
                    Đang tải danh sách phiên...
                  </td>
                </tr>
              ) : sessions.length ? (
                sessions.map((session) => (
                  <tr key={session._id}>
                    <td>
                      <strong>
                        {session.user?.fullname ||
                          session.user?.username ||
                          "Người dùng không tồn tại"}
                      </strong>
                      <small>{session.user?.email || "-"}</small>
                    </td>
                    <td>
                      {ROLE_LABELS[session.user?.role] ||
                        session.user?.role ||
                        "-"}
                    </td>
                    <td className={cx("deviceCell")}>
                      {session.deviceInfo || "Không rõ thiết bị"}
                    </td>
                    <td>{session.ipAddress || "-"}</td>
                    <td className={cx("dateCell")}>
                      {formatDateTime(session.createdAt)}
                    </td>
                    <td className={cx("dateCell")}>
                      {formatDateTime(session.expiresAt)}
                    </td>
                    <td>
                      <button
                        className={cx("revokeButton")}
                        type="button"
                        disabled={revokingId === session._id}
                        onClick={() => handleRevoke(session)}
                      >
                        {revokingId === session._id
                          ? "Đang thu hồi..."
                          : "Thu hồi"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className={cx("stateCell")} colSpan={7}>
                    Không tìm thấy phiên đăng nhập phù hợp với bộ lọc.
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
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((currentPage) => currentPage + 1)}
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

export default RefreshTokenSessions;
