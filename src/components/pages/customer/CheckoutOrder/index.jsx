import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '~/api/axiosClient';
import api from '~/api';
import { useToast } from '~/contexts/ToastContext.jsx';

export default function CheckoutOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { token } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  const selectedIds = useMemo(() => location.state?.selectedItemIds ?? [], [location.state]);
  const checkoutItems = useMemo(() => location.state?.checkoutItems ?? null, [location.state]);

  const selectedItems = useMemo(() => {
    if (checkoutItems?.length) {
      return checkoutItems.map((item) => ({
        ...item,
        _id: item._id || `${item.product}-${item.variant}`,
      }));
    }

    return cartItems.filter((item) => selectedIds.includes(item._id) && !item.variant?.deleteAt);
  }, [cartItems, checkoutItems, selectedIds]);

  const [paymentTypeId, setPaymentTypeId] = useState(2);
  const [requiredNote, setRequiredNote] = useState('CHOXEMHANGKHONGTHU');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      showToast({ title: 'Vui lòng đăng nhập để đặt hàng', type: 'warning' });
      navigate('/login');
      return;
    }

    if (!selectedIds.length && !selectedItems.length) {
      showToast({ title: 'Vui lòng chọn sản phẩm trước khi thanh toán', type: 'warning' });
      navigate('/cart');
    }
  }, [navigate, selectedIds.length, selectedItems.length, showToast, token]);

  const totalPrice = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item.currentPrice || 0) * item.quantity, 0),
    [selectedItems]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedItems.length) {
      showToast({ title: 'Không có sản phẩm nào để đặt hàng', type: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        note,
        requiredNote,
        paymentTypeId: Number(paymentTypeId),
        items: selectedItems.map((item) => ({
          product: item.product?._id || item.product,
          variant: item.variant?._id || item.variant,
          color: item.color || '',
          title: item.product?.title || item.title || 'Sản phẩm',
          quantity: item.quantity || 1,
          currentPrice: item.currentPrice || 0,
          weight: item.product?.weight || 500,
          height: item.product?.height || 20,
          length: item.product?.length || 15,
          width: item.product?.width || 20,
        })),
      };

      const response = await axiosClient.post(api.order, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Number(paymentTypeId) === 1) {
        const paymentUrl = response.data?.paymentUrl;
        if (!paymentUrl) {
          throw new Error('Không tạo được liên kết thanh toán VNPAY.');
        }
        window.location.assign(paymentUrl);
        return;
      }

      showToast({ title: 'Đặt hàng thành công', type: 'success' });
      navigate('/');
    } catch (error) {
      showToast({
        title: error?.response?.data?.message || error.message || 'Đặt hàng thất bại. Vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedItems.length) {
    return (
      <div className="container py-5">
        <div className="alert alert-info rounded-4">Đang chuẩn bị thông tin giỏ hàng...</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h2 className="fw-bold mb-4">Hoàn tất đặt hàng</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-3">Phương thức thanh toán</label>
                  <select
                    className="form-select fs-4"
                    value={paymentTypeId}
                    onChange={(event) => setPaymentTypeId(event.target.value)}
                  >
                    <option value="2">Thanh toán khi nhận hàng (COD)</option>
                    <option value="1">Thanh toán online</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold fs-3">Yêu cầu giao hàng</label>
                  <select
                    className="form-select fs-4"
                    value={requiredNote}
                    onChange={(event) => setRequiredNote(event.target.value)}
                  >
                    <option value="CHOXEMHANGKHONGTHU">Cho xem hàng, không thử</option>
                    <option value="CHOXEMHANGTHU">Cho xem hàng, thử</option>
                    <option value="KHONGCHOXEMHANG">Không cho xem hàng</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold fs-3">Ghi chú</label>
                  <textarea
                    className="form-control fs-4"
                    rows="4"
                    placeholder="Ví dụ: Giao ngoài giờ hành chính"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-danger w-100 rounded-pill py-2 fs-4" disabled={submitting}>
                  {submitting ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-3">Đơn hàng của bạn</h4>

              <div className="d-flex flex-column gap-3 mb-4">
                {selectedItems.map((item) => (
                  <div key={item._id} className="d-flex align-items-start gap-3 border-bottom pb-3">
                    <div className="flex-grow-1">
                      <div className="fw-semibold">
                        {item.product?.title || item.title || 'Sản phẩm'}
                      </div>
                      <div className="text-secondary small">
                        {item.color ? `${item.color} • ` : ''}
                        {item.quantity} × {item.currentPrice?.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    <div className="fw-semibold text-danger">
                      {(item.currentPrice * item.quantity).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mb-2 text-secondary">
                <span>Tạm tính</span>
                <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5 text-danger">
                <span>Tổng thanh toán</span>
                <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
