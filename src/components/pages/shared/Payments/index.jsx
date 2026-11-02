import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import { downloadXlsx } from "~/utils/xlsxExport";
import styles from "./Payments.module.scss";

const cx = classNames.bind(styles);
const PAGE_SIZE = 20;

const PAYMENT_STATUS = {
  paid: "Đã thanh toán",
  pending: "Đang xử lý",
  failed: "Thất bại",
  not_required: "Không yêu cầu",
};

const formatCurrency = (value) =>
  `${(Number(value) || 0).toLocaleString("vi-VN", {
    maximumFractionDigits: 0,
  })} ₫`;

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

function Payments() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      async () => {
        setLoading(true);
        setError("");
        try {
          const { data } = await axiosClient.get(api.onlinePayments, {
            params: {
              search: search.trim(),
              status,
              startDate,
              endDate,
              page,
              limit: PAGE_SIZE,
            },
            signal: controller.signal,
          });
          setPayments(data.payments);
          setTotal(data.total);
        } catch (requestError) {
          if (!controller.signal.aborted) {
            setError(
              requestError.response?.data?.message ||
                "Không thể tải danh sách thanh toán online.",
            );
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
            setSearching(false);
          }
        }
      },
      search.trim() ? 350 : 0,
    );

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [page, search, status, startDate, endDate]);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setError("");
    try {
      const { data } = await axiosClient.get(api.onlinePaymentsExport, {
        params: { search: search.trim(), status, startDate, endDate },
      });
      const rows = data.payments.map((payment) => [
        formatDateTime(payment.paidAt || payment.createdAt),
        payment.clientOrderCode,
        payment.user?.fullname || payment.toName || "Khách hàng",
        payment.user?.email || payment.user?.phone || payment.toPhone || "-",
        payment.paymentTxnRef || "-",
        payment.paymentTransactionNo || "-",
        payment.paymentBankCode || "-",
        payment.totalPrice,
        PAYMENT_STATUS[payment.paymentStatus] || payment.paymentStatus || "-",
      ]);
      downloadXlsx(
        [
          {
            name: "Thanh toán online",
            rows: [
              [
                "Thời gian",
                "Mã đơn hàng",
                "Khách hàng",
                "Email / Số điện thoại",
                "Mã giao dịch",
                "Mã giao dịch ngân hàng",
                "Ngân hàng",
                "Số tiền",
                "Trạng thái",
              ],
              ...rows,
            ],
          },
        ],
        "danh-sach-thanh-toan-online.xlsx",
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể xuất danh sách thanh toán.",
      );
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className={cx("payments")}>
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>QUẢN LÝ GIAO DỊCH</p>
          <h1>Thanh toán online</h1>
          <p className={cx("description")}>
            Theo dõi các giao dịch thanh toán VNPAY của đơn hàng.
          </p>
        </div>
      </header>

      <section className={cx("panel")} aria-label="Danh sách thanh toán">
        <div className={cx("toolbar")}>
          <label className={cx("searchField")}>
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <input
              type="search"
              value={search}
              aria-label="Tìm giao dịch thanh toán"
              placeholder="Mã đơn, mã giao dịch, khách hàng, email hoặc số điện thoại"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setSearching(true);
              }}
            />
          </label>
          <button
            className={cx("exportButton")}
            type="button"
            onClick={handleExport}
            disabled={exporting}
          >
            <FontAwesomeIcon icon={faFileExcel} aria-hidden="true" />
            {exporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
        </div>

        <div className={cx("filters")} aria-label="Lọc giao dịch thanh toán">
          <label>
            <span>Trạng thái</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
                setSearching(true);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
            </select>
          </label>
          <label>
            <span>Từ ngày</span>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(1);
                setSearching(true);
              }}
            />
          </label>
          <label>
            <span>Đến ngày</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(1);
                setSearching(true);
              }}
            />
          </label>
          {(status || startDate || endDate) && (
            <button
              className={cx("clearButton")}
              type="button"
              onClick={() => {
                setStatus("");
                setStartDate("");
                setEndDate("");
                setPage(1);
                setSearching(true);
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {error && (
          <div className={cx("errorMessage")} role="alert">
            {error}
          </div>
        )}

        <div className={cx("tableHeading")} role="status" aria-live="polite">
          {searching
            ? "Đang tìm..."
            : `${total.toLocaleString("vi-VN")} giao dịch`}
        </div>

        {loading ? (
          <div className={cx("statusMessage")}>Đang tải dữ liệu...</div>
        ) : payments.length === 0 ? (
          <div className={cx("statusMessage")}>
            {search.trim() || status || startDate || endDate
              ? "Không tìm thấy giao dịch phù hợp với bộ lọc."
              : "Chưa có giao dịch thanh toán online."}
          </div>
        ) : (
          <div className={cx("tableScroll")}>
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Mã giao dịch</th>
                  <th>Ngân hàng</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      {formatDateTime(payment.paidAt || payment.createdAt)}
                    </td>
                    <td>
                      <strong>{payment.clientOrderCode || payment._id}</strong>
                    </td>
                    <td>
                      <strong>
                        {payment.user?.fullname ||
                          payment.toName ||
                          "Khách hàng"}
                      </strong>
                      <small>
                        {payment.user?.email ||
                          payment.user?.phone ||
                          payment.toPhone ||
                          "-"}
                      </small>
                    </td>
                    <td>
                      <strong>{payment.paymentTransactionNo || "-"}</strong>
                      {payment.paymentTxnRef && (
                        <small>{payment.paymentTxnRef}</small>
                      )}
                    </td>
                    <td>{payment.paymentBankCode || "-"}</td>
                    <td className={cx("amount")}>
                      {formatCurrency(payment.totalPrice)}
                    </td>
                    <td>
                      <span
                        className={cx(
                          "status",
                          `status-${payment.paymentStatus || "unknown"}`,
                        )}
                      >
                        {PAYMENT_STATUS[payment.paymentStatus] ||
                          payment.paymentStatus ||
                          "Không rõ"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className={cx("pagination")}>
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Trang trước
            </button>
            <span>
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Trang sau
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Payments;
