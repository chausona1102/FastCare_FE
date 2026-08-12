import { useState, useRef, useEffect } from "react";
import styles from "./Search.module.scss";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";

const cx = classNames.bind(styles);

function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
        onFocus={() => setShowModal(true)}
        onBlur={() => setTimeout(() => setShowModal(false), 200)}
      />
      {/* {isOpen ? (
        <button className={cx("search-btn")} onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      ) : (
        
      )} */}
      <button className={cx("search-btn")} onClick={() => console.log("input value:", inputRef.current?.value)}>
        <FontAwesomeIcon icon={faSearch} />
      </button>
      <div className={cx("modal", { open: showModal })}>
        <h3>Tìm kiếm</h3>
        <ul className={cx("options")}>
          <li value="option1" onClick={() => inputRef.current && (inputRef.current.value = "Option 1")}>
            Option 1 <FontAwesomeIcon icon={faSearch} />
          </li>
          <li value="option2" onClick={() => inputRef.current && (inputRef.current.value = "Option 2")}>
            Option 2 <FontAwesomeIcon icon={faSearch} />
          </li>
          <li value="option3" onClick={() => inputRef.current && (inputRef.current.value = "Option 3")}>
            Option 3 <FontAwesomeIcon icon={faSearch} />
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Search;
