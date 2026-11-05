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
import ForgotPassword from "~/components/pages/ForgotPassword";
import Signup from "~/components/pages/Signup";
import Products from "~/components/pages/customer/Products";
import Categories from "~/components/pages/customer/Categories";
import VerifyEmail from "~/components/pages/VerifyEmail";
import ResendVerify from "~/components/pages/ResendVerify";
import LoginSecurity from "~/components/pages/LoginSecurity";
import ShoppingCart from "~/components/pages/customer/ShoppingCart";
import CheckoutOrder from "~/components/pages/customer/CheckoutOrder";
import Order from "~/components/pages/customer/Order";
import OrderDetail from "~/components/pages/customer/OrderDetail";
import Profile from "~/components/pages/customer/Profile";
import Favorites from "~/components/pages/customer/Favorites";
import Settings from "~/components/pages/shared/Settings";

// Shared admin and staff pages
import Dashboard from "~/components/pages/shared/Dashboard";
import ProfitReport from "~/components/pages/shared/ProfitReport";
import UserManagement from "~/components/pages/shared/Users";
import AdminOrders from "~/components/pages/shared/Orders";
import OnlinePayments from "~/components/pages/shared/Payments";
import ParentCategories from "~/components/pages/shared/ParentCategories";
import CategoriesManagement from "~/components/pages/shared/Categories";
import ProductsManagement from "~/components/pages/shared/Products";
import ActivityLogs from "~/components/pages/admin/Logs";
import RefreshTokenSessions from "~/components/pages/admin/RefreshTokenSessions";

// Staff-only pages
import ProductDetailStaff from "~/components/pages/staff/ProductDetail";
import ProductForm from "~/components/pages/staff/ProductForm";
import Inventory from "~/components/pages/staff/Inventory";
import Imports from "~/components/pages/staff/Imports";
import ImportList from "~/components/pages/staff/ImportList";
import OrderHistory from "~/components/pages/staff/OrderHistory";
import InStoreSale from "~/components/pages/staff/InStoreSale";

const userRoutes = [
  {
    path: "/home",
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
    path: "/forgot-password",
    component: ForgotPassword,
    Layout: SecondaryLayout,
  },
  {
    path: "/signup",
    component: Signup,
    Layout: SecondaryLayout,
  },
  {
    path: "/products/:slug?",
    component: Products,
    Layout: DefaultLayout,
  },
  {
    path: "/category",
    component: Categories,
    Layout: DefaultLayout,
  },
  {
    path: "/category/:id",
    component: Products,
    Layout: DefaultLayout,
  },
  {
    path: "/prices/:range",
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
    path: "/security/login-reject/:id",
    component: LoginSecurity,
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
  },
  {
    path: "/order/:id",
    component: OrderDetail,
    Layout: HeaderOnly,
  },
  {
    path: "/profile",
    component: Profile,
    Layout: HeaderOnly,
  },
  {
    path: "/wishlist",
    component: Favorites,
    Layout: HeaderOnly,
  },
  {
    path: "/settings",
    component: Settings,
    Layout: HeaderOnly,
  },
];

const adminRoutes = [
  {
    path: "/admin",
    component: Dashboard,
    Layout: AdminLayout,
  },
  {
    path: "/admin/profit",
    component: ProfitReport,
    Layout: AdminLayout,
  },
  {
    path: "/admin/User",
    component: UserManagement,
    Layout: AdminLayout,
  },
  {
    path: "/admin/users",
    component: UserManagement,
    Layout: AdminLayout,
  },
  {
    path: "/admin/orders",
    component: AdminOrders,
    Layout: AdminLayout,
  },
  {
    path: "/admin/payments",
    component: OnlinePayments,
    Layout: AdminLayout,
  },
  {
    path: "/admin/parent-categories",
    component: ParentCategories,
    Layout: AdminLayout,
  },
  {
    path: "/admin/categories",
    component: CategoriesManagement,
    Layout: AdminLayout,
  },
  {
    path: "/admin/products",
    component: ProductsManagement,
    Layout: AdminLayout,
  },
  {
    path: "/admin/logs",
    component: ActivityLogs,
    Layout: AdminLayout,
  },
  {
    path: "/admin/refresh-tokens",
    component: RefreshTokenSessions,
    Layout: AdminLayout,
  },
];

const staffRoutes = [
  {
    path: "/staff/dashboard",
    component: Dashboard,
    Layout: StaffLayout,
  },
  {
    path: "/staff/profit",
    component: ProfitReport,
    Layout: StaffLayout,
  },
  {
    path: "/staff",
    component: Dashboard,
    Layout: StaffLayout,
  },
  {
    path: "/staff/products",
    component: ProductsManagement,
    Layout: StaffLayout,
  },
  {
    path: "/staff/products/inventory",
    component: Inventory,
    Layout: StaffLayout,
  },
  {
    path: "/staff/products/categories",
    component: CategoriesManagement,
    Layout: StaffLayout,
  },
  {
    path: "/staff/products/parent-categories",
    component: ParentCategories,
    Layout: StaffLayout,
  },
  {
    path: "/staff/imports",
    component: ImportList,
    Layout: StaffLayout,
  },
  {
    path: "/staff/imports/create",
    component: Imports,
    Layout: StaffLayout,
  },
  {
    path: "/staff/users",
    component: UserManagement,
    Layout: StaffLayout,
  },
  {
    path: "/staff/orders/create",
    component: InStoreSale,
    Layout: StaffLayout,
  },
  {
    path: "/staff/orders",
    component: AdminOrders,
    Layout: StaffLayout,
  },
  {
    path: "/staff/payments",
    component: OnlinePayments,
    Layout: StaffLayout,
  },
  {
    path: "/staff/orders/history",
    component: OrderHistory,
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
