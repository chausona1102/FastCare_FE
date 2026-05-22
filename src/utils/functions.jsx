const converseVND = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "vnd",
  }).format(price);
};

const converseKilo = (num) => {
  if (num < 100) return num;
  return `${num / 1000}K`;
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

export { converseVND, converseKilo, formatDate, formatDateHour };
