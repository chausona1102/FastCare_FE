import styles from "./Title.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

function Title({ title, className }) {
  return <h2 className={cx("title", className)}>{title}</h2>;
}
export default Title;
