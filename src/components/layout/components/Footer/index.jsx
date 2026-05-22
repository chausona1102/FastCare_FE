import style from "./Footer.module.scss";
import classNames from "classnames/bind";
import Title from "~/components/Title";
import { facebook, tiktok, youtube } from "~/assets/images";
const cx = classNames.bind(style);

function Footer() {
  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        <div className={cx("content")}>
          <div className={cx("help")}>
            <Title title="Tổng đài hỗ trợ miễn phí" className={cx("title")} />
            <span>
              Mua hàng - bảo hành <b>1999 9999</b> (7h30 - 22h00)
            </span>
            <span>
              Khiếu nại <b>1999 9999</b> (8h00 - 20h00)
            </span>
            <Title title="Phương thức thanh toán" className={cx("title")} />
          </div>
          <div className={cx("policy-information")}>
            <Title title="Thông tin về chính sách" className={cx("title")} />
            <a href="#">Mua hàng và thanh toán online</a>
            <a href="#">Mua hàng trả góp</a>
            <a href="#">Mua hàng trả góp bằng thẻ tín dụng</a>
            <a href="#">Chính sách giao hàng</a>
            <a href="#">Chính sách đổi trả</a>
            <a href="#">Xem ưu đãi Smember</a>
            <a href="#">Tra thông tin bảo hành</a>
            <a href="#">Tra cứu hoá đơn điện tử</a>
            <a href="#">Thông tin hoá đơn mua hàng</a>
            <a href="#">Trung tâm bảo hành chính hãng</a>
            <a href="#">Quy định về việc sao lưu dữ liệu</a>
            <a href="#">Chính sách khui hộp sản phẩm Apple</a>
          </div>
          <div className={cx("more-service")}>
            <Title title="Dịch vụ và thông tin khác" className={cx("title")} />
            <a href="#">Khách hàng doanh nghiệp (B2B)</a>
            <a href="#">Ưu đãi thanh toán</a>
            <a href="#">Quy chế hoạt động</a>
            <a href="#">Chính sách bảo mật thông tin cá nhân</a>
            <a href="#">Chính sách Bảo hành</a>
            <a href="#">Liên hệ hợp tác kinh doanh</a>
            <a href="#">Tuyển dụng</a>
            <a href="#">Dịch vụ bảo hành mở rộng</a>
            <Title
              title="Mua sắm dễ dàng – Ưu đãi ngập tràn cùng app FastCare"
              className={cx("title")}
            />
          </div>
          <div className={cx("connection")}>
            <Title title="Kết nối với FastCare" className={cx("title")} />
            <div className={cx("social")}>
              <span>
                <img src={facebook} />
              </span>
              <span>
                <img src={tiktok} />
              </span>
              <span>
                <img src={youtube} />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={cx("address")}>
        <div className={cx("container")}>
          <span>
            Công ty TNHH Thương Mại và Dịch Vụ Kỹ Thuật MTV FastCare - GPĐKKD:
            0375319105 cấp tại Sở KH & ĐT TP. Cần Thơ.
          </span>
          <span>
            Địa chỉ văn phòng: Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh
            Kiều, TP. Cần Thơ.
          </span>
          <span>Điện thoại: 028.7108.9666.</span>
        </div>
      </div>
    </div>
  );
}

export default Footer;
