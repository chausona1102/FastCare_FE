

import style from "./ProductDetail.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faGift } from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";

import Title from "~/components/Title";

const SPECIFICATION_LABELS = {
  phone: {
    screenSize: "Kích thước màn hình",
    displayTech: "Công nghệ màn hình",
    screenFeatures: "Tính năng màn hình",
    frontCamera: "Camera trước",
    rearCamera: "Camera sau",
    chipset: "Chipset",
    cpu: "CPU",
    nfc: "Công nghệ NFC",
    ram: "RAM",
    storage: "Bộ nhớ trong",
    sim: "SIM",
    os: "Hệ điều hành",
    screenResolution: "Độ phân giải",
  },
  laptop: {
    cpu: "CPU",
    gpu: "GPU",
    ram: "RAM",
    storage: "Bộ nhớ",
    screenSize: "Kích thước màn hình",
    displayTech: "Công nghệ màn hình",
    screenFeatures: "Tính năng màn hình",
    screenResolution: "Độ phân giải",
    os: "Hệ điều hành",
    battery: "Pin",
  },
  accessory: {
    compatibility: "Thiết bị tương thích",
    connection: "Kết nối",
    material: "Chất liệu",
    capacity: "Dung lượng",
    connector: "Cổng kết nối",
    power: "Công suất",
  },
};

const PRODUCT_TYPES = ["phone", "laptop", "accessory"];
const CATEGORY_TYPES = {
  "dien-thoai": "phone",
  laptop: "laptop",
  "phu-kien": "accessory",
};

const hasSpecifications = (specifications) =>
  specifications &&
  typeof specifications === "object" &&
  Object.values(specifications).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

const getProductType = (product) => {
  if (PRODUCT_TYPES.includes(product.productType)) return product.productType;

  const categoryType = CATEGORY_TYPES[product.category?.parentCategory?.slug];
  if (categoryType) return categoryType;

  const groupedTypes = PRODUCT_TYPES.filter((type) =>
    hasSpecifications(product.specifications?.[type])
  );
  if (groupedTypes.length === 1) return groupedTypes[0];

  if (product.rearCamera || product.frontCamera || product.chipset || product.sim) {
    return "phone";
  }
  if (product.gpu || product.battery) return "laptop";

  return null;
};

function Specifications({ product, handleBuyNow, handleAddToCart }) {
  const productType = getProductType(product);
  const productSpecifications = productType
    ? product.specifications?.[productType] || product
    : {};
  const specificationRows = Object.entries(
    productType ? SPECIFICATION_LABELS[productType] : {}
  )
    .filter(([field]) => {
      const value = productSpecifications[field];
      return value !== undefined && value !== null && value !== "";
    })
    .map(([field, label]) => {
      const value = productSpecifications[field];
      return {
        label,
        value:
          field === "nfc"
            ? value === true || value === "true"
              ? "Có"
              : value === false || value === "false"
                ? "Không"
                : value
            : field === "screenSize"
              ? `${value} inches`
              : value,
      };
    });

  return (
    <div className={cx("specifications")}>
      <div className={cx("container")}>
        <div className={cx("table")}>
          <Title className={cx("title")} title="Thông số kỹ thuật" />
          <table>
            <tbody>
              {specificationRows.length > 0 ? (
                specificationRows.map(({ label, value }) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{value}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">Chưa có thông số kỹ thuật.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={cx("preferential")}>
          {product.discount > 0 && (
            <div className={cx("discount")}>
              <h3>
                <FontAwesomeIcon icon={faGift} />
                <span>Ưu đãi</span>
              </h3>
              <span>- Giảm giá {product.discount}%</span>
            </div>
          )}
          <div className={cx("actions")}>
            {product.installment > 0 && (
              <>
                <button className={cx("installment")}>
                  <span>Trả góp {product.installment}%</span>
                </button>
                <button className={cx("buy-now")} onClick={handleBuyNow}>
                  <h2>Mua ngay</h2>
                  <span>Giao hàng online hoặc nhận tại cửa hàng</span>
                </button>
                <Tippy>
                  <button className={cx("add-cart")} onClick={handleAddToCart}>
                    <FontAwesomeIcon icon={faCartPlus} />
                  </button>
                </Tippy>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Specifications;