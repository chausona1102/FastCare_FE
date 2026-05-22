import { useState, useRef, useEffect } from "react";
import styles from "./Search.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    inputRef.current.value = "";
  };

  return (
    <div className={cx("search", { open: isOpen })}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Bạn muốn tìm gì?"
        className={cx("search-input")}
      />
      {isOpen ? (
        <button className={cx("search-btn")} onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      ) : (
        <button className={cx("search-btn")} onClick={() => setIsOpen(true)}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      )}
    </div>
  );
}

export default Search;
