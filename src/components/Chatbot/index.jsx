import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCommentDots,
  faPaperPlane,
  faRotateRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import axiosClient from "~/api/axiosClient";
import api from "~/api";
import { converseVND } from "~/utils/functions.jsx";
import styles from "./Chatbot.module.scss";

const cx = classNames.bind(styles);
const STARTER_MESSAGE = {
  role: "assistant",
  content:
    "Chào bạn! Mình có thể giúp bạn chọn điện thoại, laptop hoặc phụ kiện phù hợp.",
};
const SUGGESTIONS = [
  "Tìm laptop dưới 20 triệu",
  "Điện thoại chụp ảnh tốt",
  "Gợi ý phụ kiện cho điện thoại",
];

function ProductCard({ product }) {
  const startingPrice = Math.min(
    ...product.variants.map((variant) => variant.price),
  );

  return (
    <Link className={cx("product-card")} to={`/product-detail/${product.id}`}>
      {product.avatar ? (
        <img className={cx("product-image")} src={product.avatar} alt="" />
      ) : (
        <div className={cx("product-image-placeholder")} aria-hidden="true">
          FastCare
        </div>
      )}
      <span className={cx("product-info")}>
        <span className={cx("product-title")}>{product.title}</span>
        <span className={cx("product-price")}>
          {converseVND(startingPrice)}
        </span>
        <span className={cx("product-link")}>
          Xem sản phẩm <FontAwesomeIcon icon={faArrowRight} />
        </span>
      </span>
    </Link>
  );
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([STARTER_MESSAGE]);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      inputRef.current?.focus();
    }
  }, [isOpen, isSending, messages]);

  const sendMessage = async (content = input) => {
    const message = content.trim();
    if (!message || isSending) return;

    const history = messages
      .filter((item) => item.role === "user" || item.role === "assistant")
      .slice(-8)
      .map(({ role, content: messageContent }) => ({
        role,
        content: messageContent,
      }));
    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setIsSending(true);

    try {
      const { data } = await axiosClient.post(api.chatbot, {
        message,
        history,
      });
      if (typeof data?.reply !== "string" || !Array.isArray(data.products)) {
        throw new Error("Phản hồi chatbot không đúng định dạng.");
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply, products: data.products },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            error.message ||
            "Không gửi được tin nhắn. Vui lòng thử lại.",
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const startNewChat = () => {
    setMessages([STARTER_MESSAGE]);
    setInput("");
  };

  return (
    <div className={cx("chatbot")}>
      {isOpen && (
        <section className={cx("panel")} aria-label="Chat tư vấn FastCare">
          <header className={cx("header")}>
            <div className={cx("assistant-avatar")} aria-hidden="true">
              F
            </div>
            <div className={cx("header-copy")}>
              <strong>Trợ lý FastCare</strong>
              <span>Tư vấn sản phẩm cùng bạn</span>
            </div>
            <button
              className={cx("header-button")}
              type="button"
              aria-label="Bắt đầu cuộc trò chuyện mới"
              title="Cuộc trò chuyện mới"
              onClick={startNewChat}
              disabled={isSending}
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
            <button
              className={cx("header-button")}
              type="button"
              aria-label="Đóng khung chat"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </header>

          <div className={cx("messages")} aria-live="polite">
            {messages.map((item, index) => (
              <div
                className={cx(
                  "message-row",
                  item.role === "user" && "user-row",
                )}
                key={`${index}-${item.role}`}
              >
                <div
                  className={cx(
                    "message",
                    item.role === "user" && "user-message",
                    item.isError && "error-message",
                  )}
                >
                  {item.content}
                </div>
                {item.products?.length > 0 && (
                  <div className={cx("product-list")}>
                    {item.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className={cx("suggestions")} aria-label="Câu hỏi gợi ý">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    className={cx("suggestion")}
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={isSending}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {isSending && (
              <div className={cx("message", "loading")} role="status">
                Đang tìm sản phẩm phù hợp...
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <form
            className={cx("composer")}
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              className={cx("input")}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Bạn đang tìm sản phẩm nào?"
              aria-label="Tin nhắn của bạn"
              maxLength={1000}
              rows={1}
              disabled={isSending}
            />
            <button
              className={cx("send-button")}
              type="submit"
              aria-label="Gửi tin nhắn"
              disabled={!input.trim() || isSending}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
          <p className={cx("disclaimer")}>
            Tin nhắn và thông tin sản phẩm liên quan được gửi tới OpenAI để tạo
            câu trả lời. Không gửi thông tin tài khoản hoặc đơn hàng.
          </p>
        </section>
      )}

      <button
        className={cx("launcher", isOpen && "launcher-open")}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Đóng chat tư vấn" : "Mở chat tư vấn"}
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faCommentDots} />
        {!isOpen && <span>Tư vấn mua hàng</span>}
      </button>
    </div>
  );
}

export default Chatbot;
