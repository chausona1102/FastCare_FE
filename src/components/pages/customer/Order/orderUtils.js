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

  return s.includes(filterKey);
}

export const ORDER_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'ready_to_pick', label: 'Đang xử lý' },
  { key: 'picked', label: 'Đang vận chuyển' },
  { key: 'delivering', label: 'Đang giao hàng' },
  { key: 'delivered', label: 'Đã nhận hàng' },
  { key: 'reviewed', label: 'Đã đánh giá' },
  { key: 'cancel', label: 'Đã hủy' },
];

export const REVIEW_TAGS = [
  ['matchDescription', 'Đúng mô tả'],
  ['deliverySpeed', 'Giao hàng nhanh'],
  ['quality', 'Chất lượng tốt'],
];

export function getOrderActions(order) {
  const status = (order?.status || '').toString().toLowerCase();

  if (status === 'delivering') {
    return [
      { key: 'received', label: 'Đã nhận', disabled: false },
      { key: 'return', label: 'Trả hàng', disabled: !order?.ghnOrderCode },
    ];
  }

  if (status === 'delivered' && Boolean(order?.isRating)) {
    return [{ key: 'reviewed', label: 'Đã đánh giá', disabled: true }];
  }

  if (status === 'delivered') {
    return [{ key: 'review', label: 'Đánh giá', disabled: false }];
  }

  if (status === 'pending') {
    return [{ key: 'cancel', label: 'Hủy đơn hàng', disabled: false }];
  }

  return [{ key: 'cancel', label: 'Hủy đơn hàng', disabled: true }];
}
