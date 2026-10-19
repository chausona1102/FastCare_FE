import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "./Products.module.scss";

const cx = classNames.bind(styles);
const formatPrice = (price) => `${Number(price || 0).toLocaleString("vi-VN")} đ`;

function VariantTable({ variants, products, actionId, onEdit, onToggleStatus }) {
  return (
    <table className={cx("data-table")}>
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th>SKU</th>
          <th>Dung lượng / màu</th>
          <th>Giá</th>
          <th>Tồn kho</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((variant) => {
          const variantId = variant._id || variant.id;
          const product = variant.product?.title
            ? variant.product
            : products.find((item) => (item._id || item.id) === (
              typeof variant.product === "object" ? variant.product?._id : variant.product
            ));
          return (
            <tr key={variantId}>
              <td>{product?.title || "-"}</td>
              <td><strong>{variant.sku || "-"}</strong></td>
              <td>{[variant.storage, ...(variant.colors || [])].filter(Boolean).join(" · ") || "-"}</td>
              <td>{formatPrice(variant.price)}</td>
              <td>{variant.stockQuantity ?? 0}</td>
              <td>
                <span className={cx("status", variant.deleteAt ? "deleted" : "active")}>
                  {variant.deleteAt ? "Đã xóa" : "Đang bán"}
                </span>
              </td>
              <td>
                <div className={cx("row-actions")}>
                  <button
                    className={cx("action-button")}
                    type="button"
                    title="Chỉnh sửa phiên bản"
                    aria-label={`Chỉnh sửa variant ${variant.sku}`}
                    onClick={() => onEdit(variant)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className={cx("action-button", variant.deleteAt ? "restore-action" : "delete-action")}
                    type="button"
                    title={variant.deleteAt ? "Khôi phục" : "Xóa phiên bản"}
                    aria-label={`${variant.deleteAt ? "Khôi phục" : "Xóa"} variant ${variant.sku}`}
                    disabled={actionId === variantId}
                    onClick={() => onToggleStatus(variant)}
                  >
                    <FontAwesomeIcon icon={variant.deleteAt ? faRotateLeft : faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
        {variants.length === 0 && (
          <tr><td className={cx("empty-state")} colSpan="7">Không tìm thấy phiên bản phù hợp.</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default VariantTable;
