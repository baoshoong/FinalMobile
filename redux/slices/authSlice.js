import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { 
    users: [], 
    currentUser: null,
    user: null,
    cart: []
  },
  reducers: {
    setUser: (state, action) => {
      state.users.push(action.payload);
      state.user = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.user = null;
    },
    addToCart: (state, action) => {
      const existingItem = state.cart.find(item => item.product_id === action.payload.product_id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.cart.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(item => item.product_id !== action.payload);
    },
    updateCartQuantity: (state, action) => {
      const { product_id, quantity } = action.payload;
      const item = state.cart.find(item => item.product_id === product_id);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const { 
  setUser, 
  setCurrentUser, 
  clearUser, 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  clearCart 
} = authSlice.actions;

export default authSlice.reducer;
