const converseVND = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "vnd",
  }).format(price);
};

const converseKilo = (num) => {
  if (num < 100) return num;
  return `${(num / 1000).toFixed(1)}K`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const formatDateHour = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const converseStatus = (status) => {
  switch(status) {
    case "pending": 
      return "Đang chờ xác nhận";
    case "ready_to_pick": 
      return "Chờ lấy hàng";
    case "picking": 
      return "Đang lấy hàng";
    case "cancel": 
      return "Đã hủy";
    case "money_collect_picking": 
      return "Đang thu tiền lấy hàng";
    case "picked": 
      return "Đã lấy hàng";
    case "storing": 
      return "Đã đến kho trung chuyển";
    case "transporting": 
      return "Đơn hàng đang vận chuyển";
    case "sorting": 
      return "Đang phân loại hàng";
    case "delivering": 
      return "Đang giao đến bạn";
    case "money_collect_delivering": 
      return "Đang thu tiền giao hàng";
    case "delivered": 
      return "Đã giao hàng thành công";
    case "delivery_fail": 
      return "Giao hàng thất bại";
    case "waiting_to_return": 
      return "Chờ trả hàng";
    case "return": 
      return "Trả hàng";
    case "return_transporting": 
      return "Đang vận chuyển trả hàng";
    case "return_sorting": 
      return "Đang phân loại hàng trả";
    case "returning": 
      return "Đang trả hàng";
    case "return_fail": 
      return "Trả hàng thất bại";
    case "returned": 
      return "Đã trả hàng thành công";
    case "exception": 
      return "Đơn hàng gặp sự cố";
    default: 
      return "Đang chờ lấy hàng";
  }
}

const hideNumberPhone = (phone) => {
  return phone
    .split("")
    .map((char, i) => {
      if (i > 2 && i < 8) {
        return "*";
      } else {
        return char;
      }
    })
    .join("");
}

function totalPrice(orders) {
  const total = 0;
  return orders.reduce((total, o) => total + o.totalPrice, 0);
}


export { converseVND, converseKilo, formatDate, formatDateHour, converseStatus, hideNumberPhone, totalPrice };
