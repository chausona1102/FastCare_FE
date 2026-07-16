# Báo cáo thay đổi cho trang Order

Ngày: 2026-07-16

Tác vụ đã thực hiện:

- **Thiết kế lại giao diện trang `Order`**: Cập nhật component `index.jsx` để hiển thị bộ lọc trạng thái, trạng thái tải, giao diện khi không có đơn hàng và danh sách đơn hàng theo thẻ.
- **Thêm kiểu dáng**: Tạo/viết nội dung cho `Order.module.scss` để cung cấp kiểu cho các thành phần mới (tabs, card, empty state, loader).
- **Báo cáo này**: Tạo file `order.md` để lưu lại những thay đổi và hướng dẫn ngắn.

Ghi chú kỹ thuật:

- API: component vẫn sử dụng endpoint `GET ${api.order}/user` với header `Authorization: Bearer <token>` lấy từ `localStorage.fastcare_access_token`.
- Dự phòng: component xử lý trường hợp dữ liệu không đúng định dạng (không phải mảng) và hiển thị thông báo rỗng khi không có đơn hàng.
- Trường dữ liệu: component hiển thị các trường phổ biến nếu có: `code`, `createdAt`, `items.length`, `total` (thử kiểm tra backend để đồng bộ tên trường nếu khác).

Gợi ý tiếp theo (tùy chọn):

- Thêm chức năng xem chi tiết (navigate tới trang order detail) khi click vào card. (Làm tiếp phần này)
- Thêm phân trang hoặc lazy load nếu số lượng đơn lớn. (Làm tiếp phần này)
- Tùy chỉnh format ngày/tiền theo locale chính xác của ứng dụng. (Làm tiếp phần này)

Những thay đổi đã thực hiện tiếp theo:

- **Xem chi tiết**: Khi click vào một `orderCard`, sẽ điều hướng tới đường dẫn `/order/{id}`. Hỗ trợ keyboard (Enter) cho accessibility.
- **Phân trang / lazy load**: Thêm chế độ client-side `Load more` (mặc định hiển thị 8 đơn), nhấn `Xem thêm` để nạp thêm.
- **Locale formatting**: Sử dụng `Intl.NumberFormat` và `Intl.DateTimeFormat` (mặc định `vi-VN`) để format tiền và ngày giờ.

Lưu ý triển khai:

- Nếu backend hỗ trợ paging, cân nhắc chuyển từ client-side load-more sang API paging để tối ưu hiệu năng.
- Điều chỉnh route chi tiết đơn tùy theo route thực tế của ứng dụng nếu khác `/order/{id}`.

