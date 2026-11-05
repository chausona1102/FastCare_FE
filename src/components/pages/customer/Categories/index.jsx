import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import classNames from "classnames/bind";

import api from "~/api";
import { LoadingProduct } from "~/components/Loading";
import styles from "./Categories.module.scss";

const cx = classNames.bind(styles);

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(api.parentCategory);
        setCategories(Array.isArray(data) ? data : []);
      } catch (requestError) {
        console.error("Error fetching categories:", requestError);
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return LoadingProduct();

  return (
    <main className={cx("wrapper")}>
      <div className={cx("heading")}>
        <p className={cx("eyebrow")}>Khám phá sản phẩm</p>
        <h1>Danh mục</h1>
      </div>
      {error ? (
        <p className={cx("message")} role="alert">
          {error}
        </p>
      ) : categories.length ? (
        <div className={cx("grid")}>
          {categories.map((category) => {
            const categoryId = category._id || category.id;
            return (
              <Link
                key={categoryId}
                to={`/category/${categoryId}`}
                className={cx("category")}
              >
                {category.avatar ? (
                  <img src={category.avatar} alt="" className={cx("avatar")} />
                ) : (
                  <span className={cx("avatar-fallback")} aria-hidden="true">
                    {category.name?.charAt(0) || "?"}
                  </span>
                )}
                <span className={cx("category-name")}>{category.name}</span>
                <span className={cx("arrow")} aria-hidden="true">
                  &#8594;
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className={cx("message")}>Chưa có danh mục nào.</p>
      )}
    </main>
  );
}

export default Categories;
