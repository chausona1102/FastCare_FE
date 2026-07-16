import styles from "./Dashboard.module.scss";
import classNames from "classnames/bind";
import {
  faShoppingCart,
  faBox,
  faWarning,
  faTruck,
  faEye,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const cx = classNames.bind(styles);

// Component StatCard cho dashboard nhân viên
function StatCard({ icon, title, value, subtitle, color = "blue" }) {
  return (
    <div className={cx("statCard", color)}>
      <div className={cx("cardHeader")}>
        <h3 className={cx("cardTitle")}>{title}</h3>
        <div className={cx("cardIcon", color)}>
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
      <div className={cx("cardValue")}>{value}</div>
      {subtitle && <div className={cx("cardSubtitle")}>{subtitle}</div>}
    </div>
  );
}

// Component hiển thị badge đơn hàng
function OrderStatusBadge({ status }) {
  const statusMap = {
    pending: { label: "Chờ xác nhận", color: "yellow" },
    processing: { label: "Đang xử lý", color: "blue" },
    shipping: { label: "Đang giao", color: "orange" },
    completed: { label: "Hoàn thành", color: "green" },
    cancelled: { label: "Đã huỷ", color: "red" },
  };

  const info = statusMap[status] || { label: status, color: "gray" };

  return <span className={cx("statusBadge", info.color)}>{info.label}</span>;
}

// Component badge tồn kho
function StockBadge({ stock, minStock = 10 }) {
  if (stock === 0) {
    return <span className={cx("stockBadge", "empty")}>Hết hàng</span>;
  }
  if (stock < minStock) {
    return <span className={cx("stockBadge", "warning")}>Sắp hết</span>;
  }
  return <span className={cx("stockBadge", "normal")}>{stock}</span>;
}

// Bảng đơn hàng gần nhất
function RecentOrdersTable() {
  // TODO: Thay bằng API call thật - orderService.getRecentOrders()
  const recentOrders = [
    {
      id: "ORD-0001",
      customer: { name: "Nguyễn Văn A", phone: "0901234567" },
      items: "3 sản phẩm",
      total: 450000,
      status: "processing",
      createdAt: "2024-01-15 08:30",
    },
    {
      id: "ORD-0002",
      customer: { name: "Trần Thị B", phone: "0912345678" },
      items: "2 sản phẩm",
      total: 320000,
      status: "pending",
      createdAt: "2024-01-15 07:15",
    },
    {
      id: "ORD-0003",
      customer: { name: "Lê Văn C", phone: "0923456789" },
      items: "5 sản phẩm",
      total: 780000,
      status: "shipping",
      createdAt: "2024-01-15 06:45",
    },
    {
      id: "ORD-0004",
      customer: { name: "Phạm Thị D", phone: "0934567890" },
      items: "1 sản phẩm",
      total: 150000,
      status: "completed",
      createdAt: "2024-01-14 22:00",
    },
    {
      id: "ORD-0005",
      customer: { name: "Đỗ Văn E", phone: "0945678901" },
      items: "4 sản phẩm",
      total: 620000,
      status: "pending",
      createdAt: "2024-01-14 20:30",
    },
  ];

  // Format tiền VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className={cx("tableCard")}>
      <div className={cx("tableHeader")}>
        <h3 className={cx("tableTitle")}>Đơn Hàng Gần Nhất (5 đơn)</h3>
      </div>
      <div className={cx("tableWrapper")}>
        <table className={cx("table")}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td className={cx("orderId")}>{order.id}</td>
                <td>
                  <div className={cx("customerInfo")}>
                    <div className={cx("customerName")}>
                      {order.customer.name}
                    </div>
                    <div className={cx("customerPhone")}>
                      {order.customer.phone}
                    </div>
                  </div>
                </td>
                <td>{order.items}</td>
                <td className={cx("totalPrice")}>{formatVND(order.total)}</td>
                <td>
                  <OrderStatusBadge status={order.status} />
                </td>
                <td>{order.createdAt}</td>
                <td>
                  <div className={cx("actions")}>
                    <button className={cx("actionBtn", "view")} title="Xem">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className={cx("actionBtn", "edit")} title="Sửa">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Bảng sản phẩm tồn kho thấp
function LowStockProductsTable() {
  // TODO: Thay bằng API call thật - productService.getLowStockProducts()
  const lowStockProducts = [
    {
      id: "PRD-001",
      sku: "MED-001",
      name: "Paracetamol 500mg",
      category: "Thuốc giảm đau",
      stock: 5,
      minStock: 10,
      salePrice: 8000,
    },
    {
      id: "PRD-002",
      sku: "MED-002",
      name: "Ibuprofen 200mg",
      category: "Thuốc giảm đau",
      stock: 0,
      minStock: 15,
      salePrice: 12000,
    },
    {
      id: "PRD-003",
      sku: "VIT-001",
      name: "Vitamin C 1000mg",
      category: "Vitamin",
      stock: 8,
      minStock: 20,
      salePrice: 15000,
    },
    {
      id: "PRD-004",
      sku: "BND-001",
      name: "Băng vết thương",
      category: "Vật tư y tế",
      stock: 12,
      minStock: 10,
      salePrice: 5000,
    },
  ];

  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className={cx("tableCard")}>
      <div className={cx("tableHeader")}>
        <h3 className={cx("tableTitle")}>Sản Phẩm Tồn Kho Thấp (&lt; 10)</h3>
        <span className={cx("warningBadge")}>
          <FontAwesomeIcon icon={faWarning} /> {lowStockProducts.length} sản
          phẩm
        </span>
      </div>
      <div className={cx("tableWrapper")}>
        <table className={cx("table")}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Tồn kho</th>
              <th>Giá bán</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map((product) => (
              <tr key={product.id}>
                <td className={cx("sku")}>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>
                  <StockBadge
                    stock={product.stock}
                    minStock={product.minStock}
                  />
                </td>
                <td className={cx("price")}>{formatVND(product.salePrice)}</td>
                <td>
                  <div className={cx("actions")}>
                    <button className={cx("actionBtn", "view")} title="Xem">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className={cx("actionBtn", "edit")} title="Sửa">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Dashboard() {
  // TODO: Thay bằng API call thật để lấy dữ liệu thực
  // Stats data
  const stats = [
    {
      icon: faShoppingCart,
      title: "Đơn Hôm Nay",
      value: "12",
      subtitle: "+2 so với hôm qua",
      color: "blue",
    },
    {
      icon: faShoppingCart,
      title: "Đơn Chờ Xử Lý",
      value: "8",
      subtitle: "Cần xử lý gấp",
      color: "orange",
    },
    {
      icon: faBox,
      title: "Sản Phẩm Sắp Hết",
      value: "4",
      subtitle: "Tồn kho < 10",
      color: "red",
    },
    {
      icon: faTruck,
      title: "Phiếu Nhập Tuần Này",
      value: "6",
      subtitle: "Tổng: 8.5M đ",
      color: "green",
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
            subtitle={stat.subtitle}
            color={stat.color}
          />
        ))}
      </div>

      {/* Tables Section */}
      <div className={cx("tablesSection")}>
        <RecentOrdersTable />
        <LowStockProductsTable />
      </div>
    </div>
  );
}

export default Dashboard;
