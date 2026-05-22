// Layout
import DefaultLayout from "~/components/layout/DefaultLayout";
import SecondaryLayout from "~/components/layout/SecondaryLayout";
import AdminLayout from "../components/layout/AdminLayout";

//
import NotFound from "~/components/pages/NotFound";

// User Pages
import Home from "~/components/pages/Home";
import ProductDetail from "~/components/pages/ProductDetail";
import Login from "~/components/pages/Login";
import Signup from "~/components/pages/Signup";
import Products from "~/components/pages/Products";
import VerifyEmail from "../components/pages/VerifyEmail";
import ResendVerify from "../components/pages/ResendVerify";

// Admin Pages
import Dashboard from "../components/pages/admin/Dashboard";

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
];

const adminRoutes = [
  {
    path: "/admin",
    component: Dashboard,
    Layout: AdminLayout,
  },
];

const notFoundRoutes = [
  {
    path: "/404",
    component: NotFound,
  },
];

export { userRoutes, adminRoutes, notFoundRoutes };
