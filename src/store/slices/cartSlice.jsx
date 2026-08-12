import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '~/api/axiosClient';
import api from '~/api';

const CART_URL = api.cart || 'http://localhost:5000/api/cart';
const CART_ITEM_URL = api.cartItem || 'http://localhost:5000/api/cartitem';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get(`${CART_URL}/items`);
    console.log('Fetched cart items:', response.data);
    return response.data;
  } catch (error) {
    return rejectWithValue({ message: 'Không thể tải giỏ hàng. Vui lòng thử lại.' });
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(`${CART_ITEM_URL}`, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue({ message: 'Thêm vào giỏ hàng thất bại.' });
  }
});

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ itemId, quantity }, { getState, rejectWithValue }) => {
    const state = getState();
    const item = state.cart.items.find((entry) => entry._id === itemId);
    if (!item) {
      return rejectWithValue({ message: 'Sản phẩm không tồn tại trong giỏ hàng.' });
    }
    const maxStock = item.variant?.stockQuantity ?? 1;
    if (quantity > maxStock) {
      return rejectWithValue({ message: 'Số lượng vượt quá tồn kho.' });
    }
    try {
      const response = await axiosClient.patch(`${CART_ITEM_URL}/quantity/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue({ message: 'Cập nhật số lượng thất bại.' });
    }
  }
);

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (itemId, { rejectWithValue }) => {
  try {
    const response = await axiosClient.delete(`${CART_ITEM_URL}/${itemId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue({ message: 'Xóa sản phẩm thất bại.' });
  }
});

export const removeMultipleCartItems = createAsyncThunk('cart/removeMultipleCartItems', async (itemIds, { rejectWithValue }) => {
  try {
    const response = await axiosClient.request({
      method: 'DELETE',
      url: `${CART_ITEM_URL}/items`,
      data: { itemIds },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue({ message: 'Xóa sản phẩm đã chọn thất bại.' });
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedItemIds: [],
  pendingIds: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleSelectItem(state, action) {
      const itemId = action.payload;
      const item = state.items.find((entry) => entry._id === itemId);
      if (!item || item.variant?.deleteAt) return;

      if (state.selectedItemIds.includes(itemId)) {
        state.selectedItemIds = state.selectedItemIds.filter((id) => id !== itemId);
      } else {
        state.selectedItemIds.push(itemId);
      }
    },
    toggleSelectAll(state) {
      const activeItems = state.items.filter((item) => !item.variant?.deleteAt);
      const activeIds = activeItems.map((item) => item._id);
      const allActiveSelected = activeIds.every((id) => state.selectedItemIds.includes(id));
      if (allActiveSelected) {
        state.selectedItemIds = [];
      } else {
        state.selectedItemIds = activeIds;
      }
    },
    clearCartState(state) {
      state.items = [];
      state.selectedItemIds = [];
      state.loading = false;
      state.error = null;
      state.pendingIds = [];
    },
    setCartQuantity(state, action) {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((entry) => entry._id === itemId);
      if (item) {
        const maxStock = item.variant?.stockQuantity ?? 1;
        item.quantity = Math.max(1, Math.min(maxStock, quantity));
      }
    },
    setItemPending(state, action) {
      const { itemId, pending } = action.payload;
      if (pending) {
        if (!state.pendingIds.includes(itemId)) state.pendingIds.push(itemId);
      } else {
        state.pendingIds = state.pendingIds.filter((id) => id !== itemId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        const items = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.items = items;
        state.selectedItemIds = items.filter((item) => !item.variant?.deleteAt).map((item) => item._id);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Không thể tải giỏ hàng.';
        state.items = [];
        state.selectedItemIds = [];
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        if (!action.payload.variant?.deleteAt) state.selectedItemIds.push(action.payload._id);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Thêm giỏ hàng thất bại.';
      })
      .addCase(updateCartItemQuantity.pending, (state, action) => {
        state.error = null;
        state.pendingIds.push(action.meta.arg.itemId);
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.payload._id);
        const existing = state.items.find((item) => item._id === action.payload._id);
        if (existing) {
          existing.quantity = action.payload.quantity;
          existing.currentPrice = action.payload.currentPrice ?? existing.currentPrice;
          if (existing.variant?.deleteAt) {
            state.selectedItemIds = state.selectedItemIds.filter((id) => id !== existing._id);
          }
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        const itemId = action.meta.arg.itemId;
        state.pendingIds = state.pendingIds.filter((id) => id !== itemId);
        state.error = action.payload?.message || 'Cập nhật số lượng thất bại.';
      })
      .addCase(removeCartItem.pending, (state, action) => {
        state.error = null;
        state.pendingIds.push(action.meta.arg);
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.meta.arg);
        state.items = state.items.filter((item) => item._id !== action.meta.arg);
        state.selectedItemIds = state.selectedItemIds.filter((id) => id !== action.meta.arg);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.meta.arg);
        state.error = action.payload?.message || 'Xóa sản phẩm thất bại.';
      })
      .addCase(removeMultipleCartItems.pending, (state, action) => {
        state.error = null;
        state.pendingIds.push(...action.meta.arg);
      })
      .addCase(removeMultipleCartItems.fulfilled, (state, action) => {
        state.pendingIds = [];
        const removedIds = action.meta.arg;
        state.items = state.items.filter((item) => !removedIds.includes(item._id));
        state.selectedItemIds = state.selectedItemIds.filter((id) => !removedIds.includes(id));
      })
      .addCase(removeMultipleCartItems.rejected, (state, action) => {
        state.pendingIds = [];
        state.error = action.payload?.message || 'Xóa các sản phẩm đã chọn thất bại.';
      });
  },
});

export const { toggleSelectItem, toggleSelectAll, clearCartState, setCartQuantity, setItemPending } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectSelectedItems = (state) => 
  state.cart.items.filter((item) => state.cart.selectedItemIds.includes(item._id) && !item.variant?.deleteAt);
export const selectSelectedCount = (state) => selectSelectedItems(state).reduce((sum, item) => sum + item.quantity, 0);
export const selectSubtotal = (state) => selectSelectedItems(state).reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);
export const selectTotal = (state) => selectSubtotal(state);
export const selectPendingIds = (state) => state.cart.pendingIds;

export default cartSlice.reducer;
