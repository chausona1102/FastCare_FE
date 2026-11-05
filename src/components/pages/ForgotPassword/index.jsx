import { useState } from "react";
import { Link } from "react-router-dom";
import api from "~/api";
import Title from "~/components/Title";
import styles from "./ForgotPassword.module.scss";

function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRequest = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(api.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể gửi mã PIN");
      setStep("pin");
      setIsError(false);
      setMessage(data.message);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Không thể kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(api.verifyPasswordResetPin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Mã PIN không hợp lệ");
      setResetToken(data.resetToken);
      setStep("password");
      setIsError(false);
      setMessage(data.message);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Không thể kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(api.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Không thể đặt lại mật khẩu");
      }
      setStep("done");
      setIsError(false);
      setMessage(data.message);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Không thể kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.wrapper}>
      <Link to="/login" className={styles.backLink}>
        ← Quay lại đăng nhập
      </Link>
      <section className={styles.card}>
        <Title title="Quên mật khẩu" className={styles.title} />
        {step === "email" && (
          <>
            <p>Nhập email đã đăng ký để nhận mã PIN đặt lại mật khẩu.</p>
            <form onSubmit={submitRequest}>
              <label htmlFor="email">Email</label>
              <input
                autoComplete="email"
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Nhập email của bạn"
                required
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Gửi mã PIN"}
              </button>
            </form>
          </>
        )}
        {step === "pin" && (
          <>
            <p>
              Nếu email đã đăng ký, mã PIN gồm 6 chữ số sẽ được gửi đến {email}.
            </p>
            <form onSubmit={submitPin}>
              <label htmlFor="pin">Mã PIN</label>
              <input
                autoComplete="one-time-code"
                id="pin"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Nhập mã PIN"
                required
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang xác thực..." : "Xác thực"}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => {
                  setStep("email");
                  setMessage("");
                }}
              >
                Đổi email hoặc gửi mã mới
              </button>
            </form>
          </>
        )}
        {step === "password" && (
          <>
            <p>PIN đã được xác thực. Hãy tạo mật khẩu mới.</p>
            <form onSubmit={submitPassword}>
              <label htmlFor="password">Mật khẩu mới</label>
              <input
                autoComplete="new-password"
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ít nhất 6 ký tự"
                required
              />
              <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
              <input
                autoComplete="new-password"
                id="confirm-password"
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Đặt mật khẩu mới"}
              </button>
            </form>
          </>
        )}
        {step === "done" && (
          <>
            <p>{message}</p>
            <Link className={styles.submitLink} to="/login">
              Đăng nhập
            </Link>
          </>
        )}
        {message && step !== "done" && (
          <p className={isError ? styles.error : styles.success} role="status">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

export default ForgotPassword;
