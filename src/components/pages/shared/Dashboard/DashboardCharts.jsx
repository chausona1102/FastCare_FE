import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./DashboardCharts.module.scss";

const cx = classNames.bind(styles);

const CHART_PERIODS = [
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

const formatCurrency = (value) =>
  `${(Number(value) || 0).toLocaleString("vi-VN", {
    maximumFractionDigits: 0,
  })} ₫`;

const formatNumber = (value) => (Number(value) || 0).toLocaleString("vi-VN");

const getDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

function buildDailyChartData(chart) {
  if (!chart?.startDate || !chart?.endDate) return [];

  const reportsByDate = new Map(
    (chart.data || []).map((item) => [getDateKey(item.startDate || item.date), item]),
  );
  const start = new Date(chart.startDate);
  const end = new Date(chart.endDate);
  const current = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const lastDay = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );
  const points = [];

  while (current.getTime() <= lastDay && points.length < 32) {
    const key = current.toISOString().slice(0, 10);
    const item = reportsByDate.get(key);
    points.push({
      key,
      label: current.toLocaleDateString("vi-VN", {
        day: "numeric",
        timeZone: "UTC",
      }),
      totalRevenue: Number(item?.totalRevenue) || 0,
      totalOrders: Number(item?.totalOrders) || 0,
    });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return points;
}

function buildMonthlyChartData(chart) {
  if (!chart?.year) return [];

  const reportsByMonth = new Map(
    (chart.data || []).map((item) => [Number(item.month), item]),
  );

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const item = reportsByMonth.get(month);
    return {
      key: `${chart.year}-${month}`,
      label: new Date(Date.UTC(chart.year, index, 1)).toLocaleDateString(
        "vi-VN",
        { month: "short", timeZone: "UTC" },
      ),
      totalRevenue: Number(item?.totalRevenue) || 0,
      totalOrders: Number(item?.totalOrders) || 0,
    };
  });
}

const formatCompactValue = (value, style) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
    ...(style === "currency" ? { style: "currency", currency: "VND" } : {}),
  }).format(value);

function getChartTitle(period, chart) {
  if (period === "year") {
    return chart?.year ? `Năm ${chart.year}` : "Theo năm";
  }
  if (period === "month") {
    return chart?.month && chart?.year
      ? `Tháng ${chart.month}/${chart.year}`
      : "Theo tháng";
  }
  return chart?.week && chart?.year
    ? `Tuần ${chart.week}/${chart.year}`
    : "Theo tuần";
}

function RevenueOrderChart({ data }) {
  if (!data.length) {
    return <p className={cx("chartEmpty")}>Chưa có dữ liệu trong kỳ này.</p>;
  }

  const width = Math.max(720, data.length * 48);
  const height = 300;
  const padding = { top: 20, right: 66, bottom: 42, left: 78 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxRevenue = Math.max(...data.map((item) => item.totalRevenue), 0) || 1;
  const maxOrders = Math.max(...data.map((item) => item.totalOrders), 0) || 1;
  const revenuePoints = data.map((item, index) => ({
    x: padding.left + (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth),
    y: padding.top + (1 - item.totalRevenue / maxRevenue) * plotHeight,
    item,
  }));
  const orderPoints = data.map((item, index) => ({
    x: padding.left + (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth),
    y: padding.top + (1 - item.totalOrders / maxOrders) * plotHeight,
    item,
  }));
  const toPolyline = (points) =>
    points.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <div className={cx("chartViewport")}>
      <svg
        className={cx("lineChart")}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Biểu đồ đường doanh thu và số đơn hàng"
      >
        {[0, 0.5, 1].map((fraction) => {
          const y = padding.top + fraction * plotHeight;
          return (
            <g key={fraction}>
              <line
                className={cx("gridLine")}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
              <text className={cx("axisLabel")} x={padding.left - 10} y={y + 4} textAnchor="end">
                {formatCompactValue(maxRevenue * (1 - fraction), "currency")}
              </text>
              <text className={cx("axisLabel")} x={width - padding.right + 10} y={y + 4} textAnchor="start">
                {formatCompactValue(maxOrders * (1 - fraction))}
              </text>
            </g>
          );
        })}

        <polyline className={cx("line", "revenueLine")} points={toPolyline(revenuePoints)} />
        <polyline className={cx("line", "ordersLine")} points={toPolyline(orderPoints)} />

        {revenuePoints.map(({ x, y, item }) => (
          <g key={`revenue-${item.key}`}>
            <circle className={cx("point", "revenuePoint")} cx={x} cy={y} r="4">
              <title>{`${item.label}: ${formatCurrency(item.totalRevenue)}`}</title>
            </circle>
          </g>
        ))}

        {orderPoints.map(({ x, y, item }) => (
          <g key={`orders-${item.key}`}>
            <circle className={cx("point", "ordersPoint")} cx={x} cy={y} r="4">
              <title>{`${item.label}: ${formatNumber(item.totalOrders)} đơn`}</title>
            </circle>
          </g>
        ))}

        {data.map((item, index) => {
          const x =
            padding.left +
            (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
          return (
            <text
              className={cx("xAxisLabel")}
              key={item.key}
              x={x}
              y={height - 12}
              textAnchor="middle"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function DashboardCharts({ charts = {} }) {
  const [period, setPeriod] = useState("year");
  const chart = charts[period];
  const data =
    period === "year"
      ? buildMonthlyChartData(chart)
      : buildDailyChartData(chart);

  return (
    <section className={cx("chartsSection")} aria-label="Biểu đồ kinh doanh">
      <article className={cx("chartPanel")}>
        <header className={cx("chartHeader")}>
          <div>
            <span className={cx("panelEyebrow")}>PHÂN TÍCH THEO THỜI GIAN</span>
            <h2>Doanh thu và đơn hàng</h2>
            <p>{getChartTitle(period, chart)}</p>
          </div>
          <label className={cx("periodPicker")}>
            <span>Kỳ xem</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              {CHART_PERIODS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className={cx("chartLegend")}>
          <span><i className={cx("legendDot", "blue")} />Doanh thu (trục trái)</span>
          <span><i className={cx("legendDot", "orange")} />Số đơn (trục phải)</span>
        </div>
        <RevenueOrderChart data={data} />
      </article>
    </section>
  );
}

export default DashboardCharts;
