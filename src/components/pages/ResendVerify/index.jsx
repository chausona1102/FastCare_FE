import styles from "./ResendVerify.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);
import api from "~/api";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function ResendVerify() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await fetch(api.resendVerify, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowModal(true);
      }
      setMessage(data.message);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        <h1>Bước cuối cùng</h1>
        <h2>Xác thực email của bạn để đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className={cx("form-group")}>
            <label htmlFor="email">Nhập địa chỉ email</label>
            <input
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <p className={cx("error-log")}>{message}</p>
          <button type="submit" className={cx("btn-submit")} disabled={sending}>
            {sending ? "Đang xử lý" : "Xác thực"}
          </button>
        </form>
      </div>
      <div className={cx("modal", { show: showModal })}>
        <div className={cx("content")}>
          <FontAwesomeIcon
            icon={faCheckCircle}
            className={cx("icon-checked")}
          />
          <h2>Đã gửi lại mã xác thực</h2>
          <Link to="/login">Quay lại trang đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default ResendVerify;
