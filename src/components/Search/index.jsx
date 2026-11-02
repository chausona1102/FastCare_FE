import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Search.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import api from "~/api";
import axiosClient from "~/api/axiosClient";
import { converseVND } from "~/utils/functions.jsx";
import { useAuth } from "~/hook/useAuth";

const cx = classNames.bind(styles);
const suggestedKeywords = [
  "iPhone",
  "Laptop gaming",
  "Tai nghe",
  "Apple Watch",
  "Máy tính bảng",
];

function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const currentSearch = searchParams.get("search") || "";
  const [keyword, setKeyword] = useState(currentSearch);
  const [products, setProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const { user } = useAuth();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKeyword(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProducts([]);
      setSearchError("");
      setIsSearching(false);
      return undefined;
    }

    let isCurrentRequest = true;
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const { data } = await axios.get(api.productSearch, {
          params: { keyword: normalizedKeyword, limit: 6 },
        });
        if (isCurrentRequest) {
          if (!Array.isArray(data)) {
            throw new Error("Dữ liệu tìm kiếm không hợp lệ.");
          }
          setProducts(data);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setProducts([]);
          setSearchError(
            error.response?.data?.message || "Không thể tìm kiếm sản phẩm.",
          );
        }
      } finally {
        if (isCurrentRequest) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeoutId);
    };
  }, [keyword]);

  const handleSearch = () => {
    const searchKeyword = keyword.trim();

    if (!searchKeyword) {
      setIsOpen(true);
      return;
    }

    setIsOpen(false);
    setShowModal(false);
    if (user) {
      axiosClient
        .post(api.behavior, { action: "search", searchQuery: searchKeyword })
        .catch((error) =>
          console.error("Unable to record search behavior:", error),
        );
    }
    navigate(`/products?search=${encodeURIComponent(searchKeyword)}`);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowModal(false);
    setKeyword("");
    navigate("/products");
  };

  const handleSelectProduct = (product) => {
    setShowModal(false);
    navigate(`/product-detail/${product._id || product.id}`);
  };

  return (
    <div className={cx("search", { open: isOpen })}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Bạn muốn tìm gì?"
        className={cx("search-input")}
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        onFocus={() => setShowModal(true)}
        onBlur={() => setTimeout(() => setShowModal(false), 200)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSearch();
          }
        }}
      />
      {currentSearch && keyword === currentSearch ? (
        <button
          type="button"
          className={cx("search-btn", "close-btn")}
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      ) : (
        <button
          type="button"
          className={cx("search-btn")}
          onClick={handleSearch}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      )}
      <div className={cx("modal", { open: showModal })}>
        {keyword.trim() ? (
          <>
            <h3>Sản phẩm phù hợp</h3>
            {isSearching ? (
              <p className={cx("search-status")}>Đang tìm kiếm...</p>
            ) : searchError ? (
              <p className={cx("search-status", "search-error")} role="alert">
                {searchError}
              </p>
            ) : products.length > 0 ? (
              <>
                <ul className={cx("product-options")}>
                  {products.map((product) => (
                    <li key={product._id || product.id}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelectProduct(product)}
                        aria-label={`Xem ${product.title}`}
                      >
                        <img
                          src={product.avatar}
                          alt=""
                          className={cx("avatar")}
                        />
                        <span className={cx("product-option-info")}>
                          <span className={cx("product-option-title")}>
                            {product.title}
                          </span>
                          <span className={cx("product-option-price")}>
                            {converseVND(product.minPrice)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={cx("view-search-results")}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleSearch}
                >
                  Xem tất cả kết quả <FontAwesomeIcon icon={faSearch} />
                </button>
              </>
            ) : (
              <p className={cx("search-status")}>
                Không tìm thấy sản phẩm phù hợp.
              </p>
            )}
          </>
        ) : (
          <>
            <h3>Từ khóa phổ biến</h3>
            <ul className={cx("options")}>
              {suggestedKeywords.map((suggestedKeyword) => (
                <li
                  key={suggestedKeyword}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setKeyword(suggestedKeyword);
                    navigate(
                      `/products?search=${encodeURIComponent(suggestedKeyword)}`,
                    );
                    setShowModal(false);
                  }}
                >
                  {suggestedKeyword} <FontAwesomeIcon icon={faSearch} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
