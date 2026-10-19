const api = {

  /* Sign up: Method POST
  Ex: http://localhost:5000/api/auth/signup
  Method: POST
  Headers: Content-Type: multipart/form-data
  Body: {
    "email": "user@example.com",
    "password": "password123",
    "fullname": "John Doe",
    "phone": "1234567890",
    "username": "johndoe",
    "avatar": uploaded avatar file,
  }
  */
  signup: "http://localhost:5000/api/auth/signup",
  
  /* 
  Ex: http://localhost:5000/api/auth/login
  Method: POST
  Headers: Content-Type: application/json
  Body: {
    "email": "user@example.com",
    "password": "password123"
  }
  */
  login: "http://localhost:5000/api/auth/login",

  // Verify Email: Method POST
  verifyEmail: "http://localhost:5000/api/auth/verify-email",
  // Resend-Verify Email: Method POST
  resendVerify: "http://localhost:5000/api/auth/resend-verify",

  // Product API:
  product: "http://localhost:5000/api/product",
  productSearch: "http://localhost:5000/api/product/search",
  chatbot: "http://localhost:5000/api/chatbot",

  /* 
  Ex: http://localhost:5000/api/cart
  Method: GET
  */
  cart: "http://localhost:5000/api/cart",
  cartItem: "http://localhost:5000/api/cartitem",
  
  /*
  Ex: http://localhost:5000/api/product/category/dien-thoai/20
  Method: GET
  Params:
    - slug: slug of parent category (dien-thoai, laptop, phu-kien)
    - limit: number of products to return
  Response: Array of products
  */
  productBySlug: "http://localhost:5000/api/product/category",
  

  /*
  Ex: http://localhost:5000/api/category/brands/parentCategoryId
  Method: GET
  Params: 
    - parentCategoryId: ID of the parent category
  Response: Array of brands

  Ex: http://localhost:5000/api/category/brands/dien-thoai
  Method: GET
  Params: 
    - dien-thoai: slug of the parent category
  Response: Array of brands
  */
  category: "http://localhost:5000/api/category",

  /*
  Ex: http://localhost:5000/api/feedback/productId 
  Method: GET
  Params:
    - productId: ID of the product
  Response: Array of feedbacks
  */
  feedback: "http://localhost:5000/api/feedback",


  /*
  Ex: http://localhost:5000/api/parent/category
  Method: GET
  Response: Array of parent categories
  */
  parentCategory: "http://localhost:5000/api/parent/category",

  // Variant
  variant: "http://localhost:5000/api/variant",

  // Order
  order: "http://localhost:5000/api/order",

  // Favorites
  favorite: "http://localhost:5000/api/favorite",

  // User management
  user: "http://localhost:5000/api/user",
  imports: "http://localhost:5000/api/import",
  report: "http://localhost:5000/api/report",
  logs: "http://localhost:5000/api/log",
};

export default api;
