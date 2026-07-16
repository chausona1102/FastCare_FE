const api = {
  // Sign up: Method POST
  signup: "http://localhost:5000/api/auth/signup",
  // Login : Method POST
  login: "http://localhost:5000/api/auth/login",
  // Verify Email: Method POST
  verifyEmail: "http://localhost:5000/api/auth/verify-email",
  // Resend-Verify Email: Method POST
  resendVerify: "http://localhost:5000/api/auth/resend-verify",

  // Product API:
  product: "http://localhost:5000/api/product",
  cart: "http://localhost:5000/api/cart",
  cartItem: "http://localhost:5000/api/cartitem",

  // Ex: http://localhost:5000/api/product/category/dien-thoai
  productBySlug: "http://localhost:5000/api/product/category",

  // Category API:
  category: "http://localhost:5000/api/category",

  // Parent Category API:
  parentCategory: "http://localhost:5000/api/parent/category",

  // Variant
  variant: "http://localhost:5000/api/variant",

  // Order
  order: "http://localhost:5000/api/order",
};

export default api;
