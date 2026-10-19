import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import {
  faBoxOpen,
  faChartLine,
  faCircleCheck,
  faCoins,
  faFire,
  faShoppingCart,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import Loading from "~/components/Loading";
import DashboardCharts from "./DashboardCharts";
import styles from "./Dashboard.module.scss";

const cx = classNames.bind(styles);

const PERIODS = [
  { value: "daily", label: "Ngày" },
  { value: "weekly", label: "Tuần" },
  { value: "monthly", label: "Tháng" },
  { value: "yearly", label: "Năm" },
];

const formatCurrency = (value) =>
  `${(Number(value) || 0).toLocaleString("vi-VN", {
    maximumFractionDigits: 0,
  })} ₫`;

const formatNumber = (value) => (Number(value) || 0).toLocaleString("vi-VN");

const formatRate = (value) =>
  `${(Number(value) || 0).toLocaleString("vi-VN", {
    maximumFractionDigits: 2,
  })}%`;

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
};

function getPeriodLabel(report, period) {
  if (!report) return "";
  if (period === "weekly" && report.week && report.year) {
    return `Tuần ${report.week}, ${report.year}`;
  }
  if (period === "monthly" && report.month && report.year) {
    return `Tháng ${report.month}, ${report.year}`;
  }
  if (period === "yearly" && report.year) return `Năm ${report.year}`;

  const startDate = formatDate(report.startDate);
  const endDate = formatDate(report.endDate);
  if (!startDate) return "";
  return endDate && endDate !== startDate
    ? `${startDate} – ${endDate}`
    : startDate;
}

function StatCard({ icon, label, value, caption, color }) {
  return (
    <article className={cx("statCard", color)}>
      <div className={cx("statCardTop")}>
        <span className={cx("statLabel")}>{label}</span>
        <span className={cx("statIcon")}>
          <FontAwesomeIcon icon={icon} />
        </span>
      </div>
      <strong className={cx("statValue")}>{value}</strong>
      <span className={cx("statCaption")}>{caption}</span>
    </article>
  );
}

function RateRow({ label, value, color }) {
  const rate = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className={cx("rateRow")}>
      <div className={cx("rateHeading")}>
        <span><i className={cx("rateDot", color)} />{label}</span>
        <strong>{formatRate(value)}</strong>
      </div>
      <div className={cx("rateTrack")}>
        <span
          className={cx("rateBar", color)}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

function Dashboard() {
  const [reports, setReports] = useState({});
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadReports = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axiosClient.get(api.report, {
          signal: controller.signal,
        });
        setReports(data && typeof data === "object" ? data : {});
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.response?.data?.message ||
              "Không thể tải dữ liệu báo cáo.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadReports();
    return () => controller.abort();
  }, [reloadKey]);

  const report = reports[period];
  const hotProduct = report?.hotProduct?.product;
  const productName =
    typeof hotProduct === "object" && hotProduct !== null
      ? hotProduct.title
      : null;
  const productId =
    typeof hotProduct === "string"
      ? hotProduct
      : hotProduct?._id || hotProduct?.id;
  const periodLabel = getPeriodLabel(report, period);

  if (loading) {
    return (
      <div className={cx("loadingState")}>
        <Loading />
      </div>
    );
  }

  return (
    <main className={cx("dashboard")}>
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>Tổng quan kinh doanh</p>
          <h1>Dashboard</h1>
          <p className={cx("pageDescription")}>
            Theo dõi doanh thu, đơn hàng và hiệu quả kinh doanh.
          </p>
        </div>
        <label className={cx("periodPicker")}>
          <span>Kỳ báo cáo</span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            {PERIODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error && (
        <div className={cx("alert")} role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
            Thử lại
          </button>
        </div>
      )}

      {!error && !report && (
        <section className={cx("emptyState")}>
          <span className={cx("emptyIcon")}>
            <FontAwesomeIcon icon={faChartLine} />
          </span>
          <h2>Chưa có báo cáo {PERIODS.find((item) => item.value === period)?.label.toLowerCase()}</h2>
          <p>Báo cáo sẽ xuất hiện tại đây khi dữ liệu kỳ này được tổng hợp.</p>
        </section>
      )}

      {report && (
        <>
          <section className={cx("reportSummary")}>
            <div>
              <span className={cx("reportKicker")}>BÁO CÁO {PERIODS.find((item) => item.value === period)?.label.toUpperCase()}</span>
              <h2>{periodLabel}</h2>
            </div>
            <span className={cx("dateRange")}>
              {formatDate(report.startDate)}
              {report.endDate &&
                formatDate(report.endDate) !== formatDate(report.startDate) &&
                ` – ${formatDate(report.endDate)}`}
            </span>
          </section>

            <section className={cx("statisticsGrid")} aria-label="Chỉ số kinh doanh">
              <StatCard
                icon={faCoins}
                label="Tổng doanh thu"
                value={formatCurrency(report.totalRevenue)}
                caption="Doanh thu trong kỳ"
                color="blue"
              />
              <StatCard
                icon={faShoppingCart}
                label="Tổng đơn hàng"
                value={formatNumber(report.totalOrders)}
                caption="Đơn hàng trong kỳ"
                color="orange"
              />
              <StatCard
                icon={faChartLine}
                label="Giá trị đơn trung bình"
                value={formatCurrency(report.avgRevenue)}
                caption="Doanh thu trung bình / đơn"
                color="purple"
              />
              <StatCard
                icon={faCircleCheck}
                label="Tỷ lệ thành công"
                value={formatRate(report.successRate)}
                caption="Đơn hàng thành công"
                color="green"
              />
            </section>
        </>
      )}

      <DashboardCharts charts={reports.charts} />

      {report && (
        <>
            <section className={cx("detailsGrid")}>
              <article className={cx("panel", "orderPanel")}>
                <div className={cx("panelHeading")}>
                  <div>
                    <span className={cx("panelEyebrow")}>ĐƠN HÀNG</span>
                    <h3>Tình trạng đơn hàng</h3>
                  </div>
                  <span className={cx("panelIcon", "blue")}>
                    <FontAwesomeIcon icon={faShoppingCart} />
                  </span>
                </div>
                <div className={cx("rateList")}>
                  <RateRow label="Thành công" value={report.successRate} color="green" />
                  <RateRow label="Trả hàng" value={report.returnRate} color="orange" />
                  <RateRow label="Đã hủy" value={report.cancelRate} color="red" />
                </div>
              </article>

              <article className={cx("panel", "productPanel")}>
                <div className={cx("panelHeading")}>
                  <div>
                    <span className={cx("panelEyebrow")}>SẢN PHẨM</span>
                    <h3>Sản phẩm bán chạy</h3>
                  </div>
                  <span className={cx("panelIcon", "orange")}>
                    <FontAwesomeIcon icon={faFire} />
                  </span>
                </div>
                <div className={cx("hotProduct")}>
                  <span className={cx("hotProductIcon")}>
                    <FontAwesomeIcon icon={faBoxOpen} />
                  </span>
                  <div className={cx("hotProductInfo")}>
                    <strong>{productName || "Sản phẩm nổi bật"}</strong>
                    {productId && (
                      <span className={cx("productId")}>Mã: {productId}</span>
                    )}
                  </div>
                  <div className={cx("quantity")}>
                    <strong>{formatNumber(report.hotProduct?.quantity)}</strong>
                    <span>đã bán</span>
                  </div>
                </div>
              </article>

              <article className={cx("panel", "customerPanel")}>
                <div className={cx("panelHeading")}>
                  <div>
                    <span className={cx("panelEyebrow")}>KHÁCH HÀNG</span>
                    <h3>Khách hàng mới</h3>
                  </div>
                  <span className={cx("panelIcon", "purple")}>
                    <FontAwesomeIcon icon={faUserPlus} />
                  </span>
                </div>
                <strong className={cx("largeMetric")}>{formatNumber(report.newUsers)}</strong>
                <span className={cx("metricCaption")}>tài khoản đăng ký trong kỳ</span>
              </article>

              <article className={cx("panel", "catalogPanel")}>
                <div className={cx("panelHeading")}>
                  <div>
                    <span className={cx("panelEyebrow")}>DANH MỤC</span>
                    <h3>Quy mô sản phẩm</h3>
                  </div>
                  <span className={cx("panelIcon", "green")}>
                    <FontAwesomeIcon icon={faBoxOpen} />
                  </span>
                </div>
                <div className={cx("catalogMetrics")}>
                  <div>
                    <strong>{formatNumber(report.productsCount)}</strong>
                    <span>Tổng sản phẩm</span>
                  </div>
                  <div>
                    <strong>+{formatNumber(report.newProductsCount)}</strong>
                    <span>Sản phẩm mới trong kỳ</span>
                  </div>
                </div>
              </article>
            </section>
        </>
      )}
    </main>
  );
}

export default Dashboard;
