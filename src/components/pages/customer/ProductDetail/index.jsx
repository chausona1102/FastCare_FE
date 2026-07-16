import style from "./ProductDetail.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);
import { iphone17promax, avatar } from "~/assets/images";
import Title from "~/components/Title";
import Button from "~/components/Button";
import Cart from "~/components/Cart";
import Loading from "~/components/Loading";
import {
  converseVND,
  converseKilo,
  formatDateHour,
} from "~/utils/functions.jsx";

import api from "~/api";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faCartPlus,
  faGift,
  faMinus,
  faPlus,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import Tippy from "@tippyjs/react";

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "~/store/slices/cartSlice.jsx";
import { useToast } from "~/contexts/ToastContext.jsx";

var feedbacks = [
  {
    id: "64a1f2c3e4b0a1b2c3d4e5f6",
    productID: "64a1f2c3e4b0a1b2c3d4e001",
    user: {
      id: "64a1f2c3e4b0a1b2c3d4e002",
      username: "nguyenvana",
      email: "nguyenvana@gmail.com",
      phone: "0901234567",
      fullname: "Nguyễn Văn A",
      avatarUrl: avatar,
      isActive: true,
      createdAt: "2024-01-10T08:00:00Z",
      deletedAt: null,
    },
    star: 5,
    feedback: "Sản phẩm rất tốt, chất lượng vượt mong đợi!",
    images: [iphone17promax, iphone17promax],
    createdAt: "2024-06-01T08:30:00Z",
  },
  {
    id: "64a1f2c3e4b0a1b2c3d4e5f7",
    productID: "64a1f2c3e4b0a1b2c3d4e001",
    user: {
      id: "64a1f2c3e4b0a1b2c3d4e003",
      username: "tranthib",
      email: "tranthib@gmail.com",
      phone: "0912345678",
      fullname: "Trần Thị B",
      avatarUrl: avatar,
      isActive: true,
      createdAt: "2024-02-15T09:30:00Z",
      deletedAt: null,
    },
    star: 4,
    feedback: "Giao hàng nhanh, sản phẩm đúng mô tả.",
    images: [iphone17promax, iphone17promax],
    createdAt: "2024-06-03T14:15:00Z",
  },
  {
    id: "64a1f2c3e4b0a1b2c3d4e5f8",
    productID: "64a1f2c3e4b0a1b2c3d4e002",
    user: {
      id: "64a1f2c3e4b0a1b2c3d4e004",
      username: "levanc",
      email: "levanc@gmail.com",
      phone: "0923456789",
      fullname: "Lê Văn C",
      avatarUrl: avatar,
      isActive: true,
      createdAt: "2024-03-20T10:00:00Z",
      deletedAt: null,
    },
    star: 3,
    feedback: "Sản phẩm tạm ổn, nhưng màu sắc hơi khác so với ảnh.",
    images: [iphone17promax, iphone17promax],
    createdAt: "2024-06-10T09:00:00Z",
  },
  {
    id: "64a1f2c3e4b0a1b2c3d4e5f9",
    productID: "64a1f2c3e4b0a1b2c3d4e003",
    user: {
      id: "64a1f2c3e4b0a1b2c3d4e005",
      username: "phamthid",
      email: "phamthid@gmail.com",
      phone: "0934567890",
      fullname: "Phạm Thị D",
      avatarUrl: avatar,
      isActive: false,
      createdAt: "2024-04-05T11:00:00Z",
      deletedAt: "2024-06-01T00:00:00Z",
    },
    star: 1,
    feedback: "Hàng bị lỗi, rất thất vọng.",
    images: [iphone17promax, iphone17promax],
    createdAt: "2024-06-15T20:45:00Z",
  },
  {
    id: "64a1f2c3e4b0a1b2c3d4e5fa",
    productID: "64a1f2c3e4b0a1b2c3d4e002",
    user: {
      id: "64a1f2c3e4b0a1b2c3d4e006",
      username: "hoangvane",
      email: "hoangvane@gmail.com",
      phone: "0945678901",
      fullname: "Hoàng Văn E",
      avatarUrl: avatar,
      isActive: true,
      createdAt: "2024-05-18T14:00:00Z",
      deletedAt: null,
    },
    star: 5,
    feedback: "Tuyệt vời! Sẽ mua lại lần sau.",
    images: [iphone17promax, iphone17promax],
    createdAt: "2024-06-20T11:30:00Z",
  },
];

var moreProducts = [
  {
    id: "prod_002",
    title: "iPhone 17 Pro",
    avatar: iphone17promax,
    images: [iphone17promax, iphone17promax, iphone17promax],
    sold: 200000,
    minPrice: 36000000,
    discount: 0,
    installment: 24,
    brand: "iPhone",
    ram: "16GB",
    rom: "256GB",
    screenSize: 6.3,
    displayTech: "Oled",
    rearCamera: "Rear Camera",
    frontCamera: "Front Camera",
    chipset: "Chipset",
    nfc: "NFC Tech",
    sim: "2 Sim",
    os: "iOS",
    screenResolution: "2868 x 1320 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "ip_001",
      name: "iPhone",
      parentCategory: {
        id: "1",
        name: "Điện thoại",
        parentID: null,
      },
    },
    variants: [
      {
        id: "var_001",
        colors: ["Đen Titan", "Trắng Titan", "Sa Mạc"],
        images: [iphone17promax, iphone17promax, iphone17promax],
        storage: "256GB",
        price: 36000000,
        stockQuantity: 100,
        sku: "IPH17P-256GB",
      },
      {
        id: "var_002",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "512GB",
        price: 46000000,
        stockQuantity: 80,
        sku: "IPH17P-512GB",
      },
      {
        id: "var_003",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "1TB",
        price: 56000000,
        stockQuantity: 17,
        sku: "IPH17P-1TB",
      },
      {
        id: "var_004",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "2TB",
        price: 66000000,
        stockQuantity: 0,
        sku: "IPH17P-2TB",
      },
    ],
  },
  {
    id: "prod_003",
    title: "iPhone 17 Pro Max",
    avatar: iphone17promax,
    images: [iphone17promax, iphone17promax, iphone17promax],
    sold: 200000,
    minPrice: 36000000,
    discount: 5,
    installment: 24,
    brand: "iPhone",
    ram: "16GB",
    rom: "256GB",
    screenSize: 6.9,
    displayTech: "Oled",
    rearCamera: "Rear Camera",
    frontCamera: "Front Camera",
    chipset: "Chipset",
    nfc: "NFC Tech",
    sim: "2 Sim",
    os: "iOS",
    screenResolution: "2868 x 1320 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "ip_001",
      name: "iPhone",
      parentCategory: {
        id: "1",
        name: "Điện thoại",
        parentID: null,
      },
    },
    variants: [
      {
        id: "var_001",
        colors: ["Đen Titan", "Trắng Titan", "Sa Mạc"],
        images: [iphone17promax, iphone17promax, iphone17promax],
        storage: "256GB",
        price: 36000000,
        stockQuantity: 100,
        sku: "IPH17PM-256GB",
      },
      {
        id: "var_002",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "512GB",
        price: 46000000,
        stockQuantity: 80,
        sku: "IPH17PM-512GB",
      },
      {
        id: "var_003",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "1TB",
        price: 56000000,
        stockQuantity: 17,
        sku: "IPH17PM-1TB",
      },
      {
        id: "var_004",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "2TB",
        price: 66000000,
        stockQuantity: 0,
        sku: "IPH17PM-2TB",
      },
    ],
  },
  {
    id: "prod_004",
    title: "iPhone 17 Pro Max",
    avatar: iphone17promax,
    images: [iphone17promax, iphone17promax, iphone17promax],
    sold: 200000,
    minPrice: 36000000,
    discount: 10,
    installment: 12,
    brand: "iPhone",
    ram: "16GB",
    rom: "256GB",
    screenSize: 6.9,
    displayTech: "Oled",
    rearCamera: "Rear Camera",
    frontCamera: "Front Camera",
    chipset: "Chipset",
    nfc: "NFC Tech",
    sim: "2 Sim",
    os: "iOS",
    screenResolution: "2868 x 1320 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "ip_001",
      name: "iPhone",
      parentCategory: {
        id: "1",
        name: "Điện thoại",
        parentID: null,
      },
    },
    variants: [
      {
        id: "var_001",
        colors: ["Đen Titan", "Trắng Titan", "Sa Mạc"],
        images: [iphone17promax, iphone17promax, iphone17promax],
        storage: "256GB",
        price: 36000000,
        stockQuantity: 100,
        sku: "IPH17PM-256GB",
      },
      {
        id: "var_002",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "512GB",
        price: 46000000,
        stockQuantity: 80,
        sku: "IPH17PM-512GB",
      },
      {
        id: "var_003",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "1TB",
        price: 56000000,
        stockQuantity: 17,
        sku: "IPH17PM-1TB",
      },
      {
        id: "var_004",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "2TB",
        price: 66000000,
        stockQuantity: 0,
        sku: "IPH17PM-2TB",
      },
    ],
  },
  {
    id: "prod_005",
    title: "iPhone 17 Pro Max",
    avatar: iphone17promax,
    images: [iphone17promax, iphone17promax, iphone17promax],
    sold: 200000,
    minPrice: 36000000,
    discount: 0,
    installment: 6,
    brand: "iPhone",
    ram: "16GB",
    rom: "256GB",
    screenSize: 6.9,
    displayTech: "Oled",
    rearCamera: "Rear Camera",
    frontCamera: "Front Camera",
    chipset: "Chipset",
    nfc: "NFC Tech",
    sim: "2 Sim",
    os: "iOS",
    screenResolution: "2868 x 1320 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "ip_001",
      name: "iPhone",
      parentCategory: {
        id: "1",
        name: "Điện thoại",
        parentID: null,
      },
    },
    variants: [
      {
        id: "var_001",
        colors: ["Đen Titan", "Trắng Titan", "Sa Mạc"],
        images: [iphone17promax, iphone17promax, iphone17promax],
        storage: "256GB",
        price: 36000000,
        stockQuantity: 100,
        sku: "IPH17PM-256GB",
      },
      {
        id: "var_002",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "512GB",
        price: 46000000,
        stockQuantity: 80,
        sku: "IPH17PM-512GB",
      },
      {
        id: "var_003",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "1TB",
        price: 56000000,
        stockQuantity: 17,
        sku: "IPH17PM-1TB",
      },
      {
        id: "var_004",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "2TB",
        price: 66000000,
        stockQuantity: 0,
        sku: "IPH17PM-2TB",
      },
    ],
  },
  {
    id: "prod_006",
    title: "iPhone 17 Pro Max",
    avatar: iphone17promax,
    images: [iphone17promax, iphone17promax, iphone17promax],
    sold: 200000,
    minPrice: 36000000,
    discount: 15,
    installment: 24,
    brand: "iPhone",
    ram: "16GB",
    rom: "256GB",
    screenSize: 6.9,
    displayTech: "Oled",
    rearCamera: "Rear Camera",
    frontCamera: "Front Camera",
    chipset: "Chipset",
    nfc: "NFC Tech",
    sim: "2 Sim",
    os: "iOS",
    screenResolution: "2868 x 1320 pixels",
    cpu: "CPU 6 lõi với 2 lõi hiệu năng và 4 lõi tiết kiệm điện",
    category: {
      id: "ip_001",
      name: "iPhone",
      parentCategory: {
        id: "1",
        name: "Điện thoại",
        parentID: null,
      },
    },
    variants: [
      {
        id: "var_001",
        colors: ["Đen Titan", "Trắng Titan", "Sa Mạc"],
        images: [iphone17promax, iphone17promax, iphone17promax],
        storage: "256GB",
        price: 36000000,
        stockQuantity: 100,
        sku: "IPH17PM-256GB",
      },
      {
        id: "var_002",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "512GB",
        price: 46000000,
        stockQuantity: 80,
        sku: "IPH17PM-512GB",
      },
      {
        id: "var_003",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "1TB",
        price: 56000000,
        stockQuantity: 17,
        sku: "IPH17PM-1TB",
      },
      {
        id: "var_004",
        colors: ["Đen Titan", "Trắng Titan"],
        images: [iphone17promax, iphone17promax],
        storage: "2TB",
        price: 66000000,
        stockQuantity: 0,
        sku: "IPH17PM-2TB",
      },
    ],
  },
];

function ProductDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loading, error } = useSelector((state) => state.cart);
  const { id } = useParams();

  // const { type, id } = useParams();
  const timerRef = useRef(null);
  // const moreProductsRowRef = useRef(null);
  // const { type, id } = useParams();
  const itemsPerPage = 3;

  // State
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [currentColor, setCurrentColor] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [feedBack, setFeedBack] = useState("all");
  const [currentFeedBack, setCurrentFeedBack] = useState(feedbacks);
  const [currentPage, setCurrentPage] = useState(0);

  // Functions
  const startTimer = () => {
    timerRef.currentSlide = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
  };
  const starRating = () => {
    const total = feedbacks.reduce((total, fb) => {
      return total + fb.star;
    }, 0);
    return (total / feedbacks.length).toFixed(1);
  };
  const amountOfStar = (star) => {
    var amount = 0;
    feedbacks.forEach((fb) => {
      if (star == fb.star) amount++;
    });
    return amount;
  };
  const setFeedBackByStar = (feedbacks, star) => {
    return feedbacks.filter((feed) => feed.star === star);
  };

  const goTo = (index) => {
    setCurrentSlide(index);
    clearInterval(timerRef.currentSlide);
    startTimer();
  };
  // Hàm phân trang
  const paginatedFeedBack = currentFeedBack.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const prev = () => goTo((currentSlide - 1 + images.length) % images.length);
  const next = () => goTo((currentSlide + 1) % images.length);

  // Add to cart Function
  const handleAddToCart = async () => {
    if (!currentVersion || !currentColor.color) {
      showToast({ title: "Vui lòng chọn phiên bản và màu sắc trước khi thêm vào giỏ hàng", type: "warning" });
      return;
    }
    const result = await dispatch(
      addToCart({
        product: product._id,
        variant: currentVersion._id,
        color: currentColor.color,
        currentPrice: currentColor.price,
        quantity: quantity,
      })
    );
    if (addToCart.fulfilled.match(result)) {
      showToast({ title: "Đã thêm vào giỏ hàng", type: "success" });
    } else if (addToCart.rejected.match(result)) {
      showToast({ title: result.payload?.message || "Thêm vào giỏ hàng thất bại", type: "error" });
    }
  };

  const handleBuyNow = () => {
    if (!currentVersion || !currentColor.color) {
      showToast({ title: "Vui lòng chọn phiên bản và màu sắc trước khi mua ngay", type: "warning" });
      return;
    }

    const checkoutItem = {
      product: product._id,
      variant: currentVersion._id,
      color: currentColor.color,
      title: product.title,
      quantity,
      currentPrice: currentColor.price,
      weight: product.weight || 500,
      height: product.height || 20,
      length: product.length || 15,
      width: product.width || 20,
    };

    navigate("/checkout", { state: { checkoutItems: [checkoutItem] } });
  };

  // useEffect
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [{ data: productData }, { data: variantData }] = await axios.all([
          axios.get(`${api.product}/${id}`),
          axios.get(`${api.variant}/product/${id}`),
        ]);

        setProduct(productData);
        setVariants(variantData);
        setCurrentVersion(variantData[0]);
        setImages(productData.images);
      } catch (e) {
        console.log(e);
      }
    };
    fetchProduct();
  }, []);

  // useEffect - Slider
  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.currentSlide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!product || !currentVersion) return Loading();
  return (
    <div className={cx("wrapper")}>
      {/* Breadcrumb */}
      <div className={cx("breadcrumb")}>
        <nav className="d-flex flex-direction-row align-items-center gap-1 text-sm text-gray-500">
          <Link to="/">Trang chủ</Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <Link to="/product">Sản phẩm</Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <Link to={`/product/${product.category.parentCategory._id}`}>
            {product.category.parentCategory.name}
          </Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <span>{product.title}</span>
        </nav>
      </div>
      {/* Image + Info */}
      <div className={cx("container")}>
        <div className={cx("section-1")}>
          <div className={cx("image")}>
            {/* Slide track */}
            <div
              className={cx("slide")}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {images.map((img, index) => (
                <img src={img} key={index} alt={`slide-${index}`} />
              ))}
            </div>

            {/* Nút prev/next */}
            <button className={cx("prev")} onClick={prev}>
              ‹
            </button>
            <button className={cx("next")} onClick={next}>
              ›
            </button>

            {/* Dots */}
            <div className={cx("dots")}>
              {images.map((_, index) => (
                <span
                  key={index}
                  className={cx({ active: index === currentSlide })}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          </div>
          <div className={cx("small-images")}>
            {images.map((img, index) => (
              <img
                src={img}
                key={index}
                alt={`thumb-${index}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </div>
        <div className={cx("section-2")}>
          <Title
            title={`${product.title} | Chính hãng`}
            className={cx("title")}
          />
          <div className={cx("d-flex")}>
            <span>
              {starRating()}{" "}
              <FontAwesomeIcon icon={faStar} className={cx("star")} />
            </span>
            <span> | {feedbacks.length} Đánh giá</span>
            <span> | Lượt bán: {converseKilo(product.sold)}</span>
          </div>
          {/* Version */}
          <div className={cx("version")}>
            <Title title="Phiên bản" className={cx("sub-title")} />
            <div className={cx("version-grid")}>
              {variants.map((ver, index) => (
                <Button
                  key={index}
                  className={cx("color-btn", {
                    active: currentVersion.storage === ver.storage,
                  })}
                  disabled={ver.stockQuantity === 0}
                  outline
                  size="large"
                  onClick={() => {
                    setCurrentVersion(ver);
                    setCurrentColor({});
                    setShowModal(false);
                  }}
                >
                  {ver.storage}
                </Button>
              ))}
            </div>
            <Title title="Màu" className={cx("sub-title")} />
            <div className={cx("version-color")}>
              {currentVersion.colors.map((color, index) => (
                <button
                  key={index}
                  className={cx("color-btn", {
                    active: currentColor.color === color,
                  })}
                  onClick={() => {
                    setShowModal(true);
                    setCurrentColor({
                      image: currentVersion.images[index],
                      color: color,
                      price: currentVersion.price,
                    });
                  }}
                >
                  <img
                    src={currentVersion.images[index]}
                    className={cx("image")}
                  />
                  <div className={cx("col")}>
                    <span>{color}</span>
                    <span>{converseVND(currentVersion.price)}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className={cx("quantity")}>
              <Title title="Số lượng" className={cx("sub-title")} />
              <button
                className={cx("decrease")}
                onClick={() => (quantity > 0 ? setQuantity(quantity - 1) : 0)}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <input type="text" disabled value={quantity}></input>
              <button
                className={cx("increase")}
                onClick={() => setQuantity(quantity + 1)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className={cx("product-detail")}>
        <Title className={cx("title")} title="Chi tiết sản phẩm" />
        <div className={cx("table")}>
          <table className="table caption-top">
            <tbody>
              <tr>
                <th scope="row">Danh mục</th>
                <td>
                  <nav className="d-flex flex-direction-row align-items-center gap-1 text-sm text-gray-500">
                    <Tippy content="Về trang chủ" placement="bottom">
                      <Link to="/">Trang chủ</Link>
                    </Tippy>
                    <FontAwesomeIcon
                      className={cx("icon")}
                      icon={faAngleRight}
                    />
                    <Tippy content="Trang sản phẩm" placement="bottom">
                      <Link
                        to={`/products/${product.category.parentCategory._id}`}
                      >
                        Sản phẩm
                      </Link>
                    </Tippy>
                    <FontAwesomeIcon
                      className={cx("icon")}
                      icon={faAngleRight}
                    />
                    <Tippy content="Điện thoại" placement="bottom">
                      <Link
                        to={`/products/${product.category.parentCategory._id}`}
                      >
                        {product.category.parentCategory.name}
                      </Link>
                    </Tippy>
                    <FontAwesomeIcon
                      className={cx("icon")}
                      icon={faAngleRight}
                    />
                    <span>{product.title}</span>
                  </nav>
                </td>
              </tr>
              <tr>
                <th scope="row">Số sản phẩm còn lại</th>
                <td>Còn hàng</td>
              </tr>
              <tr>
                <th scope="row">Thương hiệu</th>
                <td>{product.brand}</td>
              </tr>
              <tr>
                <th scope="row">Gửi từ</th>
                <td>Ninh Kiều, Cần Thơ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={cx("specifications")}>
        <div className={cx("container")}>
          <div className={cx("table")}>
            <Title className={cx("title")} title="Thông số kỹ thuật" />
            <table>
              <tbody>
                <tr>
                  <th scope="row">Kích thước màn hình</th>
                  <td>{product.screenSize} inches</td>
                </tr>
                <tr>
                  <th scope="row">Công nghệ màn hình</th>
                  <td>{product.displayTech}</td>
                </tr>
                <tr>
                  <th scope="row">Cam trước</th>
                  <td>{product.frontCamera}</td>
                </tr>
                <tr>
                  <th scope="row">Cam sau</th>
                  <td>{product.rearCamera}</td>
                </tr>
                <tr>
                  <th scope="row">Chipset</th>
                  <td>{product.chipset}</td>
                </tr>
                <tr>
                  <th scope="row">Công nghệ NFC</th>
                  <td>{product.nfc}</td>
                </tr>
                <tr>
                  <th scope="row">Ram</th>
                  <td>{product.ram}</td>
                </tr>
                <tr>
                  <th scope="row">Bộ nhớ trong</th>
                  <td>{product.storage}</td>
                </tr>
                <tr>
                  <th scope="row">Sim</th>
                  <td>{product.sim}</td>
                </tr>
                <tr>
                  <th scope="row">Hệ điều hành</th>
                  <td>{product.os}</td>
                </tr>
                <tr>
                  <th scope="row">Độ phân giải</th>
                  <td>{product.screenResolution}</td>
                </tr>
                <tr>
                  <th scope="row">CPU</th>
                  <td>{product.cpu}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Discount + installment */}
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
      {/* Product Specifications */}

      {/* Feedbacks */}
      <div className={cx("feedback")}>
        <Title title="Đánh giá sản phẩm" className={cx("title")} />
        <div className={cx("star-fb")}>
          <div className={cx("container")}>
            <h1>
              {starRating()}
              <span>/5</span>
            </h1>
            <h2>
              {Array.from({ length: 5 }, (_, i) => (
                <FontAwesomeIcon key={i} icon={faStar} />
              ))}
            </h2>
          </div>
          <div className={cx("container")}>
            <Button
              onClick={() => {
                setCurrentFeedBack(feedbacks);
                setFeedBack("all");
                setCurrentPage(0);
              }}
              outline
              size="medium"
              className={cx("btn-feedback", { active: feedBack === "all" })}
            >
              Tất cả ({feedbacks.length})
            </Button>
            <Button
              onClick={() => {
                setCurrentFeedBack(setFeedBackByStar(feedbacks, 5));
                setFeedBack("5");
                setCurrentPage(0);
              }}
              outline
              size="medium"
              className={cx("btn-feedback", { active: feedBack === "5" })}
            >
              5 sao ({amountOfStar(5)})
            </Button>
            <Button
              onClick={() => {
                setCurrentFeedBack(setFeedBackByStar(feedbacks, 4));
                setFeedBack("4");
                setCurrentPage(0);
              }}
              outline
              size="medium"
              className={cx("btn-feedback", { active: feedBack === "4" })}
            >
              4 sao ({amountOfStar(4)})
            </Button>
            <Button
              onClick={() => {
                setCurrentFeedBack(setFeedBackByStar(feedbacks, 3));
                setFeedBack("3");
                setCurrentPage(0);
              }}
              outline
              size="medium"
              className={cx("btn-feedback", { active: feedBack === "3" })}
            >
              3 sao ({amountOfStar(3)})
            </Button>
            <Button
              onClick={() => {
                setCurrentFeedBack(setFeedBackByStar(feedbacks, 2));
                setFeedBack("2");
                setCurrentPage(0);
              }}
              outline
              size="medium"
              className={cx("btn-feedback", { active: feedBack === "2" })}
            >
              2 sao ({amountOfStar(2)})
            </Button>
            <Button
              onClick={() => {
                setCurrentFeedBack(setFeedBackByStar(feedbacks, 1));
                setFeedBack("1");
                setCurrentPage(0);
              }}
              outline
              size="medium"
              className={cx("btn-feedback", { active: feedBack === "1" })}
            >
              1 sao ({amountOfStar(1)})
            </Button>
          </div>
        </div>
        <div className={cx("feedback-column")}>
          {paginatedFeedBack.length > 0 ? (
            paginatedFeedBack.map((feed) => (
              <div key={feed.id} className={cx("row")}>
                <div className={cx("col-1")}>
                  <img src={feed.user.avatarUrl} />
                </div>
                <div className={cx("col-11")}>
                  <span className={cx("name")}>{feed.user.fullname}</span>
                  <span className={cx("star")}>
                    {Array.from({ length: feed.star }, (_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} />
                    ))}
                  </span>
                  <span className={cx("date")}>
                    {formatDateHour(feed.createdAt)}
                  </span>
                  <span className={cx("feedback-text")}>{feed.feedback}</span>
                  <div className={cx("images")}>
                    {feed.images.map((img, index) => (
                      <img key={index} src={img} />
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h2>Không có bài đánh giá {feedBack} sao</h2>
          )}

          {/* Phan trang */}
          <div className={cx("pagination")}>
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ‹
            </button>

            {Array.from(
              { length: Math.ceil(currentFeedBack.length / itemsPerPage) },
              (_, i) => (
                <button
                  key={i}
                  className={cx({ active: i === currentPage })}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </button>
              )
            )}

            <button
              disabled={
                currentPage ===
                Math.ceil(currentFeedBack.length / itemsPerPage) - 1
              }
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* More products */}
      <div className={cx("more-products")}>
        <div className={cx("products-grid")}>
          {moreProducts.map((product, index) => (
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
          <Link
            to={`/products/${product.category.parentCategory._id}`}
            className={cx("more-btn")}
          >
            Xem thêm
          </Link>
        </div>
      </div>

      {/* Modal */}
      <div className={cx("modal", { show: showModal })}>
        <div className={cx("container")}>
          <img src={currentColor.image || product.avatar} />
          <Title
            className={cx("modal-title")}
            title={`${product.title} | Chính hãng ${currentVersion.storage}-${
              currentColor.color || "Chưa chọn màu"
            }`}
          />
          <span>(x{quantity})</span>
          <div className={cx("modal-price")}>
            {currentColor.price && (
              <>
                <span className={cx("sale-price")}>
                  {currentColor.price
                    ? converseVND(
                        currentColor.price *
                          quantity *
                          (1 - product.discount / 100)
                      )
                    : "Chưa chọn màu"}
                </span>
                <span className={cx("origin-price")}>
                  {product.discount > 0 && (
                    <h4>{converseVND(currentColor.price * quantity)}</h4>
                  )}
                </span>
              </>
            )}
          </div>
          <div className={cx("actions")}>
            <Button secondary size="medium" className={cx("buy-btn")} onClick={handleBuyNow}>
              Mua ngay
            </Button>
            <button className={cx("cart-btn")} onClick={handleAddToCart} disabled={loading}>
              <FontAwesomeIcon icon={faCartPlus} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductDetail;
