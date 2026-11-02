import style from "./Order.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

import {
  converseStatus,
  hideNumberPhone,
  converseVND,
  totalPrice,
} from "~/utils/functions.jsx";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import axiosClient from "~/api/axiosClient";
import api from "~/api";
import { useAuth } from "~/hook/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "~/contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  formatDate,
  statusMatches,
  ORDER_FILTERS,
  REVIEW_TAGS,
  getOrderActions,
} from "./orderUtils";
import OrderSummary from "./OrderSummary";

function Order() {
  const { user } = useAuth();
  const [rank, setRank] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const [completedOrder, setCompletedOrder] = useState([]);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    star: 5,
    feedbackTags: {
      matchDescription: null,
      deliverySpeed: null,
      quality: null,
    },
    comment: "",
    images: [],
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnForm, setReturnForm] = useState({
    reason: "",
    description: "",
    images: [],
  });
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(api.rank)
      .then((response) => {
        setRank(response.data);
      })
      .catch((error) => {
        showToast({
          title:
            error.response?.data?.message || "Không thể tải hạng thành viên.",
          type: "error",
        });
      });
    axiosClient
      .get(`${api.order}/user`)
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setOrders(data);
        setCompletedOrder(
          data.filter(
            (o) => (o.status || "").toString().toLowerCase() === "delivered",
          ),
        );
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = orders.filter((o) => statusMatches(o, filter));
  const visible = filtered.slice(0, visibleCount);

  const openReview = (order) => {
    setReviewOrder(order);
    setReviewItem(order?.items?.[0] || null);
    setReviewForm({
      star: 5,
      feedbackTags: {
        matchDescription: null,
        deliverySpeed: null,
        quality: null,
      },
      comment: "",
      images: [],
    });
    setReviewError("");
  };

  const cancelOrder = async () => {
    if (!cancelTarget) return;

    setCancelSubmitting(true);
    try {
      await axiosClient.put(`${api.order}/cancel/${cancelTarget._id}`);
      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item._id === cancelTarget._id
            ? { ...item, status: "cancelled" }
            : item,
        ),
      );
      setCancelTarget(null);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Hủy đơn hàng thất bại. Vui lòng thử lại.",
      );
    } finally {
      setCancelSubmitting(false);
    }
  };

  const confirmReceived = async (order) => {
    const orderId = order._id || order.id;
    if (!window.confirm("Xác nhận bạn đã nhận được đơn hàng này?")) return;

    setProcessingOrderId(orderId);
    try {
      const { data: updatedOrder } = await axiosClient.put(
        `${api.order}/received/${orderId}`,
      );
      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          (item._id || item.id) === orderId
            ? { ...item, ...updatedOrder }
            : item,
        ),
      );
      setCompletedOrder((currentOrders) => [
        ...currentOrders.filter((item) => (item._id || item.id) !== orderId),
        updatedOrder,
      ]);
      showToast({ title: "Đã xác nhận nhận hàng.", type: "success" });
    } catch (error) {
      showToast({
        title:
          error.response?.data?.message || "Không thể xác nhận đã nhận hàng.",
        type: "error",
      });
    } finally {
      setProcessingOrderId("");
    }
  };

  const openReturnRequest = (order) => {
    setReturnTarget(order);
    setReturnForm({ reason: "", description: "", images: [] });
    setReturnError("");
  };

  const requestReturn = async (event) => {
    event.preventDefault();
    if (!returnTarget) return;

    const orderId = returnTarget._id || returnTarget.id;
    setReturnSubmitting(true);
    setReturnError("");
    try {
      const formData = new FormData();
      formData.append("reason", returnForm.reason);
      formData.append("description", returnForm.description.trim());
      returnForm.images.forEach((image) => formData.append("images", image));
      const { data: updatedOrder } = await axiosClient.post(
        `${api.order}/return/${encodeURIComponent(orderId)}`,
        formData,
      );
      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          (item._id || item.id) === orderId
            ? { ...item, ...updatedOrder }
            : item,
        ),
      );
      setCompletedOrder((currentOrders) =>
        currentOrders.filter((item) => (item._id || item.id) !== orderId),
      );
      setReturnTarget(null);
      showToast({ title: "Đã gửi yêu cầu trả hàng.", type: "success" });
    } catch (error) {
      setReturnError(
        error.response?.data?.message ||
          "Gửi yêu cầu trả hàng thất bại. Vui lòng thử lại.",
      );
    } finally {
      setReturnSubmitting(false);
    }
  };

  const closeReview = () => {
    if (!reviewSubmitting) setReviewOrder(null);
  };

  const submitReview = async (event) => {
    event.preventDefault();

    const orderId = reviewOrder?._id || reviewOrder?.id;
    const productId =
      reviewItem?.product?._id ||
      reviewItem?.product?.id ||
      reviewItem?.product ||
      reviewItem?.productId;
    const variantId =
      reviewItem?.variant?._id ||
      reviewItem?.variant?.id ||
      reviewItem?.variant ||
      reviewItem?.variantId;
    const userId = user?._id || user?.id;

    if (!orderId || !productId || !variantId) {
      setReviewError("Không tìm thấy thông tin sản phẩm để đánh giá.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");
    try {
      const formData = new FormData();
      formData.append("order", orderId);
      formData.append("product", productId);
      formData.append("variant", variantId);
      if (userId) formData.append("user", userId);
      formData.append("star", String(reviewForm.star));
      Object.entries(reviewForm.feedbackTags || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`feedbackTags[${key}]`, String(Boolean(value)));
        }
      });
      formData.append(
        "feedbackTags",
        JSON.stringify(reviewForm.feedbackTags || {}),
      );
      formData.append("comment", reviewForm.comment.trim());
      reviewForm.images.forEach((image) => formData.append("images", image));

      await axiosClient.post(api.feedback, formData);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          (order._id || order.id) === orderId
            ? { ...order, isRating: true }
            : order,
        ),
      );
      setCompletedOrder((currentOrders) =>
        currentOrders.map((order) =>
          (order._id || order.id) === orderId
            ? { ...order, isRating: true }
            : order,
        ),
      );
      setReviewOrder(null);
    } catch (error) {
      setReviewError(
        error.response?.data?.message ||
          "Gửi đánh giá thất bại. Vui lòng thử lại.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      {console.log(rank)}
      <OrderSummary
        user={user}
        completedOrder={completedOrder}
        totalPrice={totalPrice}
        hideNumberPhone={hideNumberPhone}
        converseVND={converseVND}
        rank={rank}
      />
      <div className={cx("order")}>
        <h1 className={cx("title", "fs-2 mb-4")}>Đơn hàng của tôi</h1>
        <div className={cx("controls")}>
          <div className={cx("tabs")}>
            {ORDER_FILTERS.map((f) => (
              <button
                key={f.key}
                className={cx("tab", { active: filter === f.key })}
                onClick={() => setFilter(f.key)}
              >
                <FontAwesomeIcon icon={f.icon} className={cx("tabIcon")} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className={cx("content")}>
          {loading ? (
            <div className={cx("loader")}>Đang tải đơn hàng...</div>
          ) : !filtered || filtered.length === 0 ? (
            <div className={cx("empty")}>
              <div className={cx("emptyIcon")}></div>
              <p className={cx("emptyText")}>Bạn chưa có đơn hàng nào.</p>
              <p className={cx("emptySub")}>
                Hãy mua sắm để tạo đơn hàng đầu tiên.
              </p>
            </div>
          ) : (
            <div className={cx("orderList")}>
              {visible.map((o) => (
                <div className={cx("orderItem")}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      navigate(`/order/${o._id || o.id}`, {
                        state: { order: o },
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        navigate(`/order/${o._id || o.id}`);
                    }}
                    className={cx("orderCard", "flex-fill")}
                    key={o._id || o.id || Math.random()}
                  >
                    <div className={cx("cardLeft")}>
                      <div className={cx("orderCode")}>
                        {o.items[0].title || "-"}
                      </div>
                      <img
                        src={o.items[0].product.avatar}
                        alt={o.items[0].title}
                        className={cx("productAvatar")}
                      />
                      <div className={cx("orderDate")}>
                        {formatDate(o.createdAt || Date.now())}
                      </div>
                      <div className={cx("orderItems")}>
                        <span>
                          {(o.items && o.items.length) || o.itemCount || 0} sản
                          phẩm
                        </span>
                      </div>
                    </div>
                    <div className={cx("cardRight")}>
                      <div className={cx("orderTotal")}>
                        {converseVND(o.totalPrice || o.amount || o.price)}
                      </div>
                      <div className={cx("orderStatus")}>
                        {(converseStatus(o.status) || "-").toString()}
                      </div>
                    </div>
                  </div>
                  <div className={cx("actions")}>
                    {getOrderActions(o).map((action) => (
                      <button
                        key={`${o._id || o.id || "order"}-${action.key}`}
                        type="button"
                        disabled={
                          action.disabled ||
                          processingOrderId === (o._id || o.id)
                        }
                        className={[
                          "rounded px-3 py-1 fs-5 fw-bold my-1 mx-1",
                          action.key === "return"
                            ? "border border-danger text-danger"
                            : "",
                          action.key === "review"
                            ? "border border-warning text-warning"
                            : "",
                          action.key === "buyAgain"
                            ? "border border-primary text-primary"
                            : "",
                          action.key === "received"
                            ? "border border-success text-success"
                            : "",
                          action.key === "reviewed"
                            ? "border border-secondary text-secondary"
                            : "",
                          action.key === "cancel" && !action.disabled
                            ? "border border-danger text-danger"
                            : "",
                          action.disabled
                            ? "opacity-50 border border-secondary text-secondary"
                            : "",
                        ].join(" ")}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (action.key === "review") openReview(o);
                          if (action.key === "buyAgain")
                            navigate(
                              `/product-detail/${o.items[0]?.product.id || o.items[0]?.product._id}`,
                            );
                          if (action.key === "cancel") setCancelTarget(o);
                          if (action.key === "received") confirmReceived(o);
                          if (action.key === "return") openReturnRequest(o);
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="rounded px-3 py-1 fs-5 fw-bold my-1 mx-1 border border-primary text-primary"
                      onClick={() =>
                        navigate(`/order/${o._id || o.id}`, {
                          state: { order: o },
                        })
                      }
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
              {visibleCount < filtered.length && (
                <div className={cx("loadMoreWrap")}>
                  <button
                    className={cx("loadMore")}
                    onClick={() => setVisibleCount((v) => v + 8)}
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          )}
          {cancelTarget &&
            createPortal(
              <div
                className={cx("modalBackdrop")}
                role="presentation"
                onMouseDown={() => !cancelSubmitting && setCancelTarget(null)}
              >
                <div
                  className={cx("confirmModal")}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className={cx("modalHeader")}>
                    <div className="text-center w-100">
                      <h2>Xác nhận hủy đơn hàng</h2>
                      <p>{cancelTarget._id}?</p>
                    </div>
                    <button
                      type="button"
                      className={cx("closeModal")}
                      onClick={() => !cancelSubmitting && setCancelTarget(null)}
                      aria-label="Đóng"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>

                  <p className={cx("confirmMessage")}>
                    Sau khi hủy, đơn hàng sẽ được chuyển sang trạng thái đã hủy
                    và không thể hoàn tác.
                  </p>

                  <div className={cx("modalFooter")}>
                    <button
                      type="button"
                      className={cx("secondaryButton")}
                      onClick={() => !cancelSubmitting && setCancelTarget(null)}
                    >
                      Quay lại
                    </button>
                    <button
                      type="button"
                      className={cx("submitReview")}
                      onClick={cancelOrder}
                      disabled={cancelSubmitting}
                    >
                      {cancelSubmitting ? "Đang hủy..." : "Xác nhận hủy"}
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {returnTarget &&
            createPortal(
              <div
                className={cx("modalBackdrop")}
                role="presentation"
                onMouseDown={() => !returnSubmitting && setReturnTarget(null)}
              >
                <form
                  className={cx("reviewModal")}
                  onSubmit={requestReturn}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className={cx("modalHeader")}>
                    <div>
                      <h2>Yêu cầu trả hàng</h2>
                      <p>
                        Hạn gửi yêu cầu:{" "}
                        {formatDate(
                          new Date(
                            new Date(returnTarget.updatedAt).getTime() +
                              12 * 24 * 60 * 60 * 1000,
                          ),
                        )}
                        . Nếu được duyệt, vui lòng mang sản phẩm đến cửa hàng
                        trước thời hạn này.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={cx("closeModal")}
                      onClick={() => !returnSubmitting && setReturnTarget(null)}
                      aria-label="Đóng"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>

                  <label className={cx("fieldLabel")} htmlFor="returnReason">
                    Lý do trả hàng
                  </label>
                  <select
                    id="returnReason"
                    className={cx("reviewSelect")}
                    value={returnForm.reason}
                    onChange={(event) =>
                      setReturnForm((form) => ({
                        ...form,
                        reason: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Chọn lý do</option>
                    <option value="Sản phẩm lỗi/hư hỏng">
                      Sản phẩm lỗi/hư hỏng
                    </option>
                    <option value="Sai sản phẩm hoặc phụ kiện">
                      Sai sản phẩm hoặc phụ kiện
                    </option>
                    <option value="Không đúng mô tả">Không đúng mô tả</option>
                    <option value="Khác">Khác</option>
                  </select>

                  <label
                    className={cx("fieldLabel")}
                    htmlFor="returnDescription"
                  >
                    Mô tả tình trạng sản phẩm
                  </label>
                  <textarea
                    id="returnDescription"
                    className={cx("reviewTextarea")}
                    value={returnForm.description}
                    onChange={(event) =>
                      setReturnForm((form) => ({
                        ...form,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Mô tả lỗi/tình trạng sản phẩm và phụ kiện đi kèm"
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                    required
                  />

                  <label className={cx("imageInput")} htmlFor="returnImages">
                    Ảnh tình trạng sản phẩm (không bắt buộc, tối đa 5 ảnh,
                    JPG/PNG/WebP, mỗi ảnh tối đa 5 MB)
                  </label>
                  <input
                    id="returnImages"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []);
                      setReturnError("");
                      if (files.length > 5) {
                        setReturnError("Chỉ được chọn tối đa 5 ảnh.");
                        event.target.value = "";
                        return;
                      }
                      if (files.some((file) => file.size > 5 * 1024 * 1024)) {
                        setReturnError("Mỗi ảnh không được vượt quá 5 MB.");
                        event.target.value = "";
                        return;
                      }
                      setReturnForm((form) => ({ ...form, images: files }));
                    }}
                  />
                  {returnError && (
                    <p className={cx("reviewError")} role="alert">
                      {returnError}
                    </p>
                  )}
                  <div className={cx("modalFooter")}>
                    <button
                      type="button"
                      className={cx("secondaryButton")}
                      onClick={() => !returnSubmitting && setReturnTarget(null)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className={cx("submitReview")}
                      disabled={returnSubmitting}
                    >
                      {returnSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                    </button>
                  </div>
                </form>
              </div>,
              document.body,
            )}

          {/* Modal đánh giá */}
          {reviewOrder &&
            createPortal(
              <div
                className={cx("modalBackdrop")}
                role="presentation"
                onMouseDown={closeReview}
              >
                <form
                  className={cx("reviewModal")}
                  onSubmit={submitReview}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className={cx("modalHeader")}>
                    <div>
                      <h2>Đánh giá sản phẩm</h2>
                      <p>Chia sẻ trải nghiệm để giúp người mua khác.</p>
                    </div>
                    <button
                      type="button"
                      className={cx("closeModal")}
                      onClick={closeReview}
                      aria-label="Đóng"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>

                  <label className={cx("fieldLabel")} htmlFor="reviewProduct">
                    Sản phẩm
                  </label>
                  <select
                    id="reviewProduct"
                    className={cx("reviewSelect")}
                    value={reviewItem?._id || ""}
                    onChange={(event) =>
                      setReviewItem(
                        reviewOrder.items.find(
                          (item) => item._id === event.target.value,
                        ),
                      )
                    }
                  >
                    {(reviewOrder.items || []).map((item) => (
                      <option value={item._id} key={item._id}>
                        {item.title} {item.color ? `- ${item.color}` : ""}
                      </option>
                    ))}
                  </select>

                  <div className={cx("fieldLabel")}>Mức độ hài lòng</div>
                  <div
                    className={cx("stars")}
                    role="radiogroup"
                    aria-label="Số sao đánh giá"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={cx("starButton", {
                          selected: star <= reviewForm.star,
                        })}
                        onClick={() =>
                          setReviewForm((form) => ({ ...form, star }))
                        }
                        aria-label={`${star} sao`}
                      >
                        <FontAwesomeIcon icon={faStar} />
                      </button>
                    ))}
                  </div>

                  <div className={cx("fieldLabel")}>Điều bạn hài lòng</div>
                  <div className={cx("tagList")}>
                    {REVIEW_TAGS.map(([key, label]) => (
                      <button
                        type="button"
                        key={key}
                        className={cx("reviewTag", {
                          active: reviewForm.feedbackTags[key] === true,
                        })}
                        onClick={() =>
                          setReviewForm((form) => ({
                            ...form,
                            feedbackTags: {
                              ...form.feedbackTags,
                              [key]:
                                form.feedbackTags[key] === true ? null : true,
                            },
                          }))
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <label className={cx("fieldLabel")} htmlFor="reviewComment">
                    Nhận xét
                  </label>
                  <textarea
                    id="reviewComment"
                    className={cx("reviewTextarea")}
                    value={reviewForm.comment}
                    onChange={(event) =>
                      setReviewForm((form) => ({
                        ...form,
                        comment: event.target.value,
                      }))
                    }
                    placeholder="Sản phẩm dùng có tốt không?"
                    required
                    minLength={1}
                    rows={4}
                  />
                  <label className={cx("imageInput")} htmlFor="reviewImages">
                    Thêm ảnh (tối đa 10 ảnh)
                  </label>
                  <input
                    id="reviewImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) =>
                      setReviewForm((form) => ({
                        ...form,
                        images: Array.from(event.target.files || []).slice(
                          0,
                          10,
                        ),
                      }))
                    }
                  />
                  {reviewError && (
                    <p className={cx("reviewError")}>{reviewError}</p>
                  )}
                  <div className={cx("modalFooter")}>
                    <button
                      type="button"
                      className={cx("secondaryButton")}
                      onClick={closeReview}
                    >
                      Để sau
                    </button>
                    <button
                      type="submit"
                      className={cx("submitReview")}
                      disabled={reviewSubmitting}
                    >
                      {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </form>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </React.Fragment>
  );
}

export default Order;
