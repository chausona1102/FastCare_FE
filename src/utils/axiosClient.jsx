import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fastcare_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý khi nhận được lỗi 401 (Unauthorized)
      // Ví dụ: Xóa token khỏi localStorage và chuyển hướng người dùng đến trang đăng nhập
      localStorage.removeItem('fastcare_access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;