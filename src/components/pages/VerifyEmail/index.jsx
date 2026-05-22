import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "~/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faClose } from "@fortawesome/free-solid-svg-icons";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;
    const token = searchParams.get("token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      setMessage("Không tìm thấy token!");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`${api.verifyEmail}?token=${token}`);
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      } catch (error) {
        console.error("fetch error:", error);
        setStatus("error");
        setMessage("Có lỗi xảy ra, vui lòng thử lại!");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      {status === "loading" && <p>Đang xác thực email...</p>}

      {status === "success" && (
        <>
          <h2>
            <FontAwesomeIcon icon={faCheckCircle} /> {message}
          </h2>
          <Link to="/login">Đăng nhập ngay</Link>
        </>
      )}

      {status === "error" && (
        <>
          <h2>
            <FontAwesomeIcon icon={faClose} /> {message}
          </h2>
          <Link to="/resend-verify">Gửi lại email xác thực</Link>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;
