import classNames from "classnames/bind";
import styles from "./Products.module.scss";

const cx = classNames.bind(styles);

const SPECIFICATION_FIELDS = {
  phone: [
    ["ram", "RAM"],
    ["storage", "Bộ nhớ"],
    ["screenSize", "Kích thước màn hình", "number"],
    ["displayTech", "Công nghệ màn hình"],
    ["screenFeatures", "Tính năng màn hình"],
    ["rearCamera", "Camera sau"],
    ["frontCamera", "Camera trước"],
    ["chipset", "Chipset"],
    ["cpu", "CPU"],
    ["os", "Hệ điều hành"],
    ["screenResolution", "Độ phân giải màn hình"],
    ["sim", "SIM"],
    ["nfc", "NFC", "checkbox"],
  ],
  laptop: [
    ["cpu", "CPU"],
    ["gpu", "GPU"],
    ["ram", "RAM"],
    ["storage", "Bộ nhớ"],
    ["screenSize", "Kích thước màn hình", "number"],
    ["displayTech", "Công nghệ màn hình"],
    ["screenFeatures", "Tính năng màn hình"],
    ["screenResolution", "Độ phân giải màn hình"],
    ["os", "Hệ điều hành"],
    ["battery", "Pin"],
  ],
  accessory: [
    ["compatibility", "Thiết bị tương thích"],
    ["connection", "Kết nối"],
    ["material", "Chất liệu"],
    ["capacity", "Dung lượng"],
    ["connector", "Cổng kết nối"],
    ["power", "Công suất"],
  ],
};

const isChecked = (value) =>
  value === true || value === "true" || value === "Có";

function ProductForm({
  categories,
  parentCategories,
  editingProduct,
  formData,
  submitting,
  onChange,
  onSpecificationChange,
  onAvatarChange,
  onImagesChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className={cx("management-form")} onSubmit={onSubmit}>
      <h2>{editingProduct ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm"}</h2>
      <div className={cx("form-grid")}>
        <label className={cx("wide-field")}>
          Tên sản phẩm *
          <input name="title" value={formData.title} onChange={onChange} maxLength={200} required />
        </label>
        <label>
          Danh mục *
          <select name="category" value={formData.category} onChange={onChange} required>
            <option value="">Chọn danh mục</option>
            {categories.map((category) => {
              const parentId =
                typeof category.parentCategory === "object"
                  ? category.parentCategory?._id || category.parentCategory?.id
                  : category.parentCategory;
              const parentName = parentCategories.find(
                (parent) => (parent._id || parent.id) === parentId
              )?.name;
              return (
                <option key={category._id || category.id} value={category._id || category.id}>
                  {parentName ? `${parentName} / ` : ""}{category.name}
                </option>
              );
            })}
          </select>
        </label>
        <label>
          Thương hiệu
          <input name="brand" value={formData.brand || ""} onChange={onChange} />
        </label>
        <label>
          Giá từ *
          <input name="minPrice" type="number" min="0" value={formData.minPrice} onChange={onChange} required />
        </label>
        <label>
          Giảm giá (%)
          <input name="discount" type="number" min="0" max="100" value={formData.discount} onChange={onChange} />
        </label>
        <label>
          Trả góp (%)
          <input name="installment" type="number" min="0" max="100" value={formData.installment} onChange={onChange} />
        </label>
        <label>
          Ảnh đại diện {!editingProduct && "*"}
          <input
            name="avatar"
            type="file"
            accept="image/*"
            required={!editingProduct && !formData.avatar}
            onChange={onAvatarChange}
          />
        </label>
        <label>
          Ảnh bổ sung
          <input name="images" type="file" accept="image/*" multiple onChange={onImagesChange} />
        </label>
        {formData.productType && (
          <div className={cx("wide-field")}>
            <h3>
              Thông số{" "}
              {formData.productType === "phone"
                ? "điện thoại"
                : formData.productType === "laptop"
                  ? "laptop"
                  : "phụ kiện"}
            </h3>
          </div>
        )}
        {SPECIFICATION_FIELDS[formData.productType]?.map(([field, label, type = "text"]) => (
          <label key={field}>
            {label}
            <input
              name={field}
              type={type}
              min={type === "number" ? "0" : undefined}
              step={type === "number" ? "0.1" : undefined}
              checked={type === "checkbox" ? isChecked(formData.specifications?.[formData.productType]?.[field]) : undefined}
              value={type === "checkbox" ? undefined : formData.specifications?.[formData.productType]?.[field] || ""}
              onChange={onSpecificationChange}
            />
          </label>
        ))}
        <label>
          Khối lượng (g) *
          <input name="weight" type="number" min="0.01" step="any" value={formData.weight} onChange={onChange} required />
        </label>
        <label>
          Dài (cm) *
          <input name="length" type="number" min="0.01" step="any" value={formData.length} onChange={onChange} required />
        </label>
        <label>
          Rộng (cm) *
          <input name="width" type="number" min="0.01" step="any" value={formData.width} onChange={onChange} required />
        </label>
        <label>
          Cao (cm) *
          <input name="height" type="number" min="0.01" step="any" value={formData.height} onChange={onChange} required />
        </label>
      </div>
      {editingProduct?.avatar && (
        <p className={cx("current-image")}>
          Ảnh hiện tại: <a href={editingProduct.avatar} target="_blank" rel="noreferrer">Xem ảnh</a>
        </p>
      )}
      <div className={cx("form-actions")}>
        <button className={cx("cancel-button")} type="button" onClick={onCancel}>Hủy</button>
        <button className={cx("submit-button")} type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : editingProduct ? "Lưu sản phẩm" : "Tạo sản phẩm"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
