import styles from "./Home.module.scss";
import classNames from "classnames/bind";
import Cart from "~/components/Cart";
import { banner_samsumS26plus } from "~/assets/banner";
import { keyboard, iphone17promax, hotGif } from "~/assets/images";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faGripLinesVertical,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Title from "~/components/Title";
import Button from "../../Button";
import Tippy from "@tippyjs/react";
const cx = classNames.bind(styles);

var hotProducts = [
  {
    id: "prod_001",
    title: "Sản phẩm hot 1",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 20,
    installment: 2,
    brand: "iPhone",
    ram: "8GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2556 x 1179 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_001",
        colors: ["Mặc định"],
        images: [iphone17promax],
        storage: "128GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "HOT-001-DEFAULT",
      },
    ],
  },
  {
    id: "prod_002",
    title: "Sản phẩm hot 2",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 0,
    installment: 0,
    brand: "iPhone",
    ram: "8GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2556 x 1179 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_002",
        colors: ["Mặc định"],
        images: [iphone17promax],
        storage: "128GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "HOT-002-DEFAULT",
      },
    ],
  },
  {
    id: "prod_003",
    title: "Sản phẩm hot 3",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 0,
    installment: 0,
    brand: "iPhone",
    ram: "8GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2556 x 1179 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_003",
        colors: ["Mặc định"],
        images: [iphone17promax],
        storage: "128GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "HOT-003-DEFAULT",
      },
    ],
  },
  {
    id: "prod_004",
    title: "Sản phẩm hot 4",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 0,
    installment: 0,
    brand: "iPhone",
    ram: "8GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2556 x 1179 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_004",
        colors: ["Mặc định"],
        images: [iphone17promax],
        storage: "128GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "HOT-004-DEFAULT",
      },
    ],
  },
];

var phone = [
  {
    id: "prod_005",
    title: "Điện thoại 1",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 0,
    installment: 0,
    brand: "iPhone",
    ram: "8GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2556 x 1179 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_005",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "128GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-001-BLK-128",
      },
    ],
  },
  {
    id: "prod_006",
    title: "Điện thoại 2",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 5,
    installment: 6,
    brand: "iPhone",
    ram: "8GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2556 x 1179 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_006",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "128GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-002-BLK-128",
      },
    ],
  },
  {
    id: "prod_007",
    title: "Điện thoại 3",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 10,
    installment: 12,
    brand: "iPhone",
    ram: "12GB",
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
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_007",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "256GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-003-BLK-256",
      },
    ],
  },
  {
    id: "prod_008",
    title: "Điện thoại 4",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 15,
    installment: 24,
    brand: "iPhone",
    ram: "12GB",
    rom: "512GB",
    screenSize: 6.7,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18 Pro",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2796 x 1290 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_008",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "512GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-004-BLK-512",
      },
    ],
  },
  {
    id: "prod_009",
    title: "Điện thoại 5",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 20,
    installment: 0,
    brand: "iPhone",
    ram: "16GB",
    rom: "512GB",
    screenSize: 6.9,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18 Pro",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2868 x 1320 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_009",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "512GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-005-BLK-512",
      },
    ],
  },
  {
    id: "prod_010",
    title: "Điện thoại 6",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 0,
    installment: 6,
    brand: "iPhone",
    ram: "8GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2556 x 1179 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_010",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "128GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-006-BLK-128",
      },
    ],
  },
  {
    id: "prod_011",
    title: "Điện thoại 7",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 8,
    installment: 12,
    brand: "iPhone",
    ram: "12GB",
    rom: "256GB",
    screenSize: 6.3,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2556 x 1179 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_011",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "256GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-007-BLK-256",
      },
    ],
  },
  {
    id: "prod_012",
    title: "Điện thoại 8",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 30,
    installment: 24,
    brand: "iPhone",
    ram: "6GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "LCD",
    rearCamera: "12MP",
    frontCamera: "7MP",
    chipset: "A15",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 17",
    screenResolution: "1334 x 750 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_012",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "128GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-008-BLK-128",
      },
    ],
  },
  {
    id: "prod_013",
    title: "Điện thoại 9",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 0,
    installment: 0,
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
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_013",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "256GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-009-BLK-256",
      },
    ],
  },
  {
    id: "prod_014",
    title: "Điện thoại 10",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 12,
    installment: 6,
    brand: "iPhone",
    ram: "8GB",
    rom: "128GB",
    screenSize: 6.1,
    displayTech: "OLED",
    rearCamera: "48MP",
    frontCamera: "12MP",
    chipset: "A18",
    nfc: "NFC",
    sim: "2 Sim",
    os: "iOS 18",
    screenResolution: "2556 x 1179 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_003",
      name: "iPhone",
      parentCategory: { id: "cat_001", name: "Điện thoại", parentID: null },
    },
    variants: [
      {
        id: "var_014",
        colors: ["Đen Titan"],
        images: [iphone17promax],
        storage: "128GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "PHO-010-BLK-128",
      },
    ],
  },
];

var laptop = [
  {
    id: "prod_015",
    title: "Máy tính 1",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 0,
    installment: 12,
    brand: "MacBook",
    ram: "16GB",
    rom: "512GB",
    screenSize: 13.6,
    displayTech: "Liquid Retina",
    rearCamera: null,
    frontCamera: "12MP",
    chipset: "Apple M3",
    nfc: null,
    sim: null,
    os: "macOS Sequoia",
    screenResolution: "2560 x 1664 pixels",
    cpu: "CPU 8 lõi với 4 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_004",
      name: "MacBook",
      parentCategory: { id: "cat_002", name: "Laptop", parentID: null },
    },
    variants: [
      {
        id: "var_015",
        colors: ["Bạc"],
        images: [iphone17promax],
        storage: "512GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "LAP-001-SLV-512",
      },
    ],
  },
  {
    id: "prod_016",
    title: "Máy tính 2",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 5,
    installment: 24,
    brand: "MacBook",
    ram: "16GB",
    rom: "512GB",
    screenSize: 14.2,
    displayTech: "Liquid Retina XDR",
    rearCamera: null,
    frontCamera: "12MP",
    chipset: "Apple M3 Pro",
    nfc: null,
    sim: null,
    os: "macOS Sequoia",
    screenResolution: "3024 x 1964 pixels",
    cpu: "CPU 11 lõi với 5 lõi hiệu năng và 6 lõi tiết kiệm điện",
    category: {
      id: "cat_004",
      name: "MacBook",
      parentCategory: { id: "cat_002", name: "Laptop", parentID: null },
    },
    variants: [
      {
        id: "var_016",
        colors: ["Bạc"],
        images: [iphone17promax],
        storage: "512GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "LAP-002-SLV-512",
      },
    ],
  },
  {
    id: "prod_017",
    title: "Máy tính 3",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 10,
    installment: 0,
    brand: "MacBook",
    ram: "18GB",
    rom: "512GB",
    screenSize: 15.3,
    displayTech: "Liquid Retina",
    rearCamera: null,
    frontCamera: "12MP",
    chipset: "Apple M3",
    nfc: null,
    sim: null,
    os: "macOS Sequoia",
    screenResolution: "2880 x 1864 pixels",
    cpu: "CPU 8 lõi với 4 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_004",
      name: "MacBook",
      parentCategory: { id: "cat_002", name: "Laptop", parentID: null },
    },
    variants: [
      {
        id: "var_017",
        colors: ["Bạc"],
        images: [iphone17promax],
        storage: "512GB",
        price: 1000000,
        stockQuantity: 100,
        sku: "LAP-003-SLV-512",
      },
    ],
  },
  {
    id: "prod_018",
    title: "Máy tính 4",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 100,
    minPrice: 1000000,
    discount: 0,
    installment: 6,
    brand: "MacBook",
    ram: "24GB",
    rom: "1TB",
    screenSize: 16.2,
    displayTech: "Liquid Retina XDR",
    rearCamera: null,
    frontCamera: "12MP",
    chipset: "Apple M3 Max",
    nfc: null,
    sim: null,
    os: "macOS Sequoia",
    screenResolution: "3456 x 2234 pixels",
    cpu: "CPU 16 lõi với 12 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "cat_004",
      name: "MacBook",
      parentCategory: { id: "cat_002", name: "Laptop", parentID: null },
    },
    variants: [
      {
        id: "var_018",
        colors: ["Bạc"],
        images: [iphone17promax],
        storage: "1TB",
        price: 1000000,
        stockQuantity: 100,
        sku: "LAP-004-SLV-1TB",
      },
    ],
  },
];

var accessories = [
  {
    id: "prod_019",
    title: "Accessory 1",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 0,
    minPrice: 20000000,
    discount: 0,
    installment: 0,
    brand: "Gaming",
    ram: null,
    rom: null,
    screenSize: null,
    displayTech: null,
    rearCamera: null,
    frontCamera: null,
    chipset: null,
    nfc: null,
    sim: null,
    os: null,
    screenResolution: null,
    cpu: null,
    category: {
      id: "cat_005",
      name: "Gaming",
      parentCategory: { id: "cat_003", name: "Phụ kiện", parentID: null },
    },
    variants: [
      {
        id: "var_019",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: null,
        price: 20000000,
        stockQuantity: 10,
        sku: "ACC-PS5-001-WHT",
      },
    ],
  },
  {
    id: "prod_020",
    title: "Accessory 2",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 0,
    minPrice: 20000000,
    discount: 0,
    installment: 0,
    brand: "Gaming",
    ram: null,
    rom: null,
    screenSize: null,
    displayTech: null,
    rearCamera: null,
    frontCamera: null,
    chipset: null,
    nfc: null,
    sim: null,
    os: null,
    screenResolution: null,
    cpu: null,
    category: {
      id: "cat_005",
      name: "Gaming",
      parentCategory: { id: "cat_003", name: "Phụ kiện", parentID: null },
    },
    variants: [
      {
        id: "var_020",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: null,
        price: 20000000,
        stockQuantity: 10,
        sku: "ACC-PS5-002-WHT",
      },
    ],
  },
  {
    id: "prod_021",
    title: "Accessory 3",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 0,
    minPrice: 20000000,
    discount: 0,
    installment: 0,
    brand: "Gaming",
    ram: null,
    rom: null,
    screenSize: null,
    displayTech: null,
    rearCamera: null,
    frontCamera: null,
    chipset: null,
    nfc: null,
    sim: null,
    os: null,
    screenResolution: null,
    cpu: null,
    category: {
      id: "cat_005",
      name: "Gaming",
      parentCategory: { id: "cat_003", name: "Phụ kiện", parentID: null },
    },
    variants: [
      {
        id: "var_021",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: null,
        price: 20000000,
        stockQuantity: 10,
        sku: "ACC-PS5-003-WHT",
      },
    ],
  },
  {
    id: "prod_022",
    title: "Accessory 4",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 0,
    minPrice: 20000000,
    discount: 0,
    installment: 0,
    brand: "Gaming",
    ram: null,
    rom: null,
    screenSize: null,
    displayTech: null,
    rearCamera: null,
    frontCamera: null,
    chipset: null,
    nfc: null,
    sim: null,
    os: null,
    screenResolution: null,
    cpu: null,
    category: {
      id: "cat_005",
      name: "Gaming",
      parentCategory: { id: "cat_003", name: "Phụ kiện", parentID: null },
    },
    variants: [
      {
        id: "var_022",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: null,
        price: 20000000,
        stockQuantity: 10,
        sku: "ACC-PS5-004-WHT",
      },
    ],
  },
  {
    id: "prod_023",
    title: "Accessory 5",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 0,
    minPrice: 20000000,
    discount: 0,
    installment: 0,
    brand: "Gaming",
    ram: null,
    rom: null,
    screenSize: null,
    displayTech: null,
    rearCamera: null,
    frontCamera: null,
    chipset: null,
    nfc: null,
    sim: null,
    os: null,
    screenResolution: null,
    cpu: null,
    category: {
      id: "cat_005",
      name: "Gaming",
      parentCategory: { id: "cat_003", name: "Phụ kiện", parentID: null },
    },
    variants: [
      {
        id: "var_023",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: null,
        price: 20000000,
        stockQuantity: 10,
        sku: "ACC-PS5-005-WHT",
      },
    ],
  },
  {
    id: "prod_024",
    title: "Accessory 6",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 0,
    minPrice: 20000000,
    discount: 0,
    installment: 0,
    brand: "Gaming",
    ram: null,
    rom: null,
    screenSize: null,
    displayTech: null,
    rearCamera: null,
    frontCamera: null,
    chipset: null,
    nfc: null,
    sim: null,
    os: null,
    screenResolution: null,
    cpu: null,
    category: {
      id: "cat_005",
      name: "Gaming",
      parentCategory: { id: "cat_003", name: "Phụ kiện", parentID: null },
    },
    variants: [
      {
        id: "var_024",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: null,
        price: 20000000,
        stockQuantity: 10,
        sku: "ACC-PS5-006-WHT",
      },
    ],
  },
  {
    id: "prod_025",
    title: "Accessory 7",
    avatar: iphone17promax,
    images: [iphone17promax],
    sold: 0,
    minPrice: 20000000,
    discount: 0,
    installment: 0,
    brand: "Gaming",
    ram: null,
    rom: null,
    screenSize: null,
    displayTech: null,
    rearCamera: null,
    frontCamera: null,
    chipset: null,
    nfc: null,
    sim: null,
    os: null,
    screenResolution: null,
    cpu: null,
    category: {
      id: "cat_005",
      name: "Gaming",
      parentCategory: { id: "cat_003", name: "Phụ kiện", parentID: null },
    },
    variants: [
      {
        id: "var_025",
        colors: ["Trắng"],
        images: [iphone17promax],
        storage: null,
        price: 20000000,
        stockQuantity: 10,
        sku: "ACC-PS5-007-WHT",
      },
    ],
  },
];

function Home() {
  const [selectedCategory, setSelectedCategory] = useState("phone");
  const verticalGridRef = useRef(null);
  const accessoriesRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        verticalGridRef.current.style.display = "flex";
      }
      if (window.scrollY > 1000) {
        accessoriesRef.current.style.display = "block";
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      console.log("unmounted");
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={cx("wrapper")}>
      <div className={cx("content")}>
        {/* Slogan */}
        <div className={cx("slogan")}>
          <img src={keyboard} alt="Keyboard" className={cx("slogan-img")} />
          <div className={cx("slogan-overlay")}>
            <div className={cx("slogan-content")}>
              <span className={cx("slogan-badge")}>FastCare Technology</span>
              <h1 className={cx("slogan-title")}>
                Cùng bạn khám phá
                <br />
                thế giới công nghệ
              </h1>
              <p className={cx("slogan-sub")}>
                Sản phẩm chính hãng · Giao hàng nhanh · Bảo hành tận tâm
              </p>
            </div>
          </div>
        </div>
        {/* Hot Products */}
        <div className={cx("hot-products")}>
          <div className={cx("hot-products-overlay")}>
            <img src={hotGif} alt="Hot" className={cx("hot-gif")} />
            <Title title="Sản phẩm hot" className={cx("section-title")} />
            <div className={cx("products-grid")}>
              {hotProducts.map((product, index) => (
                <Cart
                  key={index}
                  id={product.id}
                  title={product.title}
                  minPrice={product.minPrice}
                  avatar={product.avatar}
                  sold={product.sold}
                  discount={product.discount}
                  installment={product.installment}
                  screenSize={product.screenSize}
                  rom={product.rom}
                  to={`/product-detail/${product.id}`}
                />
              ))}
            </div>
            <div className={cx("circle-1")}></div>
            <div className={cx("circle-2")}></div>
            <div className={cx("circle-3")}></div>
          </div>
        </div>
        {/* Banner SamsumS26Plus */}
        <div className={cx("banner")}>
          <img src={banner_samsumS26plus} />
        </div>

        {/* Products */}
        <div className={cx("products", "vertical-grid")} ref={verticalGridRef}>
          <div className={cx("banner-vertical")}></div>
          <div className={cx("products-content")}>
            <div className={cx("selection")}>
              <button
                className={cx({ active: selectedCategory === "phone" })}
                onClick={() => setSelectedCategory("phone")}
              >
                <span>Điện thoại</span>
              </button>
              <button
                className={cx({ active: selectedCategory === "laptop" })}
                onClick={() => setSelectedCategory("laptop")}
              >
                <span>Máy tính</span>
              </button>
            </div>
            <div className={cx("products-selection")}>
              {/* Hiển thị sản phẩm dựa trên selectedCategory */}
              {selectedCategory === "phone" &&
                phone.map((product, index) => (
                  <Cart
                    key={index}
                    id={product.id}
                    title={product.title}
                    minPrice={product.minPrice}
                    avatar={product.avatar}
                    sold={product.sold}
                    discount={product.discount}
                    installment={product.installment}
                    screenSize={product.screenSize}
                    rom={product.rom}
                    to={`/product-detail/${product.id}`}
                  />
                ))}
              {selectedCategory === "laptop" &&
                laptop.map((product, index) => (
                  <Cart
                    key={index}
                    id={product.id}
                    title={product.title}
                    minPrice={product.minPrice}
                    avatar={product.avatar}
                    sold={product.sold}
                    discount={product.discount}
                    installment={product.installment}
                    screenSize={product.screenSize}
                    rom={product.rom}
                    to={`/product-detail/${product.id}`}
                  />
                ))}
            </div>
            <Link
              className={cx("more-btn")}
              to={`/products/${
                selectedCategory == "phone"
                  ? phone[0].category.parentCategory.id
                  : laptop[0].category.parentCategory.id
              }`}
            >
              <FontAwesomeIcon icon={faAngleLeft} className={cx("more-icon")} />
              <span>Xem thêm</span>
              <FontAwesomeIcon
                icon={faAngleRight}
                className={cx("more-icon")}
              />
            </Link>
          </div>
        </div>
        {/* Accessories */}
        <div className={cx("accessories")} ref={accessoriesRef}>
          <div className="d-flex flex-direction-row align-items-center gap-5">
            <Title
              title="Phụ kiện chính hãng"
              className={cx("accessories-title")}
              className="mx-4"
            />
            <Tippy content="Xem thêm" placement="right">
              <Button
                light
                to={`products/${accessories[0].category.parentCategory.id}`}
                className={cx("more-accessories")}
              >
                <FontAwesomeIcon icon={faGripLinesVertical} />
                Xem tất cả <FontAwesomeIcon icon={faAngleRight} />
              </Button>
            </Tippy>
          </div>
          <div className={cx("accessories-grid")}>
            {accessories.map((item) => (
              <Link
                to={`/product-detail/${item.id}`}
                className={cx("accessories-btn")}
                key={item.id}
              >
                <div className={cx("card-horizontal")}>
                  <img src={item.avatar} />
                  <span>{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
