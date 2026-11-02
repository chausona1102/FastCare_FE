import style from "./OrderDetail.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosClient from "~/api/axiosClient";
import api from "~/api";
import {
  converseStatus,
  converseVND,
  formatDateHour,
} from "~/utils/functions.jsx";

const paymentMethods = {
  1: "VNPAY",
  2: "Thanh toán khi nhận hàng (COD)",
};

function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const orderFromLocation = useMemo(() => {
    if (!location.state) return null;
    return location.state.order || location.state;
  }, [location.state]);

  const [order, setOrder] = useState(orderFromLocation);
  const [loading, setLoading] = useState(!orderFromLocation);
  const [error, setError] = useState("");
  const paymentResult = new URLSearchParams(location.search).get("payment");

  useEffect(() => {
    if (order) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axiosClient.get(`${api.order}/user`);
        const orders = Array.isArray(response.data) ? response.data : [];
        const foundOrder = orders.find(
          (o) =>
            o._id === id ||
            o.id === id ||
            o.ghnOrderCode === id ||
            o.clientOrderCode === id,
        );

        if (!foundOrder) {
          setError("Không tìm thấy đơn hàng.");
        } else {
          setOrder(foundOrder);
        }
      } catch {
        setError("Tải đơn hàng thất bại. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, order]);

  const items = order?.items || [];
  const itemsTotal = items.reduce(
    (sum, item) => sum + (item.currentPrice || 0) * (item.quantity || 0),
    0,
  );
  const fee = order?.fee || {};
  const shippingFee = fee.main_service || 0;
  const insuranceFee = fee.insurance || 0;
  const couponFee = fee.coupon || 0;
  const otherFee = (fee.r2s || 0) + (fee.return || 0);

  if (loading) {
    return <div className={cx("loader")}>Đang tải chi tiết đơn hàng...</div>;
  }

  if (error) {
    return (
      <div className={cx("empty")}>
        <p className={cx("emptyText")}>{error}</p>
        <button className={cx("backBtn")} onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className={cx("wrapper")}>
      {paymentResult && (
        <div
          className={`alert ${paymentResult === "success" ? "alert-success" : "alert-warning"}`}
        >
          {paymentResult === "success"
            ? "Thanh toán VNPAY thành công."
            : paymentResult === "failed"
              ? "Thanh toán VNPAY chưa thành công. Đơn hàng vẫn đang chờ thanh toán."
              : "Không thể xác minh kết quả thanh toán VNPAY."}
        </div>
      )}
      <div className={cx("header")}>
        <button className={cx("backBtn")} onClick={() => navigate(-1)}>
          Quay lại
        </button>
        <div className={cx("pageTitle")}>Chi tiết đơn hàng</div>
      </div>

      <div className={cx("topCards")}>
        <div className={cx("infoCard")}>
          <div className={cx("infoTitle")}>Mã đơn hàng</div>
          <div className={cx("infoValue")}>
            {order._id || order.ghnOrderCode || "-"}
          </div>
          <div className={cx("infoMeta")}>
            Mã GHN: {order.ghnOrderCode || "-"}
          </div>
        </div>

        <div className={cx("infoCard")}>
          <div className={cx("infoTitle")}>Trạng thái</div>
          <div className={cx("statusBadge")}>
            {converseStatus(order.status)}
          </div>
          <div className={cx("infoMeta")}>
            {formatDateHour(order.createdAt)}
          </div>
        </div>

        <div className={cx("infoCard")}>
          <div className={cx("infoTitle")}>Thanh toán</div>
          <div className={cx("infoValue")}>
            {paymentMethods[order.paymentTypeId] || "Khác"}
          </div>
          {order.paymentTypeId === 1 && (
            <div className={cx("infoMeta")}>
              {order.paymentStatus === "paid"
                ? "Đã thanh toán"
                : order.paymentStatus === "failed"
                  ? "Thanh toán thất bại"
                  : "Đang chờ thanh toán"}
            </div>
          )}
          <div className={cx("infoMeta")}>
            {order.codeAmount > 0
              ? `Thu hộ ${converseVND(order.codeAmount)}`
              : "Không thu hộ"}
          </div>
        </div>
      </div>

      <div className={cx("body")}>
        <div className={cx("mainSection")}>
          {order.returnRequest && (
            <section className={cx("section", "returnSection")}>
              <div className={cx("sectionTitle")}>
                Cập nhật yêu cầu trả hàng
              </div>
              <p>
                <strong>Trạng thái:</strong> {converseStatus(order.status)}
              </p>
              <p>
                <strong>Lý do:</strong> {order.returnRequest.reason || "-"}
              </p>
              <p>
                <strong>Mô tả:</strong> {order.returnRequest.description || "-"}
              </p>
              {order.returnRequest.rejectionReason && (
                <p>
                  <strong>Lý do từ chối:</strong>{" "}
                  {order.returnRequest.rejectionReason}
                </p>
              )}
              {order.returnRequest.instructions && (
                <>
                  <p>
                    <strong>Hướng dẫn:</strong>{" "}
                    {order.returnRequest.instructions}
                  </p>
                  <p>
                    <strong>Hạn mang sản phẩm đến:</strong>{" "}
                    {formatDateHour(order.returnRequest.dropoffDeadline)}
                  </p>
                </>
              )}
              {order.returnRequest.receivedAt && (
                <p>
                  <strong>Đã tiếp nhận lúc:</strong>{" "}
                  {formatDateHour(order.returnRequest.receivedAt)}
                </p>
              )}
              {order.returnRequest.resolution && (
                <p>
                  <strong>Kết quả:</strong>{" "}
                  {order.returnRequest.resolution === "refund"
                    ? "Hoàn tiền"
                    : "Đổi hàng"}
                </p>
              )}
              {order.returnRequest.images?.length > 0 && (
                <div className={cx("returnImages")}>
                  {order.returnRequest.images.map((image, index) => (
                    <a
                      href={image}
                      target="_blank"
                      rel="noreferrer"
                      key={image}
                    >
                      <img
                        src={image}
                        alt={`Ảnh tình trạng sản phẩm ${index + 1}`}
                      />
                    </a>
                  ))}
                </div>
              )}
            </section>
          )}
          <div className={cx("section")}>
            <div className={cx("sectionTitle")}>Thông tin giao hàng</div>
            <div className={cx("sectionRow")}>
              <span className={cx("label")}>Người nhận</span>
              <span className={cx("value")}>{order.toName || "-"}</span>
            </div>
            <div className={cx("sectionRow")}>
              <span className={cx("label")}>Số điện thoại</span>
              <span className={cx("value")}>{order.toPhone || "-"}</span>
            </div>
            <div className={cx("sectionRow")}>
              <span className={cx("label")}>Địa chỉ</span>
              <span className={cx("value")}>{order.toAddress || "-"}</span>
            </div>
            <div className={cx("sectionRow")}>
              <span className={cx("label")}>Ghi chú người nhận</span>
              <span className={cx("value")}>
                {order.requiredNote || "Không có"}
              </span>
            </div>
            <div className={cx("sectionRow")}>
              <span className={cx("label")}>Ghi chú đơn hàng</span>
              <span className={cx("value")}>{order.note || "Không có"}</span>
            </div>
            <div className={cx("sectionRow")}>
              <span className={cx("label")}>Dự kiến giao</span>
              <span className={cx("value")}>
                {order.expectedDeliveryTime
                  ? formatDateHour(order.expectedDeliveryTime)
                  : "-"}
              </span>
            </div>
          </div>

          <div className={cx("section")}>
            <div className={cx("sectionTitle")}>Sản phẩm trong đơn</div>
            <div className={cx("itemList")}>
              {items.length === 0 ? (
                <div className={cx("empty")}>Không có sản phẩm trong đơn.</div>
              ) : (
                items.map((item) => (
                  <div key={item._id || item.code} className={cx("itemCard")}>
                    <div className={cx("itemImage")}>
                      <img
                        src={item.product?.avatar || item.variant?.images?.[0]}
                        alt={item.title || item.product?.title || "Sản phẩm"}
                      />
                    </div>
                    <div className={cx("itemContent")}>
                      <div className={cx("itemName")}>
                        {item.title || item.product?.title}
                      </div>
                      {item.variant?.storage && (
                        <div className={cx("itemMeta")}>
                          {item.variant.storage}
                        </div>
                      )}
                      {item.color && (
                        <div className={cx("itemMeta")}>Màu: {item.color}</div>
                      )}
                      <div className={cx("itemMeta")}>
                        SKU: {item.variant?.sku || item.code || "-"}
                      </div>
                    </div>
                    <div className={cx("itemSummary")}>
                      <div className={cx("itemQuantity")}>
                        x{item.quantity || 0}
                      </div>
                      <div className={cx("itemPrice")}>
                        {converseVND(item.currentPrice || 0)}
                      </div>
                      <div className={cx("itemTotal")}>
                        {converseVND(
                          (item.currentPrice || 0) * (item.quantity || 0),
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={cx("sidebar")}>
          <div className={cx("summaryBox")}>
            <div className={cx("sectionTitle")}>Tổng quan đơn hàng</div>
            <div className={cx("summaryRow")}>
              <span className={cx("summaryName")}>Sản phẩm</span>
              <span className={cx("summaryValue")}>
                {converseVND(itemsTotal)}
              </span>
            </div>
            <div className={cx("summaryRow")}>
              <span className={cx("summaryName")}>Phí vận chuyển</span>
              <span className={cx("summaryValue")}>
                {converseVND(shippingFee)}
              </span>
            </div>
            <div className={cx("summaryRow")}>
              <span className={cx("summaryName")}>Phí bảo hiểm</span>
              <span className={cx("summaryValue")}>
                {converseVND(insuranceFee)}
              </span>
            </div>
            {couponFee > 0 && (
              <div className={cx("summaryRow")}>
                <span className={cx("summaryName")}>Giảm giá</span>
                <span className={cx("summaryValue")}>
                  -{converseVND(couponFee)}
                </span>
              </div>
            )}
            {otherFee > 0 && (
              <div className={cx("summaryRow")}>
                <span className={cx("summaryName")}>Phí khác</span>
                <span className={cx("summaryValue")}>
                  {converseVND(otherFee)}
                </span>
              </div>
            )}
            <div className={cx("summaryRow", "totalRow")}>
              <span className={cx("summaryName")}>Tổng thanh toán</span>
              <span className={cx("summaryValue")}>
                {converseVND(
                  order.totalPrice ||
                    itemsTotal +
                      shippingFee +
                      insuranceFee +
                      otherFee -
                      couponFee,
                )}
              </span>
            </div>
          </div>

          <div className={cx("summaryBox")}>
            <div className={cx("sectionTitle")}>Thông tin bổ sung</div>
            <div className={cx("summaryRow")}>
              <span className={cx("summaryName")}>Mã client</span>
              <span className={cx("summaryValue")}>
                {order.clientOrderCode || "-"}
              </span>
            </div>
            <div className={cx("summaryRow")}>
              <span className={cx("summaryName")}>Khối lượng</span>
              <span className={cx("summaryValue")}>{order.weight || 0} g</span>
            </div>
            <div className={cx("summaryRow")}>
              <span className={cx("summaryName")}>Kích thước</span>
              <span className={cx("summaryValue")}>
                {order.length || 0} x {order.width || 0} x {order.height || 0}{" "}
                cm
              </span>
            </div>
            <div className={cx("noteBox")}>
              <div className={cx("noteTitle")}>Ghi chú</div>
              <p className={cx("noteText")}>
                {order.note || "Không có ghi chú"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
