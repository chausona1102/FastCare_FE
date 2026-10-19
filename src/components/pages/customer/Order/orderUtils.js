import { faTruck, faPeopleCarryBox, faBox } from "@fortawesome/free-solid-svg-icons";


export function formatDate(dateVal, locale = 'vi-VN') {
  try {
    const d = new Date(dateVal);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (e) {
    return new Date(dateVal).toLocaleString();
  }
}

export function statusMatches(order, filterKey) {
  if (filterKey === 'all') return true;
  if (!order) return false;

  const s = (order.status || '').toString().toLowerCase();

  if (filterKey === 'reviewed') {
    return s === 'delivered' && Boolean(order?.isRating);
  }

  if (filterKey === 'delivered') {
    return s === 'delivered' && !Boolean(order?.isRating);
  }

  if (filterKey === 'returns') {
    return s.startsWith('return');
  }

  return s.includes(filterKey);
}

export const ORDER_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'ready_to_pick', label: 'Đang xử lý' },
  { key: 'picked', label: 'Đang vận chuyển', icon: faTruck },
  { key: 'delivering', label: 'Đang giao hàng', icon: faPeopleCarryBox },
  { key: 'delivered', label: 'Đã nhận hàng', icon: faBox },
  { key: 'reviewed', label: 'Đã đánh giá' },
  { key: 'cancel', label: 'Đã hủy' },
  { key: 'returns', label: 'Trả hàng' },
];

export const REVIEW_TAGS = [
  ['matchDescription', 'Đúng mô tả'],
  ['deliverySpeed', 'Giao hàng nhanh'],
  ['quality', 'Chất lượng tốt'],
];

export function getOrderActions(order) {
  const status = (order?.status || '').toString().toLowerCase();

  if (status === 'delivering') {
    return [{ key: 'received', label: 'Đã nhận', disabled: false }];
  }

  if (status === 'delivered') {
    const updatedAt = new Date(order.updatedAt).getTime();
    const returnWindowOpen = Number.isFinite(updatedAt)
      && Date.now() <= updatedAt + 12 * 24 * 60 * 60 * 1000;
    return [
      { key: 'return', label: 'Yêu cầu trả hàng', disabled: !returnWindowOpen },
      order.isRating
        ? { key: 'reviewed', label: 'Đã đánh giá', disabled: true }
        : { key: 'review', label: 'Đánh giá', disabled: false },
    ];
  }

  if (status === 'return_request') {
    return [{ key: 'returnStatus', label: 'Chờ duyệt', disabled: true }];
  }
  if (status === 'return_rejected') {
    return [{ key: 'returnStatus', label: 'Bị từ chối', disabled: true }];
  }
  if (status === 'return_approved') {
    return [{ key: 'returnStatus', label: 'Đã duyệt', disabled: true }];
  }
  if (status === 'return_received') {
    return [{ key: 'returnStatus', label: 'Đã tiếp nhận', disabled: true }];
  }
  if (status === 'return_completed') {
    return [{ key: 'returnStatus', label: 'Hoàn tất', disabled: true }];
  }
  if (status === 'return_expired') {
    return [{ key: 'returnStatus', label: 'Quá hạn', disabled: true }];
  }

  if (status === 'pending') {
    return [{ key: 'cancel', label: 'Hủy đơn hàng', disabled: false }];
  }

  return [{ key: 'cancel', label: 'Hủy đơn hàng', disabled: true }];
}
