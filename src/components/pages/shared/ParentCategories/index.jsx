import { useEffect, useMemo, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPen,
  faPlus,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import Loading from "~/components/Loading";
import styles from "./ParentCategories.module.scss";

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 10;
const INITIAL_FORM = { name: "", avatar: null, removeAvatar: false };

function ParentCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      setError("");
      try {
        const { data } = await axiosClient.get(api.parentCategory, {
          signal: controller.signal,
        });
        setCategories(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || "Không thể tải danh sách phân loại cha.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCategories();
    return () => controller.abort();
  }, []);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    if (!keyword) return categories;
    return categories.filter((category) =>
      [category.name, category.slug]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("vi").includes(keyword))
    );
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));
  const visibleCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetForm = () => {
    setEditingCategory(null);
    setFormData(INITIAL_FORM);
    setIsFormOpen(false);
  };

  const startCreate = () => {
    setEditingCategory(null);
    setFormData(INITIAL_FORM);
    setIsFormOpen((open) => !open);
    setError("");
    setNotice("");
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setFormData({ ...INITIAL_FORM, name: category.name || "" });
    setIsFormOpen(true);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    const payload = new FormData();
    payload.append("name", formData.name.trim());
    if (formData.avatar) payload.append("avatar", formData.avatar);
    if (formData.removeAvatar) payload.append("removeAvatar", "true");

    try {
      if (editingCategory) {
        const categoryId = editingCategory._id || editingCategory.id;
        const { data } = await axiosClient.patch(`${api.parentCategory}/${categoryId}`, payload);
        setCategories((current) => current.map((category) =>
          (category._id || category.id) === categoryId ? data : category
        ));
        setNotice("Đã cập nhật phân loại cha.");
      } else {
        const { data } = await axiosClient.post(api.parentCategory, payload);
        setCategories((current) => [data, ...current]);
        setCurrentPage(1);
        setNotice("Đã tạo phân loại cha.");
      }
      resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể lưu phân loại cha.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    const categoryId = category._id || category.id;
    if (!window.confirm(`Xóa phân loại "${category.name}"?`)) return;

    setDeletingId(categoryId);
    setError("");
    setNotice("");
    try {
      await axiosClient.delete(`${api.parentCategory}/${categoryId}`);
      setCategories((current) => current.filter(
        (item) => (item._id || item.id) !== categoryId
      ));
      setCurrentPage(1);
      setNotice("Đã xóa phân loại cha.");
      if ((editingCategory?._id || editingCategory?.id) === categoryId) resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể xóa phân loại cha.");
    } finally {
      setDeletingId("");
    }
  };

  if (loading) return <div className={cx("loading")}><Loading /></div>;

  return (
    <section className={cx("page")}>
      <header className={cx("page-header")}>
        <div>
          <p className={cx("eyebrow")}>Quản lý danh mục</p>
          <h1>Phân loại cha</h1>
          <p className={cx("summary")}>Tạo, cập nhật và quản lý các nhóm danh mục sản phẩm.</p>
        </div>
        <button
          className={cx("create-button")}
          type="button"
          aria-expanded={isFormOpen}
          onClick={startCreate}
        >
          <FontAwesomeIcon icon={isFormOpen ? faXmark : faPlus} />
          {isFormOpen ? "Đóng biểu mẫu" : "Thêm phân loại"}
        </button>
      </header>

      {error && <div className={cx("alert", "error")} role="alert">{error}</div>}
      {notice && <div className={cx("alert", "success")} role="status">{notice}</div>}

      {isFormOpen && (
        <form className={cx("category-form")} onSubmit={handleSubmit}>
          <div className={cx("form-heading")}>
            <h2>{editingCategory ? "Chỉnh sửa phân loại" : "Tạo phân loại cha"}</h2>
            <span>Đường dẫn được tạo tự động từ tên phân loại.</span>
          </div>
          <div className={cx("form-grid")}>
            <label>
              Tên phân loại *
              <input
                name="name"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                maxLength={100}
                required
              />
            </label>
            <label>
              Ảnh đại diện
              <input
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setFormData((current) => ({
                  ...current,
                  avatar: event.target.files?.[0] || null,
                  removeAvatar: false,
                }))}
              />
            </label>
          </div>
          {editingCategory?.avatar && (
            <div className={cx("image-options")}>
              <img src={editingCategory.avatar} alt="" />
              <span>{formData.avatar ? formData.avatar.name : "Ảnh hiện tại"}</span>
              {!formData.avatar && (
                <label>
                  <input
                    type="checkbox"
                    checked={formData.removeAvatar}
                    onChange={(event) => setFormData((current) => ({
                      ...current,
                      removeAvatar: event.target.checked,
                    }))}
                  />
                  Gỡ ảnh hiện tại
                </label>
              )}
            </div>
          )}
          <div className={cx("form-actions")}>
            <button className={cx("cancel-button")} type="button" onClick={resetForm}>
              Hủy
            </button>
            <button className={cx("submit-button")} type="submit" disabled={submitting}>
              {submitting ? "Đang lưu..." : editingCategory ? "Lưu thay đổi" : "Tạo phân loại"}
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
            placeholder="Tìm theo tên hoặc đường dẫn"
            aria-label="Tìm phân loại cha"
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </label>
        <span className={cx("result-count")}>{filteredCategories.length} phân loại</span>
      </div>

      <div className={cx("table-wrap")}>
        <table className={cx("category-table")}>
          <thead>
            <tr>
              <th>Phân loại</th>
              <th>Slug</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visibleCategories.map((category) => (
              <tr key={category._id || category.id}>
                <td>
                  <div className={cx("category-identity")}>
                    {category.avatar ? (
                      <img src={category.avatar} alt="" />
                    ) : (
                      <span className={cx("image-fallback")} aria-hidden="true">
                        {(category.name || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <strong>{category.name}</strong>
                  </div>
                </td>
                <td><code>{category.slug || "-"}</code></td>
                <td>
                  {category.createdAt
                    ? new Date(category.createdAt).toLocaleDateString("vi-VN")
                    : "-"}
                </td>
                <td>
                  <div className={cx("row-actions")}>
                    <button
                      className={cx("action-button")}
                      type="button"
                      title="Chỉnh sửa phân loại"
                      aria-label={`Chỉnh sửa ${category.name}`}
                      onClick={() => startEdit(category)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className={cx("action-button", "delete-action")}
                      type="button"
                      title="Xóa phân loại"
                      aria-label={`Xóa ${category.name}`}
                      disabled={deletingId === (category._id || category.id)}
                      onClick={() => handleDelete(category)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleCategories.length === 0 && (
              <tr>
                <td className={cx("empty-state")} colSpan="4">
                  {search ? "Không tìm thấy phân loại phù hợp." : "Chưa có phân loại cha nào."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className={cx("pagination")} aria-label="Phân trang phân loại cha">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            Trước
          </button>
          <span>Trang {currentPage} / {totalPages}</span>
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

export default ParentCategories;