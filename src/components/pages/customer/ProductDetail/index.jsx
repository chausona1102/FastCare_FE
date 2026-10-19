import style from "./ProductDetail.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);
import Title from "~/components/Title";
import Button from "~/components/Button";
import Cart from "~/components/Cart";
import Loading from "~/components/Loading";
import { converseVND, converseKilo } from "~/utils/functions.jsx";

import api from "~/api";
import axios from "axios";
import axiosClient from "~/api/axiosClient";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faCartPlus,
  faHeart,
  faMinus,
  faPlus,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";

import Tippy from "@tippyjs/react";

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "~/store/slices/cartSlice.jsx";
import { useToast } from "~/contexts/ToastContext.jsx";
import Feedback from "./feedback";
import Specifications from "./specifications";

var moreProducts = [

];

function ProductDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { loading, error } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();

  const timerRef = useRef(null);

  // State
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [currentColor, setCurrentColor] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedBack, setFeedBack] = useState("all");
  const [currentFeedBack, setCurrentFeedBack] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [favoriteState, setFavoriteState] = useState(null);
  const [favoriteSubmitting, setFavoriteSubmitting] = useState(false);
  const favoriteStateMatchesProduct = favoriteState?.productId === id
    && favoriteState?.token === token;
  const isFavorite = Boolean(token && favoriteStateMatchesProduct && favoriteState.isFavorite);
  const favoriteLoading = Boolean(token) && !favoriteStateMatchesProduct;

  // Functions
  const startTimer = () => {
    if (!images.length) return;

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
  };
  const starRating = () => {
    if (!feedbacks.length) return "0.0";
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

  useEffect(() => {
    let isCurrentRequest = true;

    if (!token) {
      return () => {
        isCurrentRequest = false;
      };
    }

    axiosClient
      .get(`${api.favorite}/user`)
      .then(({ data }) => {
        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu yêu thích không hợp lệ.");
        }
        const productIsFavorite = data.some((favorite) => {
          const favoriteProduct = favorite.product?._id || favorite.product?.id || favorite.product;
          return String(favoriteProduct) === String(id);
        });
        if (isCurrentRequest) {
          setFavoriteState({ productId: id, token, isFavorite: productIsFavorite });
        }
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setFavoriteState({ productId: id, token, isFavorite: false });
          showToast({
            title: requestError.response?.data?.message || "Không thể tải trạng thái yêu thích.",
            type: "error",
          });
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id, showToast, token]);

  const handleToggleFavorite = async () => {
    if (!token) {
      showToast({ title: "Vui lòng đăng nhập để thêm sản phẩm vào yêu thích.", type: "warning" });
      navigate("/login");
      return;
    }

    setFavoriteSubmitting(true);
    try {
      if (isFavorite) {
        await axiosClient.delete(api.favorite, { data: { product: product._id } });
      } else {
        await axiosClient.post(api.favorite, { product: product._id });
      }
      setFavoriteState({ productId: id, token, isFavorite: !isFavorite });
      showToast({
        title: isFavorite ? "Đã xóa khỏi danh sách yêu thích." : "Đã thêm vào danh sách yêu thích.",
        type: "success",
      });
    } catch (requestError) {
      showToast({
        title: requestError.response?.data?.message || "Không thể cập nhật danh sách yêu thích.",
        type: "error",
      });
    } finally {
      setFavoriteSubmitting(false);
    }
  };

  const goTo = (index) => {
    if (!images.length) return;

    setCurrentSlide((index + images.length) % images.length);
    clearInterval(timerRef.current);
    startTimer();
  };
  const prev = () => {
    if (!images.length) return;
    goTo(currentSlide - 1);
  };
  const next = () => {
    if (!images.length) return;
    goTo(currentSlide + 1);
  };

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

  // useEffect - Fetch Product
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
  }, [id]);

  // useEffect - Slider
  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [images.length]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const { data: feedbackData } = await axios.get(`${api.feedback}/${id}`
        );
        setFeedbacks(feedbackData);
        setCurrentFeedBack(feedbackData);
      } catch (e) {
        console.log(e);
      }
    }
    fetchFeedbacks();
  }, [id]);


  if (!product || !currentVersion) return Loading();
  return (
    <div className={cx("wrapper")}>
      {/* Breadcrumb */}
      <div className={cx("breadcrumb")}>
        <nav className="d-flex flex-direction-row align-items-center gap-1 text-sm text-gray-500">
          <Link to="/">Trang chủ</Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <Link to="/products">Sản phẩm</Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <Link to={`/products/${product.category.parentCategory.slug}`}>
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
          <button
            type="button"
            className={cx("favorite-button", { active: isFavorite })}
            onClick={handleToggleFavorite}
            disabled={favoriteLoading || favoriteSubmitting}
            aria-pressed={isFavorite}
          >
            <FontAwesomeIcon icon={isFavorite ? faHeart : faHeartOutline} />
            {isFavorite ? "Đã thêm vào yêu thích" : "Thêm vào yêu thích"}
          </button>
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

      <Specifications
        product={product}
        handleBuyNow={handleBuyNow}
        handleAddToCart={handleAddToCart}
      />

      <Feedback
        feedbacks={feedbacks}
        currentFeedBack={currentFeedBack}
        setCurrentFeedBack={setCurrentFeedBack}
        feedBack={feedBack}
        setFeedBack={setFeedBack}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        starRating={starRating}
        amountOfStar={amountOfStar}
        setFeedBackByStar={setFeedBackByStar}
      />

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
              screenSize={
                product.specifications?.[product.productType]?.screenSize ||
                product.screenSize
              }
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
