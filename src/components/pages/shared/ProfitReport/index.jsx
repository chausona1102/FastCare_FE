import { useState } from "react";
import classNames from "classnames/bind";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import { downloadXlsx } from "~/utils/xlsxExport";
import styles from "./ProfitReport.module.scss";

const cx = classNames.bind(styles);
const PAGE_SIZE = 20;

const formatCurrency = (value) =>
  `${(Number(value) || 0).toLocaleString("vi-VN", {
    maximumFractionDigits: 0,
  })} ₫`;

const formatDateTime = (value) =>
  new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  });

function ProfitReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedRange, setAppliedRange] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async (range, page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosClient.get(api.profitReport, {
        params: { ...range, page },
      });
      setReport(data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể tính báo cáo lợi nhuận.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = (event) => {
    event.preventDefault();
    if (!startDate || !endDate) {
      setError("Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (startDate > endDate) {
      setError("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
      return;
    }

    const range = { startDate, endDate };
    setAppliedRange(range);
    setReport(null);
    loadReport(range, 1);
  };

  const handlePageChange = (page) => {
    if (appliedRange && !loading) loadReport(appliedRange, page);
  };

  const handleExport = async () => {
    if (!appliedRange || exporting) return;

    setExporting(true);
    setError("");
    try {
      const { data } = await axiosClient.get(api.profitReportExport, {
        params: appliedRange,
      });
      const rows = data.orders.map((order) => [
        formatDateTime(order.createdAt),
        order.orderCode,
        order.customerName,
        order.items
          .map((item) => `${item.title} x${item.quantity}`)
          .join("; "),
        order.quantity,
        order.totalRevenue,
        order.shippingFee,
        order.costOfGoods,
        order.profit,
        order.averageProfitPerUnit,
      ]);
      const orderRows = [
        [
          "Ngày đặt",
          "Mã đơn",
          "Khách hàng",
          "Sản phẩm",
          "Số lượng",
          "Tổng thu",
          "Phí vận chuyển",
          "Tổng giá vốn",
          "Lợi nhuận",
          "Lợi nhuận bình quân / sản phẩm",
        ],
        ...rows,
      ];
      const summaryRows = [
        ["Báo cáo lợi nhuận", ""],
        ["Từ ngày", data.startDate],
        ["Đến ngày", data.endDate],
        ["Số đơn", data.totalOrders],
        ["Tổng thu", data.totalRevenue],
        ["Tổng phí vận chuyển", data.totalShippingFee],
        ["Tổng giá vốn", data.totalCost],
        ["Tổng lợi nhuận", data.totalProfit],
      ];
      downloadXlsx(
        [
          { name: "Tổng quan", rows: summaryRows },
          { name: "Danh sách đơn", rows: orderRows },
        ],
        `bao-cao-loi-nhuan_${data.startDate}_${data.endDate}.xlsx`,
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể xuất file báo cáo.",
      );
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil((report?.totalOrders || 0) / PAGE_SIZE),
  );

  return (
    <main className={cx("profitReport")}>
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>BÁO CÁO KINH DOANH</p>
          <h1>Báo cáo lợi nhuận</h1>
          <p className={cx("description")}>
            Giá vốn được tính theo bình quân gia quyền tại thời điểm đặt đơn.
          </p>
        </div>
      </header>

      <form className={cx("filterPanel")} onSubmit={handleCalculate}>
        <label>
          <span>Từ ngày</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Đến ngày</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Đang tính..." : "Tính báo cáo"}
        </button>
        <button
          className={cx("exportButton")}
          type="button"
          onClick={handleExport}
          disabled={!report || exporting}
        >
          {exporting ? "Đang xuất..." : "Xuất Excel"}
        </button>
      </form>

      <p className={cx("formulaNote")}>
        Lợi nhuận = tổng thu − giá vốn bình quân gia quyền − phí vận chuyển.
        Báo cáo chỉ tính đơn đã giao; khoảng ngày dựa trên ngày đặt đơn.
      </p>

      {error && (
        <div className={cx("errorMessage")} role="alert">
          {error}
        </div>
      )}

      {loading && <div className={cx("statusMessage")}>Đang tải dữ liệu...</div>}

      {!loading && report && (
        <>
          <section className={cx("summaryGrid")} aria-label="Tổng hợp">
            <article>
              <span>Tổng thu</span>
              <strong>{formatCurrency(report.totalRevenue)}</strong>
            </article>
            <article>
              <span>Tổng phí vận chuyển</span>
              <strong>{formatCurrency(report.totalShippingFee)}</strong>
            </article>
            <article>
              <span>Tổng giá vốn</span>
              <strong>{formatCurrency(report.totalCost)}</strong>
            </article>
            <article className={cx("profitCard")}>
              <span>Tổng lợi nhuận</span>
              <strong>{formatCurrency(report.totalProfit)}</strong>
            </article>
          </section>

          <section className={cx("ordersPanel")}>
            <div className={cx("tableHeading")}>
              <div>
                <h2>Danh sách đơn đã giao</h2>
                <span>{report.totalOrders.toLocaleString("vi-VN")} đơn</span>
              </div>
              <span>
                {report.startDate} – {report.endDate}
              </span>
            </div>

            {report.orders.length === 0 ? (
              <div className={cx("emptyState")}>
                Không có đơn đã giao trong khoảng thời gian này.
              </div>
            ) : (
              <div className={cx("tableScroll")}>
                <table>
                  <thead>
                    <tr>
                      <th>Ngày đặt</th>
                      <th>Mã đơn</th>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Tổng thu</th>
                      <th>Phí ship</th>
                      <th>Giá vốn</th>
                      <th>Lợi nhuận</th>
                      <th>LN bình quân / SP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.orders.map((order) => (
                      <tr key={order.id}>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td>{order.orderCode}</td>
                        <td>
                          <div className={cx("productList")}>
                            {order.items.map((item, index) => (
                              <span key={`${item.code}-${index}`}>
                                {item.title} × {item.quantity}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{order.quantity.toLocaleString("vi-VN")}</td>
                        <td>{formatCurrency(order.totalRevenue)}</td>
                        <td>{formatCurrency(order.shippingFee)}</td>
                        <td>{formatCurrency(order.costOfGoods)}</td>
                        <td className={cx("profitCell")}>
                          {formatCurrency(order.profit)}
                        </td>
                        <td>{formatCurrency(order.averageProfitPerUnit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {report.totalOrders > PAGE_SIZE && (
              <div className={cx("pagination")}>
                <button
                  type="button"
                  disabled={loading || report.page <= 1}
                  onClick={() => handlePageChange(report.page - 1)}
                >
                  Trang trước
                </button>
                <span>
                  Trang {report.page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={loading || report.page >= totalPages}
                  onClick={() => handlePageChange(report.page + 1)}
                >
                  Trang sau
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default ProfitReport;
