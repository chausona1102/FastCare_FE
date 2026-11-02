import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  setCartQuantity,
  updateCartItemQuantity,
  removeCartItem,
  removeMultipleCartItems,
  toggleSelectItem,
  toggleSelectAll,
  selectCartItems,
  // selectSelectedItems,
  selectSelectedCount,
  selectSubtotal,
  selectPendingIds,
} from "../store/slices/cartSlice.jsx";

export default function useCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  // const selectedItems = useSelector(selectSelectedItems);
  const selectedQuantity = useSelector(selectSelectedCount);
  const selectedTotalPrice = useSelector(selectSubtotal);
  const loading = useSelector((state) => state.cart.loading);
  const error = useSelector((state) => state.cart.error);
  const selectedItemIds = useSelector((state) => state.cart.selectedItemIds);
  const pendingIds = useSelector(selectPendingIds);

  const debounceRef = useRef(null);

  const fetchCartAction = useCallback(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = useCallback(
    (itemId, quantity) => {
      dispatch(setCartQuantity({ itemId, quantity }));

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce khi người dùng thay đổi số lượng để tránh gọi API liên tục khi click nhanh
      debounceRef.current = setTimeout(() => {
        dispatch(updateCartItemQuantity({ itemId, quantity }));
      }, 450);
    },
    [dispatch],
  );

  const handleRemoveItem = useCallback(
    (itemId) => {
      dispatch(removeCartItem(itemId));
    },
    [dispatch],
  );

  const handleToggleSelect = useCallback(
    (itemId) => {
      dispatch(toggleSelectItem(itemId));
    },
    [dispatch],
  );

  const handleSelectAll = useCallback(() => {
    dispatch(toggleSelectAll());
  }, [dispatch]);

  const handleRemoveSelected = useCallback(() => {
    if (selectedItemIds.length === 0) return;
    dispatch(removeMultipleCartItems(selectedItemIds));
  }, [dispatch, selectedItemIds]);

  return {
    items,
    loading,
    error,
    selectedItemIds,
    pendingIds,
    selectedQuantity,
    selectedTotalPrice,
    fetchCart: fetchCartAction,
    handleQuantityChange,
    handleRemoveItem,
    handleToggleSelect,
    handleSelectAll,
    handleRemoveSelected,
  };
}
