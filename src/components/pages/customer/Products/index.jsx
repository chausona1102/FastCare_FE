import style from "./Products.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

import Cart from "~/components/Cart";
import Button from "~/components/Button";
import Title from "~/components/Title";
import { iphone17promax } from "~/assets/images";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
// import { useState } from "react";

var allProducts = [
  {
    id: "prod_001",
    title: "iPhone 15 Pro Max 256GB",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 210,
    minPrice: 36990000,
    discount: 10,
    installment: 12,
    brand: "iPhone",
    ram: "8GB",
    rom: "256GB",
    screenSize: 6.7,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18 Pro",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2796 x 1290 pixels",
    cpu: "6-core CPU",
    category: {
      id: "dt_001",
      name: "IPhone",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_001",
        colors: ["Titan Tự nhiên"],
        images: [iphone17promax],
        storage: "256GB",
        price: 36990000,
        stockQuantity: 50,
        sku: "IP15PM-256",
      },
    ],
  },
  {
    id: "prod_002",
    title: "iPhone 15 128GB",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 180,
    minPrice: 24990000,
    discount: 5,
    installment: 6,
    brand: "iPhone",
    ram: "6GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A16",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 17",
    screenResolution: "2556 x 1179",
    cpu: "6-core CPU",
    category: {
      id: "dt_001",
      name: "IPhone",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_002",
        colors: ["Hồng"],
        images: [iphone17promax],
        storage: "128GB",
        price: 24990000,
        stockQuantity: 60,
        sku: "IP15-128",
      },
    ],
  },
  {
    id: "prod_003",
    title: "Samsung Galaxy S24 Ultra",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 140,
    minPrice: 32990000,
    discount: 12,
    installment: 12,
    brand: "Samsung",
    ram: "12GB",
    rom: "256GB",
    screenSize: 6.8,
    displayTech: "AMOLED",
    rearCamera: "200MP",
    frontCamera: "12MP",
    chipset: "Snapdragon 8 Gen 3",
    nfc: "NFC",
    sim: "2 Sim",
    os: "Android 14",
    screenResolution: "3120 x 1440",
    cpu: "Octa-core",
    category: {
      id: "dt_002",
      name: "Samsung",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_003",
        colors: ["Đen"],
        images: [iphone17promax],
        storage: "256GB",
        price: 32990000,
        stockQuantity: 40,
        sku: "SS-S24U",
      },
    ],
  },
  {
    id: "prod_004",
    title: "Xiaomi 14 Pro",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 120,
    minPrice: 21990000,
    discount: 8,
    installment: 6,
    brand: "Xiaomi",
    ram: "12GB",
    rom: "256GB",
    screenSize: 6.73,
    displayTech: "AMOLED",
    rearCamera: "50MP",
    frontCamera: "32MP",
    chipset: "Snapdragon 8 Gen 3",
    nfc: "NFC",
    sim: "2 Sim",
    os: "Android 14",
    screenResolution: "3200 x 1440",
    cpu: "Octa-core",
    category: {
      id: "dt_003",
      name: "Xiaomi",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_004",
        colors: ["Xanh"],
        images: [iphone17promax],
        storage: "256GB",
        price: 21990000,
        stockQuantity: 70,
        sku: "MI14P",
      },
    ],
  },
  {
    id: "prod_005",
    title: "Oppo Find X7",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 95,
    minPrice: 19990000,
    discount: 7,
    installment: 6,
    brand: "Oppo",
    ram: "12GB",
    rom: "256GB",
    screenSize: 6.7,
    displayTech: "AMOLED",
    rearCamera: "50MP",
    frontCamera: "32MP",
    chipset: "Dimensity 9300",
    nfc: "NFC",
    sim: "2 Sim",
    os: "Android 14",
    screenResolution: "2772 x 1240",
    cpu: "Octa-core",
    category: {
      id: "dt_004",
      name: "Oppo",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_005",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: "256GB",
        price: 19990000,
        stockQuantity: 30,
        sku: "OP-FX7",
      },
    ],
  },
  {
    id: "prod_006",
    title: "Nubia Z60 Ultra",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 60,
    minPrice: 17990000,
    discount: 5,
    installment: 6,
    brand: "Nubia",
    ram: "12GB",
    rom: "256GB",
    screenSize: 6.8,
    displayTech: "AMOLED",
    rearCamera: "64MP",
    frontCamera: "16MP",
    chipset: "Snapdragon 8 Gen 3",
    nfc: "NFC",
    sim: "2 Sim",
    os: "Android 14",
    screenResolution: "2480 x 1116",
    cpu: "Octa-core",
    category: {
      id: "dt_005",
      name: "Nubia",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_006",
        colors: ["Đen"],
        images: [iphone17promax],
        storage: "256GB",
        price: 17990000,
        stockQuantity: 25,
        sku: "NB-Z60",
      },
    ],
  },
  {
    id: "prod_007",
    title: "Nubia Z60",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 60,
    minPrice: 17990000,
    discount: 5,
    installment: 6,
    brand: "Nubia",
    ram: "12GB",
    rom: "256GB",
    screenSize: 6.8,
    displayTech: "AMOLED",
    rearCamera: "64MP",
    frontCamera: "16MP",
    chipset: "Snapdragon 8 Gen 3",
    nfc: "NFC",
    sim: "2 Sim",
    os: "Android 14",
    screenResolution: "2480 x 1116",
    cpu: "Octa-core",
    category: {
      id: "dt_005",
      name: "Nubia",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_006",
        colors: ["Đen"],
        images: [iphone17promax],
        storage: "256GB",
        price: 17990000,
        stockQuantity: 25,
        sku: "NB-Z60",
      },
    ],
  },
  {
    id: "prod_005",
    title: "Oppo A21",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 95,
    minPrice: 19990000,
    discount: 7,
    installment: 6,
    brand: "Oppo",
    ram: "12GB",
    rom: "256GB",
    screenSize: 6.7,
    displayTech: "AMOLED",
    rearCamera: "50MP",
    frontCamera: "32MP",
    chipset: "Dimensity 9300",
    nfc: "NFC",
    sim: "2 Sim",
    os: "Android 14",
    screenResolution: "2772 x 1240",
    cpu: "Octa-core",
    category: {
      id: "dt_004",
      name: "Oppo",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_005",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: "256GB",
        price: 19990000,
        stockQuantity: 30,
        sku: "OP-FX7",
      },
    ],
  },
  {
    id: "prod_005",
    title: "IPhone 13 Pro",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 95,
    minPrice: 19990000,
    discount: 7,
    installment: 6,
    brand: "IPhone",
    ram: "12GB",
    rom: "256GB",
    screenSize: 6.7,
    displayTech: "AMOLED",
    rearCamera: "50MP",
    frontCamera: "32MP",
    chipset: "Dimensity 9300",
    nfc: "NFC",
    sim: "2 Sim",
    os: "Android 14",
    screenResolution: "2772 x 1240",
    cpu: "Octa-core",
    category: {
      id: "dt_001",
      name: "IPhone",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_005",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: "256GB",
        price: 19990000,
        stockQuantity: 30,
        sku: "OP-FX7",
      },
    ],
  },
  {
    id: "prod_005",
    title: "Samsung s26 Ultra",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 95,
    minPrice: 19990000,
    discount: 7,
    installment: 6,
    brand: "Samsung",
    ram: "12GB",
    rom: "256GB",
    screenSize: 6.7,
    displayTech: "AMOLED",
    rearCamera: "50MP",
    frontCamera: "32MP",
    chipset: "Dimensity 9300",
    nfc: "NFC",
    sim: "2 Sim",
    os: "Android 14",
    screenResolution: "2772 x 1240",
    cpu: "Octa-core",
    category: {
      id: "dt_002",
      name: "Samsung",
      parentCategory: {
        id: "cat_001",
        name: "Điện thoại",
      },
    },
    variants: [
      {
        id: "var_005",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: "256GB",
        price: 19990000,
        stockQuantity: 30,
        sku: "OP-FX7",
      },
    ],
  },
];

var categories = [
  {
    id: "dt_001",
    name: "IPhone",
    parentCategory: {
      id: "cat_001",
      name: "Điện thoại",
    },
  },
  {
    id: "dt_002",
    name: "Samsung",
    parentCategory: {
      id: "cat_001",
      name: "Điện thoại",
    },
  },
  {
    id: "dt_003",
    name: "Xiaomi",
    parentCategory: {
      id: "cat_001",
      name: "Điện thoại",
    },
  },
  {
    id: "dt_004",
    name: "Oppo",
    parentCategory: {
      id: "cat_001",
      name: "Điện thoại",
    },
  },
  {
    id: "dt_005",
    name: "Nubia",
    parentCategory: {
      id: "cat_001",
      name: "Điện thoại",
    },
  },
];

function Products() {
  //   const [products, setProducts] = useState([]);
  return (
    <div className={cx("wrapper")}>
      {/* Breadcrumb */}
      <div className={cx("breadcrumb")}>
        <nav className="d-flex flex-direction-row align-items-center gap-1 text-sm text-gray-500">
          <Link to="/">Trang chủ</Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <Link to="/products">Sản phẩm</Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <span>{allProducts[0].category.parentCategory.name}</span>
        </nav>
      </div>
      <div className={cx("container")}>
        <Title title={allProducts[0].category.parentCategory.name} />
        <div className={cx("categories")}>
          {categories.map((cate, i) => (
            <Button
              key={i}
              outline
              size="medium"
              key={cate.id}
              onClick={() => console.log(cate.id)}
            >
              {cate.name}
            </Button>
          ))}
        </div>
        <div className={cx("products-grid")}>
          {allProducts.map((pro, index) => (
            <Cart
              key={index}
              id={pro.id}
              title={pro.title}
              minPrice={pro.minPrice}
              avatar={pro.avatar}
              sold={pro.sold}
              discount={pro.discount}
              installment={pro.installment}
              screenSize={pro.screenSize}
              rom={pro.rom}
              to={`/product-detail/${pro.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Products;
