import { useEffect, useState } from "react";
import style from "./Login.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);
import { google, facebook } from "~/assets/icons";
import api from "~/api";

import Title from "~/components/Title";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "~/store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faCheckCircle,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    let timer;
    let countdownTimer;
    if (token) {
      setShowModal(true);
      countdownTimer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      timer = setTimeout(() => {
        navigate("/");
      }, 3000);
    }
    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(api.login, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        // alert(response.status);
        setErrorMessage(data.message);
        setShowError(true);
        if (response.status === 403) {
          navigate("/resend-verify");
        }
        return;
      }

      // Lưu trữ user, token vào localStorage, Redux
      dispatch(setCredentials({ user: data.user, token: data.accessToken }));

      setShowModal(true);
      let count = 3;
      const countdownTimer = setInterval(() => {
        count--;
        setCountdown(count);
      }, 1000);
      setTimeout(() => {
        clearInterval(countdownTimer);
        // switch (data.user.role) {
        //   case "admin":
        //     navigate("/admin");
        //     break;
        //   case "staff":
        //     navigate("/staff");
        //     break;
        //   case "customer":
        //     navigate("/");
        //     break;
        //   default:
        //     navigate("/");
        // }
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={cx("wrapper")}>
      <Tippy content="Trang chủ" placement="left">
        <Link to="/" className={cx("back-home")}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </Link>
      </Tippy>
      <div className={cx("container")}>
        <div className={cx("row")}>
          <div className={cx("col")}>Quảng cáo, Slogan, Ưu đãi</div>
          <div className={cx("col")}>
            <div className={cx("form-wrapper")}>
              <Title title="Đăng nhập FastCare" className={cx("title")} />
              <form onSubmit={handleSubmit}>
                <div className={cx("form-group")}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={cx("form-group", "password")}>
                  <label htmlFor="password">Mật khẩu</label>
                  <input
                    type={showPass ? "text" : "password"}
                    id="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={cx("btn-eye")}
                    onClick={() => setShowPass(!showPass)}
                  >
                    <FontAwesomeIcon
                      icon={showPass ? faEye : faEyeSlash}
                      className={cx("icon-eye")}
                    />
                  </button>
                </div>
                <p className={cx("error-log", { show: showError })}>
                  {errorMessage}
                </p>
                <button type="submit" className={cx("btn-submit")}>
                  Đăng nhập
                </button>
                <div className={cx("forgot")}>
                  <a href="/forgot-password">Quên mật khẩu?</a>
                </div>
                <div className={cx("more-login")}>
                  <div className={cx("dash")}></div>
                  <span>Hoặc đăng nhập bằng</span>
                  <div className={cx("dash")}></div>
                </div>
                <div className={cx("more-login-btn")}>
                  <Link>
                    <img src={google} /> Google
                  </Link>
                  <Link>
                    <img src={facebook} /> Facebook
                  </Link>
                </div>
                <p className={cx("register")}>
                  Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className={cx("modal", { show: showModal })}>
        <div className={cx("content")}>
          <FontAwesomeIcon
            icon={faCheckCircle}
            className={cx("icon-checked")}
          />
          <h2>Đăng nhập thành công!</h2>
          <p>Quay lại trang chủ sau {countdown} giây...</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
