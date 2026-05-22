// import { useState } from "react";
import styles from "./Dashboard.module.scss";
import classNames from "classnames/bind";
import {
  faArrowUp,
  faArrowDown,
  faUsers,
  faShoppingCart,
  faDollarSign,
  faBox,
  faChartLine,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const cx = classNames.bind(styles);

function StatCard({
  icon,
  title,
  value,
  change,
  isPositive,
  color = "red",
  colorClass = "red",
}) {
  return (
    <div className={cx("statCard", color)}>
      <div className={cx("cardHeader")}>
        <h3 className={cx("cardTitle")}>{title}</h3>
        <div className={cx("cardIcon", colorClass)}>
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
      <div className={cx("cardValue")}>{value}</div>
      <div className={cx("cardChange", isPositive ? "positive" : "negative")}>
        <FontAwesomeIcon icon={isPositive ? faArrowUp : faArrowDown} />
        <span>{Math.abs(change)}% from last month</span>
      </div>
    </div>
  );
}

function ChartCard({ title, type = "line" }) {
  return (
    <div className={cx("chartCard")}>
      <h3 className={cx("chartTitle")}>{title}</h3>
      <div className={cx("chartContainer")}>
        <div className={cx("chartPlaceholder")}>
          <div className={cx("placeholderIcon")}>
            <FontAwesomeIcon
              icon={type === "line" ? faChartLine : faChartBar}
            />
          </div>
          <p className={cx("placeholderText")}>
            Chart visualization coming soon
          </p>
        </div>
      </div>
    </div>
  );
}

function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: "John Doe",
      action: "New order created",
      badge: "new",
      time: "2 hours ago",
      avatar: "JD",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "Updated product information",
      badge: "updated",
      time: "4 hours ago",
      avatar: "JS",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "Product sold out",
      badge: "sold",
      time: "6 hours ago",
      avatar: "MJ",
    },
    {
      id: 4,
      user: "Sarah Williams",
      action: "New customer registered",
      badge: "new",
      time: "1 day ago",
      avatar: "SW",
    },
    {
      id: 5,
      user: "Tom Brown",
      action: "Payment received",
      badge: "updated",
      time: "2 days ago",
      avatar: "TB",
    },
  ];

  return (
    <div className={cx("recentActivity")}>
      <h3 className={cx("activityTitle")}>Recent Activity</h3>
      <ul className={cx("activityList")}>
        {activities.map((activity) => (
          <li key={activity.id} className={cx("activityItem")}>
            <div className={cx("activityAvatar")}>{activity.avatar}</div>
            <div className={cx("activityContent")}>
              <p className={cx("activityText")}>{activity.action}</p>
              <p className={cx("activityTime")}>
                {activity.time} by {activity.user}
              </p>
            </div>
            <span className={cx("activityBadge", activity.badge)}>
              {activity.badge.charAt(0).toUpperCase() + activity.badge.slice(1)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dashboard() {
  const stats = [
    {
      icon: faUsers,
      title: "Total Users",
      value: "2,543",
      change: 12.5,
      isPositive: true,
      color: "blue",
      colorClass: "blue",
    },
    {
      icon: faShoppingCart,
      title: "Total Orders",
      value: "1,234",
      change: 8.3,
      isPositive: true,
      color: "green",
      colorClass: "green",
    },
    {
      icon: faDollarSign,
      title: "Revenue",
      value: "$45,320",
      change: 15.2,
      isPositive: true,
      color: "amber",
      colorClass: "amber",
    },
    {
      icon: faBox,
      title: "Products",
      value: "856",
      change: -3.1,
      isPositive: false,
      color: "purple",
      colorClass: "purple",
    },
  ];

  return (
    <div className={cx("dashboardContainer")}>
      {/* Statistics Cards */}
      <div className={cx("statisticsGrid")}>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            color={stat.color}
            colorClass={stat.colorClass}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className={cx("chartsSection")}>
        <ChartCard title="Sales Overview" type="line" />
        <ChartCard title="Revenue Distribution" type="bar" />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}

export default Dashboard;
