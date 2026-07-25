import styles from "./Home.module.scss";
import classNames from "classnames/bind";
import Cart from "~/components/Cart";
import SecondCart from "~/components/SecondCart";
import Loading from "~/components/Loading";
import axios from "axios";
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
import Button from "../../../Button";
import Tippy from "@tippyjs/react";
import api from "~/api";

const cx = classNames.bind(styles);

function Home() {
  const [phones, setPhones] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [hotProducts, setHotProduct] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("phone");
  const [loading, setLoading] = useState(true);
  const verticalGridRef = useRef(null);
  const accessoriesRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [
          { data: phoneData },
          { data: laptopData },
          { data: accessoriesData },
        ] = await axios.all([
          axios.get(`${api.productBySlug}/dien-thoai`),
          axios.get(`${api.productBySlug}/laptop`),
          axios.get(`${api.productBySlug}/phu-kien`),
        ]);

        setPhones(phoneData);
        setLaptops(laptopData);
        setAccessories(accessoriesData);
      } catch (e) {
        console.log(e);
      }
    };
    const fetchHotProduct = async () => {
      try {
        const {data: hotProductData} = await axios.get(`${api.product}/hot/${4}`);
        setHotProduct(hotProductData);
      } catch(e) {
        console.log(e);
      }
    }
    setLoading(true);
    fetchHotProduct();
    fetchProducts();
    setLoading(false);
  }, []);

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

  return loading ? Loading() : (
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
            {/* <Title title="Siêu sale" className={cx("section-title")} /> */}
            <div className={cx("products-grid")}>
              {hotProducts.map((product, index) => (
                <SecondCart
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
                phones.map((product) => (
                  <Cart
                    key={product._id}
                    id={product._id}
                    title={product.title}
                    minPrice={product.minPrice}
                    avatar={product.avatar}
                    sold={product.sold}
                    discount={product.discount}
                    installment={product.installment}
                    screenSize={product.screenSize}
                    rom={product.storage}
                    to={`/product-detail/${product._id}`}
                  />
                ))}
              {selectedCategory === "laptop" &&
                laptops.map((product) => (
                  <Cart
                    key={product._id}
                    id={product._id}
                    title={product.title}
                    minPrice={product.minPrice}
                    avatar={product.avatar}
                    sold={product.sold}
                    discount={product.discount}
                    installment={product.installment}
                    screenSize={product.screenSize}
                    rom={product.storage}
                    to={`/product-detail/${product._id}`}
                  />
                ))}
            </div>
            <Link
              className={cx("more-btn")}
              to={`/products/${
                selectedCategory == "phone" ? "dien-thoai" : "laptop"
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
        {accessories.length > 0 ? (
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
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default Home;
