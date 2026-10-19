import { useEffect, useRef, useState } from "react";
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
import styles from "./Categories.module.scss";

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 10;
const INITIAL_CATEGORY_LIMIT = 50;
const ADDITIONAL_CATEGORY_LIMIT = 20;
const INITIAL_FORM = { name: "", parentCategory: "", avatar: null, removeAvatar: false };

const getParentId = (category) => {
  const parent = category.parentCategory;
  return typeof parent === "object" && parent !== null ? parent._id || parent.id : parent || "";
};

function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreCategories, setHasMoreCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [refreshKey, setRefreshKey] = useState(0);
  const loadMoreControllerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setError("");
      try {
        const { data } = await axiosClient.get(api.parentCategory, { signal: controller.signal });
        setParentCategories(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || "Không thể tải danh sách phân loại cha.");
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const { data } = await axiosClient.get(api.category, {
          params: {
            search: search.trim(),
            parentCategory: selectedParent,
            skip: 0,
            limit: INITIAL_CATEGORY_LIMIT,
          },
          signal: controller.signal,
        });
        const fetchedCategories = Array.isArray(data) ? data : [];
        setCategories(fetchedCategories);
        setHasMoreCategories(fetchedCategories.length === INITIAL_CATEGORY_LIMIT);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || "Không thể tải danh sách phân loại.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setSearching(false);
        }
      }
    }, search.trim() ? 500 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
      loadMoreControllerRef.current?.abort();
    };
  }, [refreshKey, search, selectedParent]);

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const visibleCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleLoadMore = async () => {
    const controller = new AbortController();
    loadMoreControllerRef.current = controller;
    const requestedSearch = search.trim();
    const requestedParent = selectedParent;
    setLoadingMore(true);
    setError("");

    try {
      const { data } = await axiosClient.get(api.category, {
        params: {
          search: requestedSearch,
          parentCategory: requestedParent,
          skip: categories.length,
          limit: ADDITIONAL_CATEGORY_LIMIT,
        },
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      const fetchedCategories = Array.isArray(data) ? data : [];
      setCategories((current) => [...current, ...fetchedCategories]);
      setHasMoreCategories(fetchedCategories.length === ADDITIONAL_CATEGORY_LIMIT);
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError.response?.data?.message || "Không thể tải thêm phân loại.");
      }
    } finally {
      if (loadMoreControllerRef.current === controller) {
        loadMoreControllerRef.current = null;
        setLoadingMore(false);
      }
    }
  };

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
    setFormData({
      ...INITIAL_FORM,
      name: category.name || "",
      parentCategory: getParentId(category),
    });
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
    payload.append("parentCategory", formData.parentCategory);
    if (formData.avatar) payload.append("avatar", formData.avatar);
    if (formData.removeAvatar) payload.append("removeAvatar", "true");

    try {
      if (editingCategory) {
        const categoryId = editingCategory._id || editingCategory.id;
        const { data } = await axiosClient.patch(`${api.category}/${categoryId}`, payload);
        setCategories((current) => current.map((category) =>
          (category._id || category.id) === categoryId ? data : category
        ));
        setNotice("Đã cập nhật phân loại.");
      } else {
        const { data } = await axiosClient.post(api.category, payload);
        setCategories((current) => [data, ...current]);
        setCurrentPage(1);
        setNotice("Đã tạo phân loại.");
      }
      setRefreshKey((current) => current + 1);
      resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể lưu phân loại.");
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
      await axiosClient.delete(`${api.category}/${categoryId}`);
      setCategories((current) => current.filter(
        (item) => (item._id || item.id) !== categoryId
      ));
      setCurrentPage(1);
      setNotice("Đã xóa phân loại.");
      setRefreshKey((current) => current + 1);
      if ((editingCategory?._id || editingCategory?.id) === categoryId) resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể xóa phân loại.");
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
          <h1>Phân loại</h1>
          <p className={cx("summary")}>Quản lý các danh mục con và nhóm phân loại cha tương ứng.</p>
        </div>
        <button
          className={cx("create-button")}
          type="button"
          aria-expanded={isFormOpen}
          disabled={parentCategories.length === 0}
          title={parentCategories.length === 0 ? "Hãy tạo phân loại cha trước" : undefined}
          onClick={startCreate}
        >
          <FontAwesomeIcon icon={isFormOpen ? faXmark : faPlus} />
          {isFormOpen ? "Đóng biểu mẫu" : "Thêm phân loại"}
        </button>
      </header>

      {error && <div className={cx("alert", "error")} role="alert">{error}</div>}
      {notice && <div className={cx("alert", "success")} role="status">{notice}</div>}
      {parentCategories.length === 0 && (
        <div className={cx("alert", "info")} role="status">
          Cần tạo ít nhất một phân loại cha trước khi thêm phân loại.
        </div>
      )}

      {isFormOpen && (
        <form className={cx("category-form")} onSubmit={handleSubmit}>
          <div className={cx("form-heading")}>
            <h2>{editingCategory ? "Chỉnh sửa phân loại" : "Tạo phân loại"}</h2>
            <span>Chọn nhóm phân loại cha cho danh mục này.</span>
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
              Phân loại cha *
              <select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={(event) => setFormData((current) => ({ ...current, parentCategory: event.target.value }))}
                required
              >
                <option value="">Chọn phân loại cha</option>
                {parentCategories.map((parent) => (
                  <option key={parent._id || parent.id} value={parent._id || parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
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
            placeholder="Tìm theo tên phân loại"
            aria-label="Tìm phân loại"
            onChange={(event) => {
              setSearch(event.target.value);
              setSearching(true);
              setHasMoreCategories(false);
              setCurrentPage(1);
            }}
          />
        </label>
        <select
          className={cx("parent-filter")}
          value={selectedParent}
          aria-label="Lọc theo phân loại cha"
          onChange={(event) => {
            setSelectedParent(event.target.value);
            setSearching(true);
            setHasMoreCategories(false);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả phân loại cha</option>
          {parentCategories.map((parent) => (
            <option key={parent._id || parent.id} value={parent._id || parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
        <span className={cx("result-count")}>
          {searching ? "Đang tìm trong database..." : `${categories.length} phân loại đã tải`}
        </span>
      </div>

      <div className={cx("table-wrap")}>
        <table className={cx("category-table")}>
          <thead>
            <tr>
              <th>Phân loại</th>
              <th>Phân loại cha</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visibleCategories.map((category) => {
              const parentId = getParentId(category);
              const parent = parentCategories.find((item) => (item._id || item.id) === parentId);
              return (
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
                  <td>{parent?.name || "Không xác định"}</td>
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
              );
            })}
            {visibleCategories.length === 0 && (
              <tr>
                <td className={cx("empty-state")} colSpan="4">
                  {search || selectedParent
                    ? "Không tìm thấy phân loại phù hợp."
                    : "Chưa có phân loại nào."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className={cx("pagination")} aria-label="Phân trang phân loại">
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
      {hasMoreCategories && (
        <div className={cx("load-more-wrap")}>
          <button
            className={cx("load-more")}
            type="button"
            disabled={loadingMore || searching}
            onClick={handleLoadMore}
          >
            {loadingMore ? "Đang tải..." : "Tải thêm 20 phân loại"}
          </button>
        </div>
      )}
    </section>
  );
}

export default CategoriesManagement;