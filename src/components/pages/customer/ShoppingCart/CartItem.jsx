import React, { useState, useEffect } from 'react';

export default function CartItem({
  item,
  isSelected,
  onQuantityChange,
  onRemove,
  onToggleSelect,
  loading,
}) {
  const [qty, setQty] = useState(item.quantity || 1);
  
  // Lấy dữ liệu từ structure API
  const productTitle = item.product?.title || 'Sản phẩm không xác định';
  const productAvatar = item.product?.avatar || '';
  const productDiscount = item.product?.discount || 0;
  
  const variantStorage = item.variant?.storage || '';
  const variantColors = item.variant?.colors || [];
  const selectedColor = item.color || '';
  const stockQuantity = item.variant?.stockQuantity || 0;
  const isDeleted = item.variant?.deleteAt !== null;
  
  const currentPrice = item.currentPrice || 0;
  const originalPrice = productDiscount > 0 ? Math.ceil(currentPrice / (1 - productDiscount / 100)) : null;
  const unavailable = isDeleted || stockQuantity === 0;
  
  const indexClr = variantColors.findIndex((clr) => clr === selectedColor);
  const variantImage = item.variant?.images?.[indexClr] || productAvatar;


  useEffect(() => {
    setQty(item.quantity || 1);
  }, [item.quantity]);

  const variantText = [];
  if (variantStorage) variantText.push(variantStorage);
  if (selectedColor) variantText.push(selectedColor);

  const handleChange = (nextValue) => {
    const nextQty = Math.max(1, Math.min(stockQuantity || 1, Number(nextValue) || 1));
    setQty(nextQty);
    onQuantityChange(item._id, nextQty);
  };

  return (
    <div
      className={`card border-0 rounded-4 mb-3 shadow-sm cart-item-card ${unavailable ? 'unavailable' : ''}`}
      aria-disabled={unavailable}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-start gap-3">
          <div className="form-check mt-2">
            <input
              id={`cart-item-select-${item._id}`}
              type="checkbox"
              className="form-check-input"
              checked={isSelected && !unavailable}
              disabled={unavailable}
              onChange={() => onToggleSelect(item._id)}
              aria-label={`Chọn sản phẩm ${productTitle}`}
              style={{ accentColor: '#d70018' }}
            />
          </div>

          <img
            src={variantImage}
            alt={productTitle}
            className="rounded-4 object-fit-cover"
            style={{ width: 110, height: 110 }}
          />

          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 className="mb-1 fs-5 text-dark">{productTitle}</h5>
                <div className="text-secondary small">{variantText.join(' • ')}</div>
                {unavailable && (
                  <span className="badge bg-danger-subtle text-danger mt-2">
                    {isDeleted ? 'Ngừng kinh doanh' : 'Hết hàng'}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn btn-sm btn-link text-danger p-0 fs-5"
                onClick={() => onRemove(item._id)}
                aria-label={`Xóa ${productTitle}`}
              >
                Xóa
              </button>
            </div>

            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
              <div>
                {originalPrice ? (
                  <div className="text-muted small text-decoration-line-through mb-1">
                    {originalPrice.toLocaleString('vi-VN')} đ
                  </div>
                ) : null}
                <div className="fw-bold text-danger fs-5">
                  {currentPrice.toLocaleString('vi-VN')} đ
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 quantity-group">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleChange(qty - 1)}
                  disabled={loading || unavailable || qty <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  className="form-control form-control-sm text-center"
                  value={qty}
                  min="1"
                  max={stockQuantity || 1}
                  onChange={(e) => handleChange(e.target.value)}
                  aria-label={`Số lượng ${productTitle}`}
                  style={{ width: 72 }}
                  disabled={loading || unavailable}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleChange(qty + 1)}
                  disabled={loading || unavailable || qty >= (stockQuantity || 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted small">Kho: {stockQuantity}</div>
              <div className="fw-semibold text-danger">
                {(currentPrice * item.quantity).toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
