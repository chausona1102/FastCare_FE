import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Search.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";

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
  const inputRef = useRef(null);

  const currentSearch = searchParams.get("search") || "";

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = currentSearch;
    }
  }, [currentSearch]);

  const handleSearch = () => {
    const keyword = inputRef.current?.value.trim();

    if (!keyword) {
      return;
    }

    setShowModal(false);
    navigate(`/products?search=${encodeURIComponent(keyword)}`);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowModal(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    navigate("/products");
  };

  const handleSelectKeyword = (keyword) => {
    if (inputRef.current) {
      inputRef.current.value = keyword;
    }
    handleSearch();
  };

  return (
    <div className={cx("search", { open: isOpen })}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Bạn muốn tìm gì?"
        className={cx("search-input")}
        defaultValue={currentSearch}
        onFocus={() => setShowModal(true)}
        onBlur={() => setTimeout(() => setShowModal(false), 200)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSearch();
          }
        }}
      />
      {currentSearch ? (
        <button type="button" className={cx("search-btn", "close-btn")} onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      ) : (
        <button type="button" className={cx("search-btn")} onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      )}
      <div className={cx("modal", { open: showModal })}>
        <h3>Tìm kiếm</h3>
        <ul className={cx("options")}>
          {suggestedKeywords.map((keyword) => (
            <li key={keyword} value={keyword} onClick={() => handleSelectKeyword(keyword)}>
              {keyword} <FontAwesomeIcon icon={faSearch} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Search;
