import React, { useEffect, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import classNames from "classnames/bind";
import api from "~/api";
import axiosClient from "~/api/axiosClient";
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
    (chart.data || []).map((item) => [
      getDateKey(item.startDate || item.date),
      item,
    ]),
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

  return (
    <div className={cx("chartViewport", "revenueOrderChart")}>
      <LineChart
        height={320}
        xAxis={[
          {
            id: "period",
            scaleType: "point",
            data: data.map((item) => item.label),
          },
        ]}
        yAxis={[
          {
            id: "revenue",
            position: "left",
            valueFormatter: (value) => formatCompactValue(value, "currency"),
          },
          {
            id: "orders",
            position: "right",
            valueFormatter: (value) => formatCompactValue(value),
          },
        ]}
        series={[
          {
            id: "revenue",
            label: "Doanh thu",
            data: data.map((item) => item.totalRevenue),
            yAxisId: "revenue",
            color: "#3b82f6",
            curve: "monotoneX",
            showMark: true,
            valueFormatter: (value) =>
              value == null ? null : formatCurrency(value),
          },
          {
            id: "orders",
            label: "Số đơn",
            data: data.map((item) => item.totalOrders),
            yAxisId: "orders",
            color: "#f97316",
            curve: "monotoneX",
            showMark: true,
            valueFormatter: (value) =>
              value == null ? null : `${formatNumber(value)} đơn`,
          },
        ]}
        grid={{ horizontal: true }}
        axisHighlight={{ x: "line" }}
        hideLegend
        skipAnimation
      />
    </div>
  );
}

function TrafficChart({ period }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [traffic, setTraffic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const isMonthly = period === "month";

  useEffect(() => {
    const controller = new AbortController();

    const loadTraffic = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await axiosClient.get(
          isMonthly ? api.traffic : `${api.traffic}/week`,
          {
            params: isMonthly ? { month, year } : undefined,
            signal: controller.signal,
          },
        );

        if (!Array.isArray(data?.trafficByDay)) {
          throw new Error("Dữ liệu traffic không hợp lệ.");
        }

        setTraffic(data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Không thể tải dữ liệu traffic.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadTraffic();
    return () => controller.abort();
  }, [isMonthly, month, year, reloadKey]);

  const data = (traffic?.trafficByDay || []).map((item) => ({
    key: item.date,
    label: !isMonthly ? item.weekday : item.date?.slice(8, 10) || "",
    visits: Number(item.visits) || 0,
  }));
  const width = Math.max(720, data.length * 38);
  const height = 280;
  const padding = { top: 24, right: 20, bottom: 42, left: 58 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxVisits = Math.max(...data.map((item) => item.visits), 0) || 1;
  const barWidth = Math.min(24, (plotWidth / Math.max(data.length, 1)) * 0.62);
  const formatVisits = (value) => formatNumber(value);

  return (
    <article className={cx("chartPanel")}>
      <header className={cx("chartHeader")}>
        <div>
          <span className={cx("panelEyebrow")}>
            {isMonthly ? "TRAFFIC THEO THÁNG" : "TRAFFIC THEO TUẦN"}
          </span>
          <h2>
            {isMonthly
              ? "Lượt truy cập trong tháng"
              : "Lượt truy cập tuần trước"}
          </h2>
          <p>
            {isMonthly
              ? `Tháng ${month}/${year}`
              : "Thống kê theo ngày từ thứ 2 đến chủ nhật"}
          </p>
        </div>
        {isMonthly && (
          <div className={cx("trafficPeriodPicker")}>
            <label className={cx("periodPicker")}>
              <span>Tháng</span>
              <select
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (monthOption) => (
                    <option key={monthOption} value={monthOption}>
                      Tháng {monthOption}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className={cx("periodPicker")}>
              <span>Năm</span>
              <select
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {Array.from(
                  { length: now.getFullYear() - 1999 },
                  (_, index) => now.getFullYear() - index,
                ).map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </header>

      {error && (
        <div className={cx("chartError")} role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <p className={cx("chartEmpty")} role="status">
          Đang tải dữ liệu traffic...
        </p>
      ) : !error ? (
        <>
          <div className={cx("trafficSummary")}>
            <strong>{formatNumber(traffic?.totalTraffic)}</strong>
            <span>lượt truy cập trong kỳ</span>
          </div>
          {!data.length ? (
            <p className={cx("chartEmpty")}>Chưa có dữ liệu trong kỳ này.</p>
          ) : (
            <div className={cx("chartViewport")}>
              <svg
                className={cx("lineChart")}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={`Biểu đồ lượt truy cập ${
                  isMonthly ? `tháng ${month}/${year}` : "tuần trước"
                }`}
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
                      <text
                        className={cx("axisLabel")}
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                      >
                        {formatVisits(Math.round(maxVisits * (1 - fraction)))}
                      </text>
                    </g>
                  );
                })}

                {data.map((item, index) => {
                  const step = plotWidth / data.length;
                  const x = padding.left + index * step + (step - barWidth) / 2;
                  const barHeight = (item.visits / maxVisits) * plotHeight;
                  return (
                    <g key={item.key || index}>
                      <rect
                        className={cx("trafficBar")}
                        x={x}
                        y={padding.top + plotHeight - barHeight}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                      >
                        <title>{`${item.label}: ${formatVisits(item.visits)} lượt truy cập`}</title>
                      </rect>
                      <text
                        className={cx("xAxisLabel")}
                        x={x + barWidth / 2}
                        y={height - 12}
                        textAnchor="middle"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </>
      ) : null}
      <TrafficHeatmap trafficData={traffic} isMonthly={isMonthly} />
    </article>
  );
}

// Traffic heatmap
function TrafficHeatmap({ trafficData, isMonthly }) {
  if (!trafficData) {
    return null;
  }
  const {
    totalTraffic,
    trafficByDay = [],
    trafficByPeriod = [],
    period,
  } = trafficData;
  const heatmapData = trafficByPeriod.map((timePeriod) => ({
    ...timePeriod,
    cells: trafficByDay.map((day) =>
      totalTraffic
        ? Math.round(((day.visits * timePeriod.visits) / totalTraffic) * 100) /
          100
        : 0,
    ),
  }));
  const maxValue = isMonthly
    ? Math.max(...trafficByDay.map((day) => Number(day.visits) || 0), 1)
    : Math.max(...heatmapData.flatMap((row) => row.cells), 1);
  const month = Number(period?.month);
  const year = Number(period?.year);
  const firstDayOffset =
    isMonthly && month && year
      ? (new Date(year, month - 1, 1).getDay() + 6) % 7
      : 0;

  const getCellColor = (value) => {
    if (value === 0) {
      return "#eff3f8";
    }

    const intensity = value / maxValue;

    return `rgba(37, 99, 235, ${0.08 + intensity * 0.82})`;
  };

  return (
    <section className={cx("heatmapPanel")} aria-label="Heatmap lượt truy cập">
      <header className={cx("heatmapHeader")}>
        <div>
          <span className={cx("panelEyebrow")}>MẬT ĐỘ TRUY CẬP</span>
          <h3>{isMonthly ? "Lượt truy cập theo ngày" : "Ngày và khung giờ"}</h3>
          <p>
            {isMonthly && month && year
              ? `Tháng ${month}/${year}`
              : isMonthly
                ? "Phân bố lượt truy cập trong tháng"
                : "Ước tính lượt truy cập theo ngày và khung giờ"}
          </p>
        </div>
        <div className={cx("heatmapLegend")} aria-label="Chú giải cường độ">
          <span>Ít</span>
          <i />
          <span>Nhiều</span>
        </div>
      </header>

      {isMonthly ? (
        <div
          className={cx("monthHeatmap")}
          role="group"
          aria-label={`Lượt truy cập từng ngày trong tháng ${month}/${year}`}
        >
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((weekday) => (
            <span className={cx("monthWeekday")} key={weekday}>
              {weekday}
            </span>
          ))}
          {Array.from({ length: firstDayOffset }, (_, index) => (
            <span
              className={cx("monthDay", "monthDayEmpty")}
              key={`empty-${index}`}
              aria-hidden="true"
            />
          ))}
          {trafficByDay.map((day) => {
            const visits = Number(day.visits) || 0;
            const dayNumber = Number(day.date?.slice(8, 10)) || "";
            return (
              <span
                className={cx("monthDay")}
                key={day.date}
                title={`${day.date}: ${formatNumber(visits)} lượt truy cập`}
                aria-label={`${day.date}: ${formatNumber(visits)} lượt truy cập`}
                style={{
                  backgroundColor: getCellColor(visits),
                  color: visits / maxValue > 0.55 ? "#fff" : "#334155",
                }}
              >
                {dayNumber}
              </span>
            );
          })}
        </div>
      ) : (
        <div className={cx("heatmapScroll")}>
          <div
            className={cx("weekHeatmap")}
            role="group"
            aria-label="Lượt truy cập ước tính theo ngày và khung giờ"
          >
            <span />
            {trafficByDay.map((day) => (
              <span className={cx("weekHeatmapDay")} key={day.date}>
                <strong>{day.weekday}</strong>
                <small>
                  {day.date?.slice(8, 10)}/{day.date?.slice(5, 7)}
                </small>
              </span>
            ))}
            {heatmapData.map((row) => (
              <React.Fragment key={`${row.startTime}-${row.endTime}`}>
                <span className={cx("heatmapTime")}>
                  {row.startTime}–{row.endTime}
                </span>
                {row.cells.map((value, index) => {
                  const day = trafficByDay[index];
                  return (
                    <span
                      className={cx("weekHeatmapCell")}
                      key={`${day.date}-${row.startTime}`}
                      title={`${day.weekday}, ${day.date} · ${row.startTime}–${row.endTime}: ${formatNumber(value)} lượt truy cập ước tính`}
                      aria-label={`${day.weekday}, ${day.date}, ${row.startTime} đến ${row.endTime}: ${formatNumber(value)} lượt truy cập ước tính`}
                      style={{ backgroundColor: getCellColor(value) }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      <p className={cx("heatmapNote")}>
        {isMonthly
          ? "Màu sắc thể hiện số lượt truy cập thực tế trong ngày."
          : "Dữ liệu theo khung giờ được ước tính từ tổng lượt truy cập theo ngày và khung giờ."}
      </p>
    </section>
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
    <section
      className={cx("chartsSection")}
      aria-label="Biểu đồ kinh doanh và traffic"
    >
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
          <span>
            <i className={cx("legendDot", "blue")} />
            Doanh thu (trục trái)
          </span>
          <span>
            <i className={cx("legendDot", "orange")} />
            Số đơn (trục phải)
          </span>
        </div>
        <RevenueOrderChart data={data} />
      </article>
      <TrafficChart period="week" />
      {/* <div class="d-flex gap-3 w-100">
        <div class="flex-1 w-100">
        </div>
        <div class="flex-1 w-100">
        </div>
      </div> */}
      <TrafficChart period="month" />
    </section>
  );
}

export default DashboardCharts;
