import { useNavigate } from "react-router-dom";

export default function EmptyCart() {
  const navigate = useNavigate();

  return (
    <div className="empty-cart-wrapper text-center py-5">
      <div className="empty-cart-illustration mb-4">
        <svg
          width="180"
          height="160"
          viewBox="0 0 180 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="10" y="20" width="160" height="110" rx="20" fill="#f7faff" />
          <rect x="33" y="43" width="114" height="22" rx="10" fill="#dbe7ff" />
          <rect x="33" y="75" width="96" height="18" rx="9" fill="#f7faff" />
          <rect x="33" y="101" width="72" height="16" rx="8" fill="#f7faff" />
          <circle cx="48" cy="94" r="8" fill="#609afa" />
          <circle cx="132" cy="94" r="8" fill="#d70018" />
        </svg>
      </div>
      <h4 className="mb-3">Giỏ hàng của bạn đang trống</h4>
      <p className="text-secondary mb-4">
        Thêm sản phẩm vào giỏ để tiếp tục mua sắm và nhận ưu đãi.
      </p>
      <button
        type="button"
        className="btn btn-danger rounded-pill px-4 fs-5"
        onClick={() => navigate("/")}
      >
        Tiếp tục mua sắm
      </button>
    </div>
  );
}
