import api from "~/api";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import classNames from "classnames/bind";
import styles from "./Category.module.scss";

const cx = classNames.bind(styles);

function CategoryPopper({ isOpen, categories }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const selectedKey = selectedCategory?._id || selectedCategory?.id;

    if (!selectedKey) {
      setBrands([]);
      return;
    }

    let isMounted = true;

    const fetchBrands = async () => {
      try {
        const { data: brandsData } = await axios.get(
          `${api.category}/brands/${selectedKey}`,
        );
        if (isMounted) {
          setBrands(Array.isArray(brandsData) ? brandsData : []);
        }
      } catch (e) {
        console.error("Error fetching brands:", e);
        if (isMounted) {
          setBrands([]);
        }
      }
    };

    fetchBrands();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory?._id, selectedCategory?.id]);

  if (!isOpen) return null;

  return (
    <div className={cx("category-popper")}>
      <div className={cx("wrapper")}>
        <div className={cx("list-category")}>
          <div className={cx("title-row")}>
            <h2 className={cx("title")}>Danh mục</h2>
            <span className={cx("subtitle")}>Chọn nhóm sản phẩm</span>
          </div>
          <ul className={cx("category-list")}>
            {categories?.map((category) => {
              const categoryKey = category._id || category.id;
              const isActive =
                selectedCategory?._id === categoryKey ||
                selectedCategory?.id === categoryKey;

              return (
                <li key={categoryKey} className={cx("category-item-wrapper")}>
                  <button
                    type="button"
                    className={cx("category-item", { active: isActive })}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <img
                      src={category.avatar}
                      alt={category.name || "Danh mục"}
                      className={cx("category-avatar")}
                    />
                    <span className={cx("category-label")}>
                      {category.name}
                    </span>
                    <FontAwesomeIcon
                      icon={faAngleRight}
                      className={cx("category-icon")}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {selectedCategory ? (
          <div className={cx("category-detail")}>
            <div className={cx("detail-header")}>
              <h5 className={cx("detail-title")}>Nhãn hiệu</h5>
              <Link
                to={`/category/${selectedCategory._id || selectedCategory.id}`}
                className={cx("view-all")}
              >
                Xem tất cả
              </Link>
            </div>

            {brands.length > 0 ? (
              <div className={cx("detail-grid")}>
                {brands.map((brand) => {
                  const brandKey = brand._id || brand.id || brand.categoryId;
                  const brandName = brand.name || brand.title || "Thương hiệu";

                  return (
                    <Link
                      key={brandKey}
                      to={`/category/${selectedCategory._id || selectedCategory.id}?brand=${brandKey}`}
                      className={cx("brand-item")}
                    >
                      <img
                        src={brand.avatar}
                        alt={brandName}
                        className={cx("brand-avatar")}
                      />
                      <span className={cx("brand-name")}>{brandName}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className={cx("empty-state")}>Đang tải nhãn hiệu...</div>
            )}

            <div className={cx("sub-detail")}>
              <div>
                <h5 className={cx("detail-title")}>Mức giá</h5>
                <ul className={cx("detail-list")}>
                  <li className={cx("price-item")}>
                    <Link to="/prices/below-1m">Dưới 1 triệu</Link>
                  </li>
                  <li className={cx("price-item")}>
                    <Link to="/prices/1m-3m">1 triệu - 3 triệu</Link>
                  </li>
                  <li className={cx("price-item")}>
                    <Link to="/prices/3m-5m">3 triệu - 5 triệu</Link>
                  </li>
                  <li className={cx("price-item")}>
                    <Link to="/prices/5m-10m">5 triệu - 10 triệu</Link>
                  </li>
                  <li className={cx("price-item")}>
                    <Link to="/prices/above-10m">Trên 10 triệu</Link>
                  </li>
                </ul>
              </div>
              {/* <div>
                <h5 className={cx("detail-title")}>{selectedCategory.name} HOT</h5>
                <ul className={cx("detail-list")}>
                  <li className={cx("price-item")}>
                    <Link to="/prices/below-1m">Ưu đãi mới</Link>
                  </li>
                  <li className={cx("price-item")}>
                    <Link to="/prices/1m-3m">Bán chạy nhất</Link>
                  </li>
                </ul>
              </div> */}
            </div>
          </div>
        ) : (
          <div className={cx("category-detail", "empty-detail")}>
            <h5 className={cx("detail-title")}>Chọn danh mục</h5>
            <p className={cx("empty-state")}>
              Vui lòng chọn một danh mục để xem nhãn hiệu và ưu đãi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPopper;
