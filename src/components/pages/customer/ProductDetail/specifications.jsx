

import style from "./ProductDetail.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faGift } from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";

import Title from "~/components/Title";

function Specifications({ product, handleBuyNow, handleAddToCart }) {
  return (
    <div className={cx("specifications")}>
      <div className={cx("container")}>
        <div className={cx("table")}>
          <Title className={cx("title")} title="Thông số kỹ thuật" />
          <table>
            <tbody>
              <tr>
                <th scope="row">Kích thước màn hình</th>
                <td>{product.screenSize} inches</td>
              </tr>
              <tr>
                <th scope="row">Công nghệ màn hình</th>
                <td>{product.displayTech}</td>
              </tr>
              <tr>
                <th scope="row">Cam trước</th>
                <td>{product.frontCamera}</td>
              </tr>
              <tr>
                <th scope="row">Cam sau</th>
                <td>{product.rearCamera}</td>
              </tr>
              <tr>
                <th scope="row">Chipset</th>
                <td>{product.chipset}</td>
              </tr>
              <tr>
                <th scope="row">Công nghệ NFC</th>
                <td>{product.nfc}</td>
              </tr>
              <tr>
                <th scope="row">Ram</th>
                <td>{product.ram}</td>
              </tr>
              <tr>
                <th scope="row">Bộ nhớ trong</th>
                <td>{product.storage}</td>
              </tr>
              <tr>
                <th scope="row">Sim</th>
                <td>{product.sim}</td>
              </tr>
              <tr>
                <th scope="row">Hệ điều hành</th>
                <td>{product.os}</td>
              </tr>
              <tr>
                <th scope="row">Độ phân giải</th>
                <td>{product.screenResolution}</td>
              </tr>
              <tr>
                <th scope="row">CPU</th>
                <td>{product.cpu}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={cx("preferential")}>
          {product.discount > 0 && (
            <div className={cx("discount")}>
              <h3>
                <FontAwesomeIcon icon={faGift} />
                <span>Ưu đãi</span>
              </h3>
              <span>- Giảm giá {product.discount}%</span>
            </div>
          )}
          <div className={cx("actions")}>
            {product.installment > 0 && (
              <>
                <button className={cx("installment")}>
                  <span>Trả góp {product.installment}%</span>
                </button>
                <button className={cx("buy-now")} onClick={handleBuyNow}>
                  <h2>Mua ngay</h2>
                  <span>Giao hàng online hoặc nhận tại cửa hàng</span>
                </button>
                <Tippy>
                  <button className={cx("add-cart")} onClick={handleAddToCart}>
                    <FontAwesomeIcon icon={faCartPlus} />
                  </button>
                </Tippy>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Specifications;