import classNames from "classnames/bind";
import styles from "./Products.module.scss";

const cx = classNames.bind(styles);

function VariantForm({
  products,
  editingVariant,
  formData,
  submitting,
  onChange,
  onColorChange,
  onAddColor,
  onRemoveColor,
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
      </div>
      <fieldset className={cx("color-rows")}>
        <legend>Màu sắc và ảnh</legend>
        {(formData.colors.length ? formData.colors : [{ color: "", image: null, existingImage: "" }])
          .map((row, index) => (
            <div className={cx("color-row")} key={index}>
              <label>
                Màu sắc *
                <input
                  type="text"
                  value={row.color}
                  onChange={(event) => onColorChange(index, "color", event.target.value)}
                  placeholder="VD: Đen"
                  required
                />
              </label>
              <label>
                Ảnh màu{!editingVariant || !row.existingImage ? " *" : ""}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => onColorChange(index, "image", event.target.files?.[0] || null)}
                  required={!editingVariant || !row.existingImage}
                />
                {row.existingImage && !row.image && (
                  <span className={cx("existing-image")}>Đã có ảnh</span>
                )}
              </label>
              <button
                className={cx("remove-color-button")}
                type="button"
                aria-label={`Xóa dòng màu ${index + 1}`}
                disabled={formData.colors.length <= 1}
                onClick={() => onRemoveColor(index)}
              >
                Xóa
              </button>
            </div>
          ))}
        <button
          className={cx("add-color-button")}
          type="button"
          disabled={formData.colors.length >= 10}
          onClick={onAddColor}
        >
          + Thêm màu
        </button>
        {editingVariant?.images?.length > 0 && (
          <p className={cx("current-image")}>
            Nếu thay ảnh khi chỉnh sửa, hãy tải lại ảnh cho tất cả màu.
          </p>
        )}
      </fieldset>
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
