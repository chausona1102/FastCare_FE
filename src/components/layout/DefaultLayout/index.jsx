import styles from "./DefaultLayout.module.scss";
import classNames from "classnames/bind";
import Header from "~/components/layout/components/Header";
import Footer from "~/components/layout/components/Footer";
import Chatbot from "~/components/Chatbot";
// import SideBar from "./Sidebar";

const cx = classNames.bind(styles);
function DefaultLayout({ children }) {
  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <Header />
      </div>
      <div className={cx("container")}>
        <div className={cx("content")}>{children}</div>
      </div>
      <div className={cx("footer")}>
        <Footer />
      </div>
      <Chatbot />
    </div>
  );
}

export default DefaultLayout;
