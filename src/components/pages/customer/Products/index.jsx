import style from "./Products.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

import api from "~/api";
import axios from "axios";
import Cart from "~/components/Cart";
import { formatSlugToName } from "~/utils/functions";
import { LoadingProducts } from "~/components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faFilter,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useState, useEffect } from "react";

const INITIAL_PRODUCTS_COUNT = 20;
const LOAD_MORE_COUNT = 10;
const PRICE_RANGES = [
  { label: "Tất cả mức giá", slug: "all", min: 0, max: Infinity },
  { label: "Dưới 1 triệu", slug: "below-1m", min: 0, max: 1000000 },
  { label: "1 triệu - 3 triệu", slug: "1m-3m", min: 1000000, max: 3000000 },
  { label: "3 triệu - 5 triệu", slug: "3m-5m", min: 3000000, max: 5000000 },
  { label: "5 triệu - 10 triệu", slug: "5m-10m", min: 5000000, max: 10000000 },
  { label: "Trên 10 triệu", slug: "above-10m", min: 10000000, max: Infinity },
];

function Products() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [filterState, setFilterState] = useState({
    searchKeyword: "",
    brand: "",
    price: 0,
  });
  const [visibleCountState, setVisibleCountState] = useState({
    key: "",
    count: INITIAL_PRODUCTS_COUNT,
  });
  const { slug, id: categoryId, range: priceSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = (searchParams.get("search") || "").trim();
  const selectedBrand =
    filterState.searchKeyword === searchKeyword ? filterState.brand : "";
  const selectedPrice =
    filterState.searchKeyword === searchKeyword ? filterState.price : 0;
  const selectedCategoryId = searchParams.get("brand") || "";
  const resolvedSlug = slug || "all";
  const priceSlugIndex = PRICE_RANGES.findIndex(
    (range) => range.slug === priceSlug,
  );
  const activePriceIndex = priceSlug
    ? Math.max(priceSlugIndex, 0)
    : selectedPrice;
  const visibilityKey = JSON.stringify([
    resolvedSlug,
    categoryId,
    searchKeyword,
    selectedCategoryId,
    selectedBrand,
    activePriceIndex,
  ]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        setCategoryName("");
        if (searchKeyword) {
          const { data: productsData } = await axios.get(api.productSearch, {
            params: { keyword: searchKeyword, limit: 50 },
          });
          setCategories([]);
          setAllProducts(productsData || []);
          return;
        }

        if (categoryId) {
          const [
            { data: categoryData },
            { data: categoriesData },
            { data: productsData },
          ] = await axios.all([
            axios.get(`${api.parentCategory}/${categoryId}`),
            axios.get(`${api.category}/brands/${categoryId}`),
            axios.get(`${api.product}/limit/50`),
          ]);
          const categoryIds = new Set(
            (categoriesData || []).map((category) =>
              String(category._id || category.id || category.categoryId),
            ),
          );
          setCategoryName(categoryData.name || "Danh mục");
          setCategories(categoriesData || []);
          setAllProducts(
            (productsData || []).filter((product) => {
              const productCategoryId =
                typeof product.category === "object"
                  ? product.category?._id || product.category?.id
                  : product.category;
              return categoryIds.has(String(productCategoryId));
            }),
          );
          return;
        }

        if (resolvedSlug === "all") {
          const { data: productsData } = await axios.get(
            `${api.product}/limit/50`,
          );
          setCategories([]);
          setAllProducts(productsData || []);
          return;
        }

        const [{ data: categoriesData }, { data: productsData }] =
          await axios.all([
            axios.get(`${api.category}/brands/slug/${resolvedSlug}/10`),
            axios.get(`${api.productBySlug}/${resolvedSlug}/50`),
          ]);
        setCategories(categoriesData);
        setAllProducts(productsData || []);
      } catch (e) {
        console.log(e);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [resolvedSlug, searchKeyword, categoryId]);

  const brands = [...new Set(allProducts.map((product) => product.brand))]
    .filter(Boolean)
    .sort((firstBrand, secondBrand) => firstBrand.localeCompare(secondBrand));
  const priceRange = PRICE_RANGES[activePriceIndex];
  const filteredProducts = allProducts.filter((product) => {
    const price = Number(product.minPrice) || 0;
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;
    const productCategoryId =
      typeof product.category === "object"
        ? product.category?._id || product.category?.id
        : product.category;
    const matchesCategory =
      !selectedCategoryId || String(productCategoryId) === selectedCategoryId;
    const matchesPrice =
      price >= priceRange.min &&
      (priceRange.max === Infinity || price < priceRange.max);

    return matchesBrand && matchesCategory && matchesPrice;
  });

  const visibleCount =
    visibleCountState.key === visibilityKey
      ? visibleCountState.count
      : INITIAL_PRODUCTS_COUNT;
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const resetFilters = () => {
    setFilterState({ searchKeyword, brand: "", price: 0 });
    if (priceSlug) navigate("/products");
    if (selectedCategoryId) {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete("brand");
      setSearchParams(nextSearchParams, { replace: true });
    }
  };

  return loading ? (
    LoadingProducts()
  ) : (
    <div className={cx("wrapper")}>
      <div className={cx("breadcrumb")}>
        <nav className="d-flex flex-direction-row align-items-center gap-1 text-sm text-gray-500">
          <Link to="/">Trang chủ</Link>
          <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
          <Link to="/products">Sản phẩm</Link>
          {(categoryId || resolvedSlug !== "all") && (
            <>
              <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
              <span>{categoryName || formatSlugToName(resolvedSlug)}</span>
            </>
          )}
          {priceSlug && (
            <>
              <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
              <span>{PRICE_RANGES[Math.max(priceSlugIndex, 0)].label}</span>
            </>
          )}
          {searchKeyword && (
            <>
              <FontAwesomeIcon className={cx("icon")} icon={faAngleRight} />
              <span>Tìm kiếm: {searchKeyword}</span>
            </>
          )}
        </nav>
      </div>
      <div className={cx("container")}>
        {categoryId && <h1 className={cx("page-title")}>{categoryName}</h1>}
        {priceSlug && (
          <h1 className={cx("page-title")}>
            Sản phẩm: {PRICE_RANGES[Math.max(priceSlugIndex, 0)].label}
          </h1>
        )}
        <div className={cx("filter-bar")}>
          <div className={cx("filter-heading")}>
            <FontAwesomeIcon icon={faFilter} />
            <span>Bộ lọc sản phẩm</span>
          </div>
          {categories.length > 0 && (
            <select
              aria-label="Lọc theo danh mục con"
              value={selectedCategoryId}
              onChange={(event) => {
                const nextSearchParams = new URLSearchParams(searchParams);
                if (event.target.value) {
                  nextSearchParams.set("brand", event.target.value);
                } else {
                  nextSearchParams.delete("brand");
                }
                setSearchParams(nextSearchParams, { replace: true });
              }}
            >
              <option value="">Tất cả danh mục con</option>
              {categories.map((category) => {
                const categoryKey =
                  category._id || category.id || category.categoryId;
                return (
                  <option key={categoryKey} value={categoryKey}>
                    {category.name}
                  </option>
                );
              })}
            </select>
          )}
          <select
            aria-label="Lọc theo thương hiệu"
            value={selectedBrand}
            onChange={(event) =>
              setFilterState((current) => ({
                searchKeyword,
                brand: event.target.value,
                price:
                  current.searchKeyword === searchKeyword ? current.price : 0,
              }))
            }
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brandName) => (
              <option key={brandName} value={brandName}>
                {brandName}
              </option>
            ))}
          </select>
          <select
            aria-label="Lọc theo giá"
            value={activePriceIndex}
            onChange={(event) => {
              const nextPriceIndex = Number(event.target.value);
              setFilterState((current) => ({
                searchKeyword,
                brand:
                  current.searchKeyword === searchKeyword ? current.brand : "",
                price: nextPriceIndex,
              }));
              if (priceSlug) {
                navigate(
                  nextPriceIndex === 0
                    ? "/products"
                    : `/prices/${PRICE_RANGES[nextPriceIndex].slug}`,
                );
              }
            }}
          >
            {PRICE_RANGES.map((range, index) => (
              <option key={range.label} value={index}>
                {range.label}
              </option>
            ))}
          </select>
          {(selectedBrand || activePriceIndex !== 0 || selectedCategoryId) && (
            <button
              className={cx("reset-button")}
              type="button"
              onClick={resetFilters}
            >
              <FontAwesomeIcon icon={faRotateLeft} /> Xóa lọc
            </button>
          )}
          <span className={cx("result-count")}>
            {filteredProducts.length} sản phẩm
          </span>
        </div>
        <div className={cx("products-grid")}>
          {visibleProducts.map((pro, index) => (
            <Cart
              key={pro.id || pro._id || index}
              id={pro.id}
              title={pro.title}
              minPrice={pro.minPrice}
              avatar={pro.avatar}
              sold={pro.sold}
              discount={pro.discount}
              installment={pro.installment}
              screenSize={
                pro.specifications?.[pro.productType]?.screenSize ||
                pro.screenSize
              }
              rom={pro.rom}
              to={`/product-detail/${pro.id || pro._id}`}
            />
          ))}
        </div>
        {visibleProducts.length === 0 && (
          <div className={cx("empty-state")}>
            {searchKeyword
              ? `Không tìm thấy sản phẩm phù hợp với "${searchKeyword}".`
              : "Không tìm thấy sản phẩm phù hợp."}
          </div>
        )}
        {filteredProducts.length > visibleProducts.length && (
          <div className={cx("load-more")}>
            <button
              type="button"
              onClick={() =>
                setVisibleCountState((currentState) => ({
                  key: visibilityKey,
                  count:
                    (currentState.key === visibilityKey
                      ? currentState.count
                      : INITIAL_PRODUCTS_COUNT) + LOAD_MORE_COUNT,
                }))
              }
            >
              Tải thêm 10 sản phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
