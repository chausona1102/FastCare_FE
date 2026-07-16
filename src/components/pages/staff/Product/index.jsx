import classNames from "classnames/bind";
import style from "./Product.module.scss";
const cx = classNames.bind(style);

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import Loading from "~/components/Loading";

function Product() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${api.product}/limit/all/20`);
      setProducts(response.data || []);
    } catch (err) {
      setError("Lỗi khi tải danh sách sản phẩm");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique brands
  const brands = [...new Set(products.map((p) => p.brand))].filter(Boolean);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchTitle = product.title
      .toLowerCase()
      .includes(searchTitle.toLowerCase());
    const matchBrand = !selectedBrand || product.brand === selectedBrand;
    const matchStatus =
      !selectedStatus ||
      (selectedStatus === "selling" && product.deletedAt === null) ||
      (selectedStatus === "hidden" && product.deletedAt !== null);

    return matchTitle && matchBrand && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIdx = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIdx,
    startIdx + productsPerPage
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await axios.delete(`${api.product}/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      setCurrentPage(1);
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm");
      console.error(err);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  if (loading)
    return (
      <div className={cx("wrapper")}>
        <Loading />
      </div>
    );

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <h1>Quản lý sản phẩm</h1>
        <button
          className={cx("btn-add")}
          onClick={() => navigate("/staff/products/new")}
        >
          <FontAwesomeIcon icon={faPlus} /> Thêm sản phẩm
        </button>
      </div>

      {error && <div className={cx("error")}>{error}</div>}

      <div className={cx("filters")}>
        <div className={cx("search-box")}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchTitle}
            onChange={(e) => {
              setSearchTitle(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className={cx("select")}
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          className={cx("select")}
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="selling">Đang bán</option>
          <option value="hidden">Đã ẩn</option>
        </select>
      </div>

      <div className={cx("table-container")}>
        <table className={cx("table")}>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Tên sản phẩm</th>
              <th>Thương hiệu</th>
              <th>RAM / Storage</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Đã bán</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <tr key={product._id}>
                  <td className={cx("avatar-cell")}>
                    <img src={product.avatar} alt={product.title} />
                  </td>
                  <td className={cx("title-cell")}>{product.title}</td>
                  <td>{product.brand || "-"}</td>
                  <td>
                    {product.ram || "-"} / {product.storage || "-"}
                  </td>
                  <td>{product.category?.name || "-"}</td>
                  <td className={cx("price-cell")}>
                    {formatPrice(product.minPrice)}
                  </td>
                  <td>{product.sold}</td>
                  <td>
                    <span
                      className={cx(
                        "status",
                        product.deletedAt === null ? "selling" : "hidden"
                      )}
                    >
                      {product.deletedAt === null ? "Đang bán" : "Không bán"}
                    </span>
                  </td>
                  <td className={cx("actions")}>
                    <button
                      className={cx("btn", "btn-view")}
                      title="Xem chi tiết"
                      onClick={() => navigate(`/staff/products/${product._id}`)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      className={cx("btn", "btn-edit")}
                      title="Chỉnh sửa"
                      onClick={() =>
                        navigate(`/staff/products/${product._id}/edit`)
                      }
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className={cx("btn", "btn-delete")}
                      title="Xóa"
                      onClick={() => handleDelete(product._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className={cx("empty")}>
                  Không tìm thấy sản phẩm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={cx("pagination")}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Trang trước
        </button>
        <span className={cx("page-info")}>
          Trang {currentPage} / {totalPages || 1}
        </span>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}

export default Product;
