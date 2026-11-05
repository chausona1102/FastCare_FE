import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "~/api";

function LoginSecurity() {
  const { id } = useParams();
  const [status, setStatus] = useState("confirm");
  const [message, setMessage] = useState("");

  const revokeSession = async () => {
    setStatus("loading");
    try {
      const response = await fetch(api.revokeLoginSession(id), {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Không thể thu hồi phiên đăng nhập.");
      }

      setMessage(result.message);
      setStatus("success");
    } catch (error) {
      setMessage(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
      setStatus("error");
    }
  };

  return (
    <main
      style={{
        maxWidth: 520,
        margin: "80px auto",
        padding: 24,
        textAlign: "center",
      }}
    >
      {status === "confirm" && (
        <>
          <h1>Thu hồi phiên đăng nhập</h1>
          <p>
            Nếu bạn không thực hiện lần đăng nhập này, hãy xác nhận để đăng xuất
            thiết bị đó. Thiết bị sẽ bị đăng xuất sau 15p. Nếu bạn nhận ra hoạt
            động này, hãy bỏ qua thông báo này.
          </p>
          <button
            type="button"
            onClick={revokeSession}
            class="btn btn-danger btn-lg px-4 py-2 fs-4 mx-2"
          >
            Thu hồi phiên này
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            class="btn btn-outline-secondary btn-lg px-4 py-2 fs-4"
          >
            Đóng
          </button>
        </>
      )}
      {status === "loading" && <p>Đang thu hồi phiên đăng nhập...</p>}
      {status === "success" && (
        <>
          <h1>Đã thu hồi phiên đăng nhập</h1>
          <p>
            {message}. Hãy đổi mật khẩu nếu bạn không nhận ra hoạt động này.
          </p>
          <Link to="/login">Đăng nhập</Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1>Không thể thu hồi phiên</h1>
          <p role="alert">{message}</p>
          <button type="button" onClick={() => setStatus("confirm")}>
            Thử lại
          </button>
        </>
      )}
    </main>
  );
}

export default LoginSecurity;
