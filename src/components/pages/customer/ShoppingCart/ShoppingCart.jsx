import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItemList from './CartItemList';
import CartSummary from './CartSummary';
import EmptyCart from './EmptyCart';
import CartSkeleton from './CartSkeleton';
import useCart from '~/hook/useCart.jsx';

export default function ShoppingCart() {
  const navigate = useNavigate();
  const {
    items,
    loading,
    error,
    selectedItemIds,
    pendingIds,
    selectedQuantity,
    selectedTotalPrice,
    fetchCart,
    handleQuantityChange,
    handleRemoveItem,
    handleToggleSelect,
    handleSelectAll,
    handleRemoveSelected,
  } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const hasItems = items.length > 0;
  const activeItemIds = items.filter((item) => !item.variant?.deleteAt).map((item) => item._id);
  const allSelected = hasItems && activeItemIds.length > 0 && activeItemIds.every((id) => selectedItemIds.includes(id));

  const handleCheckout = (selectedIds) => {
    navigate('/checkout', { state: { selectedItemIds: selectedIds } });
  };

  return (
    <div className="shopping-cart-page bg-light py-5">
      <div className="container">
        <div className="mb-4">
          <h1 className="fw-bold">Giỏ hàng của bạn</h1>
          <p className="text-secondary">
            {hasItems ? `Bạn có ${items.length} sản phẩm trong giỏ` : 'Kiểm tra sản phẩm và chọn món hàng yêu thích của bạn.'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger rounded-4" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <CartSkeleton />
        ) : !hasItems ? (
          <EmptyCart />
        ) : (
          <div className="row gx-4 gy-4">
            <div className="col-12 col-xl-8">
              <div className="card rounded-4 border-0 shadow-sm p-3 p-xl-4 cart-list-card">
                <CartItemList
                  items={items}
                  selectedItemIds={selectedItemIds}
                  pendingIds={pendingIds}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  allSelected={allSelected}
                />
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="summary-wrapper position-sticky top-4">
                <CartSummary
                  selectedQuantity={selectedQuantity}
                  totalPrice={selectedTotalPrice}
                  selectedItemIds={selectedItemIds}
                  onRemoveSelected={handleRemoveSelected}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

