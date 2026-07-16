import styles from "./HeaderOnly.module.scss";
import classNames from "classnames/bind";
import Header from "~/components/layout/components/Header";
import Footer from "~/components/layout/components/Footer";
// import SideBar from "./Sidebar";

const cx = classNames.bind(styles);
function HeaderOnly({ children }) {
  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <Header />
      </div>
      <div className={cx("container")}>
        <div className={cx("content")}>{children}</div>
      </div>
    </div>
  );
}

export default HeaderOnly;
