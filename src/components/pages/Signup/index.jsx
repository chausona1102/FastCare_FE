import { useState } from "react";
import style from "./Signup.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);
import api from "~/api";

import Title from "~/components/Title";

import { Link } from "react-router-dom";
import Tippy from "@tippyjs/react";
import { LoadingCircle } from "~/components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faCheckCircle,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Bắt buộc"),
  username: yup.string().required("Bắt buộc"),
  fullname: yup.string().required("Bắt buộc"),
  phone: yup.string().required("Bắt buộc"),
  password: yup.string().min(8, "Ít nhất 8 ký tự").required("Bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Bắt buộc"),
});

function Login() {
  const [showPass, setShowPass] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSigningUp(true);
    setShowError(false);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("username", data.username);
      formData.append("fullname", data.fullname);
      formData.append("phone", data.phone);
      formData.append("password", data.password);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch(api.signup, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Signup response:", result);
      if (response.status === 201) {
        setShowModal(true);
      } else {
        setErrorMessage(result.message || "Đăng ký thất bại");
        setShowError(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningUp(false);
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
              <Title title="Đăng ký FastCare" className={cx("title")} />
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className={cx("form-group")}>
                  <label htmlFor="email">Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    placeholder="Nhập email của bạn"
                  />
                  {errors.email && (
                    <span className={cx("error")}>{errors.email.message}</span>
                  )}
                </div>

                <div className={cx("form-group")}>
                  <label htmlFor="username">Username</label>
                  <input
                    {...register("username")}
                    type="text"
                    id="username"
                    placeholder="Nhập username của bạn"
                  />
                  {errors.username && (
                    <span className={cx("error")}>
                      {errors.username.message}
                    </span>
                  )}
                </div>
                <div className={cx("form-group")}>
                  <label htmlFor="fullname">Họ và tên</label>
                  <input
                    {...register("fullname")}
                    type="text"
                    id="fullname"
                    placeholder="Nhập họ và tên của bạn"
                  />
                  {errors.fullname && (
                    <span className={cx("error")}>
                      {errors.fullname.message}
                    </span>
                  )}
                </div>

                <div className={cx("form-group")}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    {...register("phone")}
                    type="text"
                    id="phone"
                    placeholder="Nhập số điện thoại của bạn"
                  />
                  {errors.phone && (
                    <span className={cx("error")}>{errors.phone.message}</span>
                  )}
                </div>

                <div className={cx("form-group", "password")}>
                  <label htmlFor="password">Mật khẩu</label>
                  <input
                    {...register("password")}
                    type={showPass ? "text" : "password"}
                    id="password"
                    placeholder="Nhập mật khẩu"
                  />
                  {errors.password && (
                    <span className={cx("error")}>
                      {errors.password.message}
                    </span>
                  )}
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

                <div className={cx("form-group", "password")}>
                  <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
                  <input
                    {...register("confirmPassword")}
                    type={showPass ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                  />
                  {errors.confirmPassword && (
                    <span className={cx("error")}>
                      {errors.confirmPassword.message}
                    </span>
                  )}
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
                <div className={cx("avatar")}>
                  <label htmlFor="avatar">Ảnh đại diện</label>

                  {/* Preview ảnh nếu có */}
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="preview"
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: 8,
                      }}
                    />
                  )}

                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className={cx("error-log", { show: showError })}>
                  {errorMessage}
                </p>
                <button
                  type="submit"
                  className={cx("btn-submit")}
                  disabled={isSigningUp}
                >
                  {isSigningUp ? "Đang đăng ký..." : "Đăng ký"}
                </button>
                {isSigningUp && <LoadingCircle />}
                <div className={cx("more-login")}>
                  <div className={cx("dash")}></div>
                  <span>Hoặc</span>
                  <div className={cx("dash")}></div>
                </div>
                <p className={cx("login")}>
                  Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
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
          <h2>Đăng ký thành công, vui lòng xác thực email!</h2>
          <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
