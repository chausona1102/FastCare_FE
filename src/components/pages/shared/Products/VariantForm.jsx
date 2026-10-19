import classNames from "classnames/bind";
import styles from "./Products.module.scss";

const cx = classNames.bind(styles);

function VariantForm({
  products,
  editingVariant,
  formData,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className={cx("management-form")} onSubmit={onSubmit}>
      <h2>{editingVariant ? "Chỉnh sửa phiên bản" : "Tạo phiên bản"}</h2>
      <div className={cx("form-grid")}>
        <label className={cx("wide-field")}>
          Sản phẩm *
          <select name="product" value={formData.product} onChange={onChange} required>
            <option value="">Chọn sản phẩm</option>
            {products.filter((product) => !product.deletedAt).map((product) => (
              <option key={product._id || product.id} value={product._id || product.id}>
                {product.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          SKU *
          <input name="sku" value={formData.sku} onChange={onChange} required />
        </label>
        <label>
          Giá *
          <input name="price" type="number" min="0" value={formData.price} onChange={onChange} required />
        </label>
        <label>
          Tồn kho
          <input name="stockQuantity" type="number" min="0" value={formData.stockQuantity} onChange={onChange} />
        </label>
        <label>
          Dung lượng
          <input name="storage" value={formData.storage} onChange={onChange} placeholder="VD: 256GB" />
        </label>
        <label>
          Màu sắc (phân cách bằng dấu phẩy)
          <input name="colors" value={formData.colors} onChange={onChange} placeholder="Đen, Trắng" />
        </label>
        <label>
          Ảnh phiên bản
          <input name="images" type="file" accept="image/*" multiple onChange={onChange} />
        </label>
      </div>
      {editingVariant?.images?.length > 0 && (
        <p className={cx("current-image")}>
          Có {editingVariant.images.length} ảnh hiện tại; tải ảnh mới sẽ thay thế ảnh hiện tại.
        </p>
      )}
      <div className={cx("form-actions")}>
        <button className={cx("cancel-button")} type="button" onClick={onCancel}>Hủy</button>
        <button className={cx("submit-button")} type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : editingVariant ? "Lưu phiên bản" : "Tạo phiên bản"}
        </button>
      </div>
    </form>
  );
}

export default VariantForm;
