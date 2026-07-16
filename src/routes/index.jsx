// Layout
import DefaultLayout from "~/components/layout/DefaultLayout";
import HeaderOnly from "~/components/layout/HeaderOnly";
import SecondaryLayout from "~/components/layout/SecondaryLayout";
import AdminLayout from "~/components/layout/AdminLayout";
import StaffLayout from "~/components/layout/StaffLayout";

//
import NotFound from "~/components/pages/NotFound";

// User Pages
import Home from "~/components/pages/customer/Home";
import ProductDetail from "~/components/pages/customer/ProductDetail";
import Login from "~/components/pages/Login";
import Signup from "~/components/pages/Signup";
import Products from "~/components/pages/customer/Products";
import VerifyEmail from "~/components/pages/VerifyEmail";
import ResendVerify from "~/components/pages/ResendVerify";
import ShoppingCart from "~/components/pages/customer/ShoppingCart";
import CheckoutOrder from "~/components/pages/customer/CheckoutOrder";
import Order from "~/components/pages/customer/Order";

// Admin Pages
import Dashboard from "~/components/pages/admin/Dashboard";

// Staff Pages
import StaffDashboard from "~/components/pages/staff/Dashboard";
import ProductStaff from "~/components/pages/staff/Product";
import ProductDetailStaff from "~/components/pages/staff/ProductDetail";
import ProductForm from "~/components/pages/staff/ProductForm";

const userRoutes = [
  {
    path: "/",
    component: Home,
    Layout: DefaultLayout,
  },
  {
    path: "/product-detail/:id",
    component: ProductDetail,
    Layout: DefaultLayout,
  },
  {
    path: "/login",
    component: Login,
    Layout: SecondaryLayout,
  },
  {
    path: "/signup",
    component: Signup,
    Layout: SecondaryLayout,
  },
  {
    path: "/products/:id",
    component: Products,
    Layout: DefaultLayout,
  },
  {
    path: "/verify-email",
    component: VerifyEmail,
    Layout: SecondaryLayout,
  },
  {
    path: "/resend-verify",
    component: ResendVerify,
    Layout: SecondaryLayout,
  },
  {
    path: "/cart",
    component: ShoppingCart,
    Layout: DefaultLayout,
  },
  {
    path: "/checkout",
    component: CheckoutOrder,
    Layout: DefaultLayout,
  },
  {
    path: "/order",
    component: Order,
    Layout: HeaderOnly,
  }
];

const adminRoutes = [
  {
    path: "/admin",
    component: Dashboard,
    Layout: AdminLayout,
  },
];

const staffRoutes = [
  {
    path: "/staff/dashboard",
    component: StaffDashboard,
    Layout: StaffLayout,
  },
  {
    path: "/staff",
    component: StaffDashboard,
    Layout: StaffLayout,
  },
  {
    path: "/staff/products",
    component: ProductStaff,
    Layout: StaffLayout,
  },
  {
    path: "/staff/products/new",
    component: ProductForm,
    Layout: StaffLayout,
  },
  {
    path: "/staff/products/:id",
    component: ProductDetailStaff,
    Layout: StaffLayout,
  },
  {
    path: "/staff/products/:id/edit",
    component: ProductForm,
    Layout: StaffLayout,
  },
];

const notFoundRoutes = [
  {
    path: "/404",
    component: NotFound,
  },
];

export { userRoutes, adminRoutes, notFoundRoutes, staffRoutes };
