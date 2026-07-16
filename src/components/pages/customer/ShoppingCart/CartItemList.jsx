import React from 'react';
import CartItem from './CartItem';

export default function CartItemList({
  items,
  selectedItemIds,
  pendingIds,
  onQuantityChange,
  onRemove,
  onToggleSelect,
  onSelectAll,
  allSelected,
}) {
  const availableCount = items.filter((item) => !item.variant?.deleteAt).length;
  const selectedCount = items.filter((item) => selectedItemIds.includes(item._id)).length;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="form-check">
          <input
            id="select-all-cart"
            className="form-check-input"
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            aria-label="Chọn tất cả sản phẩm"
            style={{ accentColor: '#d70018' }}
          />
          <label className="form-check-label ms-2" htmlFor="select-all-cart">
            Chọn tất cả
          </label>
        </div>
        <div className="text-secondary small">Đã chọn {selectedCount} / {availableCount} sản phẩm</div>
      </div>

      {items.map((item) => (
        <CartItem
          key={item._id}
          item={item}
          isSelected={selectedItemIds.includes(item._id)}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
          onToggleSelect={onToggleSelect}
          loading={pendingIds.includes(item._id)}
        />
      ))}
    </div>
  );
}
