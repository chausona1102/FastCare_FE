import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "./Products.module.scss";

const cx = classNames.bind(styles);
const formatPrice = (price) => `${Number(price || 0).toLocaleString("vi-VN")} đ`;

function ProductTable({ products, actionId, onEdit, onToggleStatus }) {
  return (
    <table className={cx("data-table")}>
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th>Thương hiệu</th>
          <th>Danh mục</th>
          <th>Giá từ</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const productId = product._id || product.id;
          return (
            <tr key={productId}>
              <td>
                <div className={cx("item-identity")}>
                  {product.avatar
                    ? <img src={product.avatar} alt="" />
                    : <span className={cx("image-fallback")}>{(product.title || "?").charAt(0)}</span>}
                  <strong>{product.title}</strong>
                </div>
              </td>
              <td>{product.brand || "-"}</td>
              <td>{product.category?.name || "-"}</td>
              <td>{formatPrice(product.minPrice)}</td>
              <td>
                <span className={cx("status", product.deletedAt ? "deleted" : "active")}>
                  {product.deletedAt ? "Đã ẩn" : "Đang bán"}
                </span>
              </td>
              <td>
                <div className={cx("row-actions")}>
                  <button
                    className={cx("action-button")}
                    type="button"
                    title="Chỉnh sửa sản phẩm"
                    aria-label={`Chỉnh sửa ${product.title}`}
                    onClick={() => onEdit(product)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className={cx("action-button", product.deletedAt ? "restore-action" : "delete-action")}
                    type="button"
                    title={product.deletedAt ? "Khôi phục" : "Ẩn sản phẩm"}
                    aria-label={`${product.deletedAt ? "Khôi phục" : "Ẩn"} ${product.title}`}
                    disabled={actionId === productId}
                    onClick={() => onToggleStatus(product)}
                  >
                    <FontAwesomeIcon icon={product.deletedAt ? faRotateLeft : faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
        {products.length === 0 && (
          <tr><td className={cx("empty-state")} colSpan="6">Không tìm thấy sản phẩm phù hợp.</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default ProductTable;
