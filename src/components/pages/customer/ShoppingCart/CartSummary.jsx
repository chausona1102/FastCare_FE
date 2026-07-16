import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CartSummary({
  selectedQuantity,
  totalPrice,
  selectedItemIds,
  onRemoveSelected,
  onCheckout,
}) {
  const navigate = useNavigate();

  return (
    <div className="card rounded-4 border-0 shadow-sm summary-card">
      <div className="card-body p-4">
        <h4 className="mb-3">Tóm tắt đơn hàng</h4>
        <div className="d-flex justify-content-between mb-2 text-secondary">
          <span>Số lượng đã chọn</span>
          <span>{selectedQuantity} sản phẩm</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-secondary">Tạm tính</span>
          <span className="fw-bold text-danger fs-5">{totalPrice.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="mb-3 text-muted small">Phí vận chuyển sẽ được tính ở trang thanh toán.</div>

        <button
          type="button"
          className="btn btn-outline-danger w-100 mb-2"
          onClick={onRemoveSelected}
          disabled={selectedItemIds.length === 0}
        >
          Xóa đã chọn
        </button>

        <button
          type="button"
          className="btn btn-danger w-100 rounded-pill py-2"
          onClick={() => onCheckout(selectedItemIds)}
          disabled={selectedItemIds.length === 0}
          style={{ backgroundColor: '#d70018', borderColor: '#d70018' }}
        >
          Mua hàng
        </button>

        <button
          type="button"
          className="btn btn-link text-primary mt-3"
          onClick={() => navigate('/products')}
        >
          Tiếp tục duyệt sản phẩm
        </button>
      </div>
    </div>
  );
}
