import style from "./Products.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

import api from "~/api";
import axios from "axios";
import Cart from "~/components/Cart";
import { formatSlugToName } from "~/utils/functions";
import Loading from "~/components/Loading";
import Button from "~/components/Button";
import Title from "~/components/Title";
import { iphone17promax } from "~/assets/images";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";


function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const { slug, brand } = useParams();


  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [{ data: categoriesData }, { data: productsData }] = await axios.all([
          axios.get(`${api.category}/brands/slug/${slug}/10`),
          axios.get(`${api.productBySlug}/${slug}/50`),
        ]);
        setCategories(categoriesData);
        setAllProducts(productsData);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug]);
  return loading ? Loading() : (
    <div className={cx("wrapper")}>
      {/* Breadcrumb */}
      <div className={cx("breadcrumb")}>
        <nav className="d-flex flex-direction-row align-items-center gap-1 text-sm text-gray-500">
          <Link to="/">Trang chủ</Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <Link to="/products">Sản phẩm</Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <span>{formatSlugToName(slug)}</span>
        </nav>
      </div>
      <div className={cx("container")}>
        {/* <Title title={allProducts[0].category.parentCategory.name} /> */}
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
