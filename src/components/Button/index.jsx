import classNames from "classnames/bind";
import styles from "./Button.module.scss";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const cx = classNames.bind(styles);

function Button({
  to,
  href,
  primary = false,
  outline = false,
  secondary = false,
  text = false,
  rounded,
  size = "small",
  light,
  dart,
  disabled,
  children,
  className,
  leftIcon,
  rightIcon,
  onClick,
  ...passProps
}) {
  let Comp = "button";
  const props = {
    onClick,
    ...passProps,
  };
  if (to) {
    props.to = to;
    Comp = Link;
  } else if (href) {
    props.href = href;
    Comp = "a";
  }
  //   Remove eventlistener when Button has disabled attr.
  if (disabled) {
    Object.keys(props).forEach((key) => {
      if (key.startsWith("on") && typeof props[key] === "function") {
        delete props[key];
      }
    });
  }
  const classes = cx("wrapper", {
    [className]: className,
    primary,
    outline,
    secondary,
    light,
    dart,
    [size]: size,
    text,
    disabled,
    rounded,
  });
  return (
    <Comp className={classes} {...props}>
      {leftIcon && (
        <span className={cx("icon")}>
          <FontAwesomeIcon icon={leftIcon} />
        </span>
      )}
      <span className={cx("title")}>{children}</span>
      {rightIcon && (
        <span className={cx("icon")}>
          <FontAwesomeIcon icon={rightIcon} />
        </span>
      )}
    </Comp>
  );
}

export default Button;
