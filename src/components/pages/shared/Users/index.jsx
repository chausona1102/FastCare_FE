import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faLock,
  faLockOpen,
  faPen,
  faPlus,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import { LoadingProduct } from "~/components/Loading";
import styles from "./Users.module.scss";

const cx = classNames.bind(styles);
const USERS_PER_PAGE = 10;
const INITIAL_FORM = {
  username: "",
  fullname: "",
  email: "",
  phone: "",
  password: "",
  role: "customer",
};

const ROLE_LABELS = {
  staff: "Nhân viên",
  customer: "Khách hàng",
};

function Users() {
  const isStaff = useSelector((state) => state.auth.role === "staff");
  const userEndpoint = isStaff ? `${api.user}/staff` : api.user;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionUserId, setActionUserId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setError("");
      try {
        const { data } = await axiosClient.get(userEndpoint, {
          params: { limit: 50, search: search.trim(), role: selectedRole },
          signal: controller.signal,
        });
        setUsers(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.response?.data?.message ||
              "Không thể tải danh sách người dùng.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setSearching(false);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search, selectedRole, refreshKey, userEndpoint]);

  const filteredUsers = users;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE),
  );
  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE,
  );

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      ...INITIAL_FORM,
      username: user.username || "",
      fullname: user.fullname || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "customer",
    });
    setIsFormOpen(true);
    setError("");
    setNotice("");
  };

  const handleSubmitUser = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (editingUser) {
        const userId = editingUser._id || editingUser.id;
        const { data } = await axiosClient.patch(
          isStaff ? `${userEndpoint}/${userId}` : `${api.user}/${userId}`,
          {
            username: formData.username,
            fullname: formData.fullname,
            email: formData.email,
            phone: formData.phone,
          },
        );
        setUsers((current) =>
          current.map((user) =>
            (user._id || user.id) === userId ? data : user,
          ),
        );
        setNotice("Đã cập nhật thông tin người dùng.");
        setRefreshKey((current) => current + 1);
      } else {
        const { data } = await axiosClient.post(
          userEndpoint,
          isStaff ? { ...formData, role: undefined } : formData,
        );
        const currentSearch = search.trim().toLocaleLowerCase("vi");
        const newUserText =
          `${data.fullname || ""} ${data.username || ""} ${data.email || ""}`.toLocaleLowerCase(
            "vi",
          );
        if (
          (!selectedRole || data.role === selectedRole) &&
          newUserText.includes(currentSearch)
        ) {
          setUsers((current) => [data, ...current].slice(0, 50));
        }
        setNotice("Đã tạo người dùng mới.");
      }
      setEditingUser(null);
      setFormData({ ...INITIAL_FORM });
      setIsFormOpen(false);
      setCurrentPage(1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể lưu thông tin người dùng.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLock = async (user) => {
    const userId = user._id || user.id;
    setActionUserId(userId);
    setError("");
    setNotice("");
    try {
      const { data } = isStaff
        ? await axiosClient.patch(`${userEndpoint}/${userId}/status`)
        : await axiosClient.patch(api.user, { userId });
      setUsers((current) =>
        current.map((item) => ((item._id || item.id) === userId ? data : item)),
      );
      setNotice(data.isActive ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể thay đổi trạng thái tài khoản.",
      );
    } finally {
      setActionUserId("");
    }
  };

  const handleChangeRole = async (user, role) => {
    if (isStaff || user.role === role) return;
    const userId = user._id || user.id;
    setActionUserId(userId);
    setError("");
    setNotice("");
    try {
      await axiosClient.patch(`${api.user}/${userId}/role`, { role });
      setNotice("Đã cập nhật vai trò người dùng.");
      setSearching(true);
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Không thể thay đổi vai trò.",
      );
    } finally {
      setActionUserId("");
    }
  };

  const handleSoftDelete = async (user) => {
    if (
      !window.confirm(
        `Xóa tài khoản ${user.fullname || user.email}? Tài khoản sẽ được ẩn khỏi danh sách.`,
      )
    ) {
      return;
    }
    const userId = user._id || user.id;
    setActionUserId(userId);
    setError("");
    setNotice("");
    try {
      await axiosClient.delete(
        isStaff ? `${userEndpoint}/${userId}` : `${api.user}/${userId}`,
      );
      setUsers((current) =>
        current.filter((item) => (item._id || item.id) !== userId),
      );
      setCurrentPage(1);
      setNotice("Đã xóa mềm tài khoản.");
      setSearching(true);
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Không thể xóa tài khoản.",
      );
    } finally {
      setActionUserId("");
    }
  };

  if (loading)
    return (
      <div className={cx("loading")}>
        <LoadingProduct />
      </div>
    );

  return (
    <section className={cx("page")}>
      <header className={cx("page-header")}>
        <div>
          <p className={cx("eyebrow")}>
            {isStaff ? "Quản lý khách hàng" : "Quản trị người dùng"}
          </p>
          <p className={cx("summary")}>
            {isStaff
              ? "Tối đa 50 khách hàng mới nhất; nhân viên không thể thay đổi vai trò."
              : "Tối đa 50 tài khoản mới nhất, không bao gồm quản trị viên"}
          </p>
        </div>
        <button
          className={cx("create-button")}
          type="button"
          aria-expanded={isFormOpen}
          onClick={() => {
            setIsFormOpen((open) => !open);
            setEditingUser(null);
            setFormData({ ...INITIAL_FORM });
            setError("");
            setNotice("");
          }}
        >
          <FontAwesomeIcon icon={isFormOpen ? faXmark : faPlus} />
          {isFormOpen ? "Đóng biểu mẫu" : "Thêm người dùng"}
        </button>
      </header>

      {error && (
        <div className={cx("alert", "error")} role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className={cx("alert", "success")} role="status">
          {notice}
        </div>
      )}

      {isFormOpen && (
        <form className={cx("create-form")} onSubmit={handleSubmitUser}>
          <div className={cx("form-heading")}>
            <h2>{editingUser ? "Chỉnh sửa thông tin" : "Tạo tài khoản"}</h2>
            <span>
              {editingUser
                ? "Cập nhật thông tin người dùng"
                : "Các trường có dấu * là bắt buộc"}
            </span>
          </div>
          <div className={cx("form-grid")}>
            <label>
              Họ và tên *
              <input
                name="fullname"
                value={formData.fullname}
                onChange={handleFormChange}
                autoComplete="name"
                required
              />
            </label>
            <label>
              Username *
              <input
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Email *
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Số điện thoại *
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleFormChange}
                autoComplete="tel"
                required
              />
            </label>
            {!editingUser && (
              <>
                <label>
                  Mật khẩu *
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </label>
                {!isStaff && (
                  <label>
                    Vai trò *
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                    >
                      <option value="customer">Khách hàng</option>
                      <option value="staff">Nhân viên</option>
                    </select>
                  </label>
                )}
              </>
            )}
          </div>
          <div className={cx("form-actions")}>
            {editingUser && (
              <button
                className={cx("cancel-button")}
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setFormData({ ...INITIAL_FORM });
                  setIsFormOpen(false);
                }}
              >
                Hủy
              </button>
            )}
            <button
              className={cx("submit-button")}
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Đang lưu..."
                : editingUser
                  ? "Lưu thay đổi"
                  : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      )}

      <div className={cx("toolbar")}>
        <label className={cx("search-field")}>
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <input
            type="search"
            value={search}
            placeholder="Tìm theo tên, username hoặc email"
            aria-label="Tìm người dùng theo tên, username hoặc email"
            onChange={(event) => {
              setSearch(event.target.value);
              setSearching(true);
              setCurrentPage(1);
            }}
          />
        </label>
        {!isStaff && (
          <select
            className={cx("role-filter")}
            value={selectedRole}
            aria-label="Lọc theo vai trò"
            onChange={(event) => {
              setSelectedRole(event.target.value);
              setSearching(true);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả vai trò</option>
            <option value="staff">Nhân viên</option>
            <option value="customer">Khách hàng</option>
          </select>
        )}
        <span className={cx("result-count")} aria-live="polite">
          {searching ? "Đang tìm..." : `${filteredUsers.length} người dùng`}
        </span>
      </div>

      <div className={cx("table-wrap")}>
        <table className={cx("user-table")}>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              {!isStaff && <th>Vai trò</th>}
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => (
              <tr key={user._id || user.id}>
                <td>
                  <div className={cx("identity")}>
                    {user.avatar ? (
                      <img className={cx("avatar")} src={user.avatar} alt="" />
                    ) : (
                      <span
                        className={cx("avatar", "avatar-fallback")}
                        aria-hidden="true"
                      >
                        {(user.fullname || user.username || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                    <span>
                      <strong>{user.fullname || "Chưa có tên"}</strong>
                      <small>@{user.username}</small>
                    </span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || "-"}</td>
                {!isStaff && (
                  <td>
                    <select
                      className={cx("row-role")}
                      value={user.role}
                      aria-label={`Đổi vai trò của ${user.fullname || user.email}`}
                      disabled={actionUserId === (user._id || user.id)}
                      onChange={(event) =>
                        handleChangeRole(user, event.target.value)
                      }
                    >
                      <option value="customer">{ROLE_LABELS.customer}</option>
                      <option value="staff">{ROLE_LABELS.staff}</option>
                    </select>
                  </td>
                )}
                <td>
                  <span
                    className={cx(
                      "status",
                      user.isActive ? "active" : "inactive",
                    )}
                  >
                    {user.isActive ? "Hoạt động" : "Đã khóa"}
                  </span>
                </td>
                <td>
                  <div className={cx("row-actions")}>
                    <button
                      className={cx("action-button")}
                      type="button"
                      title="Chỉnh sửa thông tin"
                      aria-label={`Chỉnh sửa ${user.fullname || user.email}`}
                      onClick={() => handleEditUser(user)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className={cx(
                        "action-button",
                        user.isActive ? "lock-action" : "unlock-action",
                      )}
                      type="button"
                      title={
                        user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"
                      }
                      aria-label={`${user.isActive ? "Khóa" : "Mở khóa"} ${user.fullname || user.email}`}
                      disabled={actionUserId === (user._id || user.id)}
                      onClick={() => handleToggleLock(user)}
                    >
                      <FontAwesomeIcon
                        icon={user.isActive ? faLock : faLockOpen}
                      />
                    </button>
                    <button
                      className={cx("action-button", "delete-action")}
                      type="button"
                      title="Xóa mềm tài khoản"
                      aria-label={`Xóa ${user.fullname || user.email}`}
                      disabled={actionUserId === (user._id || user.id)}
                      onClick={() => handleSoftDelete(user)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleUsers.length === 0 && (
              <tr>
                <td className={cx("empty-state")} colSpan={isStaff ? 5 : 6}>
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className={cx("pagination")} aria-label="Phân trang người dùng">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            Trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Sau
          </button>
        </nav>
      )}
    </section>
  );
}

export default Users;
