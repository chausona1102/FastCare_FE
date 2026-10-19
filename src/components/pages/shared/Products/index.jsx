import { useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import Loading from "~/components/Loading";
import { useToast } from "~/contexts/ToastContext";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";
import VariantForm from "./VariantForm";
import VariantTable from "./VariantTable";
import styles from "./Products.module.scss";

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 10;
const INITIAL_PRODUCT_LIMIT = 50;
const ADDITIONAL_PRODUCT_LIMIT = 20;
const PRODUCT_FORM = {
  title: "",
  minPrice: "",
  discount: "0",
  installment: "0",
  brand: "",
  category: "",
  productType: "",
  specifications: {},
  weight: "",
  length: "",
  height: "",
  width: "",
  avatar: null,
  images: [],
};
const VARIANT_FORM = {
  product: "",
  sku: "",
  colors: "",
  storage: "",
  price: "",
  stockQuantity: "0",
  images: [],
};

const getId = (value) =>
  typeof value === "object" && value !== null ? value._id || value.id : value || "";

const getProductTypeForCategory = (categoryId, categories, parentCategories) => {
  const category = categories.find(
    (item) => (item._id || item.id) === categoryId
  );
  const parentCategoryId = getId(category?.parentCategory);
  const parentCategory = parentCategories.find(
    (item) => (item._id || item.id) === parentCategoryId
  );
  return {
    "dien-thoai": "phone",
    laptop: "laptop",
    "phu-kien": "accessory",
  }[parentCategory?.slug] || "";
};

const getProductSpecifications = (product, productType) => {
  if (product.specifications?.[productType]) return product.specifications;
  const fieldsByType = {
    phone: [
      "ram", "storage", "screenSize", "displayTech", "screenFeatures",
      "rearCamera", "frontCamera", "chipset", "nfc", "sim", "os",
      "screenResolution", "cpu",
    ],
    laptop: [
      "ram", "storage", "screenSize", "displayTech", "screenFeatures",
      "screenResolution", "cpu", "gpu", "os", "battery",
    ],
    accessory: [
      "compatibility", "connection", "material", "capacity", "connector", "power",
    ],
  };
  const legacySpecifications = Object.fromEntries(
    (fieldsByType[productType] || [])
      .filter((field) => product[field] !== undefined && product[field] !== null)
      .map((field) => [field, product[field]])
  );
  return { ...(product.specifications || {}), [productType]: legacySpecifications };
};

function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [productForm, setProductForm] = useState(PRODUCT_FORM);
  const [variantForm, setVariantForm] = useState(VARIANT_FORM);
  const loadMoreControllerRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      try {
        const [{ data: categoryData }, { data: parentCategoryData }] = await Promise.all([
          axiosClient.get(api.category, { signal: controller.signal }),
          axiosClient.get(api.parentCategory, { signal: controller.signal }),
        ]);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setParentCategories(Array.isArray(parentCategoryData) ? parentCategoryData : []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          const message = requestError.response?.data?.message || "Không thể tải dữ liệu sản phẩm và phiên bản.";
          setError(message);
          showToast({ title: message, type: "error" });
          setLoading(false);
        }
      }
    };
    loadData();
    return () => controller.abort();
  }, [showToast]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const endpoint = activeTab === "products" ? `${api.product}/all` : `${api.variant}/all`;
        const { data } = await axiosClient.get(endpoint, {
          params: {
            search: search.trim(),
            status: statusFilter,
            ...(activeTab === "products"
              ? { skip: 0, limit: INITIAL_PRODUCT_LIMIT }
              : {}),
          },
          signal: controller.signal,
        });
        const results = Array.isArray(data) ? data : [];
        if (activeTab === "products") {
          setProducts(results);
          setHasMoreProducts(results.length === INITIAL_PRODUCT_LIMIT);
          setProductOptions((current) => {
            const currentById = new Map(current.map((product) => [product._id || product.id, product]));
            results.forEach((product) => currentById.set(product._id || product.id, product));
            return Array.from(currentById.values());
          });
        } else {
          setVariants(results);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          const message = requestError.response?.data?.message || "Không thể tìm trong danh sách.";
          setError(message);
          showToast({ title: message, type: "error" });
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
      loadMoreControllerRef.current?.abort();
    };
  }, [activeTab, refreshKey, search, showToast, statusFilter]);

  const filteredItems = activeTab === "products" ? products : variants;

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const visibleItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleLoadMoreProducts = async () => {
    const controller = new AbortController();
    loadMoreControllerRef.current = controller;
    const requestedSearch = search.trim();
    const requestedStatus = statusFilter;
    setLoadingMoreProducts(true);
    setError("");

    try {
      const { data } = await axiosClient.get(`${api.product}/all`, {
        params: {
          search: requestedSearch,
          status: requestedStatus,
          skip: products.length,
          limit: ADDITIONAL_PRODUCT_LIMIT,
        },
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      const fetchedProducts = Array.isArray(data) ? data : [];
      setProducts((current) => [...current, ...fetchedProducts]);
      setProductOptions((current) => {
        const currentById = new Map(current.map((product) => [product._id || product.id, product]));
        fetchedProducts.forEach((product) => currentById.set(product._id || product.id, product));
        return Array.from(currentById.values());
      });
      setHasMoreProducts(fetchedProducts.length === ADDITIONAL_PRODUCT_LIMIT);
    } catch (requestError) {
      if (!controller.signal.aborted) {
        const message = requestError.response?.data?.message || "Không thể tải thêm sản phẩm.";
        setError(message);
        showToast({ title: message, type: "error" });
      }
    } finally {
      if (loadMoreControllerRef.current === controller) {
        loadMoreControllerRef.current = null;
        setLoadingMoreProducts(false);
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setProductForm(PRODUCT_FORM);
    setVariantForm(VARIANT_FORM);
    setIsFormOpen(false);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setStatusFilter("");
    setSearching(true);
    setCurrentPage(1);
    setHasMoreProducts(false);
    resetForm();
    setError("");
    setNotice("");
  };

  const startCreate = () => {
    setEditingItem(null);
    setProductForm(PRODUCT_FORM);
    setVariantForm({
      ...VARIANT_FORM,
      product: productOptions.find((product) => !product.deletedAt)?._id || "",
    });
    setIsFormOpen((open) => !open);
    setError("");
    setNotice("");
  };

  const startEditProduct = (product) => {
    const categoryId = getId(product.category);
    const productType =
      product.productType ||
      getProductTypeForCategory(categoryId, categories, parentCategories) ||
      (product.rearCamera || product.frontCamera || product.sim ? "phone" : "laptop");
    setEditingItem(product);
    setProductForm({
      ...PRODUCT_FORM,
      ...product,
      category: categoryId,
      productType,
      specifications: getProductSpecifications(product, productType),
      avatar: null,
      images: [],
    });
    setIsFormOpen(true);
    setError("");
    setNotice("");
  };

  const startEditVariant = (variant) => {
    setEditingItem(variant);
    setVariantForm({
      ...VARIANT_FORM,
      ...variant,
      product: getId(variant.product),
      colors: (variant.colors || []).join(", "),
      images: [],
    });
    setIsFormOpen(true);
    setError("");
    setNotice("");
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    const payload = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (key === "avatar" || key === "images") return;
      payload.append(
        key,
        key === "specifications" ? JSON.stringify(value || {}) : value ?? ""
      );
    });
    if (productForm.avatar) payload.append("avatar", productForm.avatar);
    productForm.images.forEach((image) => payload.append("images", image));

    try {
      if (editingItem) {
        const productId = editingItem._id || editingItem.id;
        const { data } = await axiosClient.patch(`${api.product}/${productId}`, payload);
        setProducts((current) => current.map((product) =>
          (product._id || product.id) === productId ? { ...product, ...data } : product
        ));
        setProductOptions((current) => current.map((product) =>
          (product._id || product.id) === productId ? { ...product, ...data } : product
        ));
        const message = "Đã cập nhật sản phẩm.";
        setNotice(message);
        showToast({ title: message, type: "success" });
      } else {
        const { data } = await axiosClient.post(api.product, payload);
        setProducts((current) => [data, ...current]);
        setProductOptions((current) => [data, ...current]);
        setCurrentPage(1);
        const message = "Đã tạo sản phẩm.";
        setNotice(message);
        showToast({ title: message, type: "success" });
      }
      setRefreshKey((current) => current + 1);
      resetForm();
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Không thể lưu sản phẩm.";
      setError(message);
      showToast({ title: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVariantSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    const payload = new FormData();
    payload.append("product", variantForm.product);
    payload.append("sku", variantForm.sku.trim());
    payload.append("storage", variantForm.storage.trim());
    payload.append("price", variantForm.price);
    payload.append("stockQuantity", variantForm.stockQuantity);
    payload.append("colors", JSON.stringify(
      variantForm.colors.split(",").map((color) => color.trim()).filter(Boolean)
    ));
    variantForm.images.forEach((image) => payload.append("images", image));

    try {
      if (editingItem) {
        const variantId = editingItem._id || editingItem.id;
        const { data } = await axiosClient.patch(`${api.variant}/${variantId}`, payload);
        setVariants((current) => current.map((variant) =>
          (variant._id || variant.id) === variantId
            ? { ...data, product: productOptions.find((product) => (product._id || product.id) === getId(data.product)) || data.product }
            : variant
        ));
        const message = "Đã cập nhật phiên bản.";
        setNotice(message);
        showToast({ title: message, type: "success" });
      } else {
        const { data } = await axiosClient.post(api.variant, payload);
        setVariants((current) => [{
          ...data,
          product: productOptions.find((product) => (product._id || product.id) === getId(data.product)) || data.product,
        }, ...current]);
        setCurrentPage(1);
        const message = "Đã tạo phiên bản.";
        setNotice(message);
        showToast({ title: message, type: "success" });
      }
      setRefreshKey((current) => current + 1);
      resetForm();
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Không thể lưu phiên bản.";
      setError(message);
      showToast({ title: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductStatus = async (product) => {
    const productId = product._id || product.id;
    const isDeleted = Boolean(product.deletedAt);
    const action = isDeleted ? "khôi phục" : "ẩn";
    if (!window.confirm(`Bạn muốn ${action} sản phẩm "${product.title}"?`)) return;
    setActionId(productId);
    setError("");
    setNotice("");
    try {
      const { data } = isDeleted
        ? await axiosClient.delete(`${api.product}/restore/${productId}`)
        : await axiosClient.delete(`${api.product}/${productId}`);
      setProducts((current) => current.map((item) =>
        (item._id || item.id) === productId ? { ...item, ...data } : item
      ));
      setProductOptions((current) => current.map((item) =>
        (item._id || item.id) === productId ? { ...item, ...data } : item
      ));
      setRefreshKey((current) => current + 1);
      const message = isDeleted ? "Đã khôi phục sản phẩm." : "Đã ẩn sản phẩm.";
      setNotice(message);
      showToast({ title: message, type: "success" });
    } catch (requestError) {
      const message = requestError.response?.data?.message || `Không thể ${action} sản phẩm.`;
      setError(message);
      showToast({ title: message, type: "error" });
    } finally {
      setActionId("");
    }
  };

  const handleVariantStatus = async (variant) => {
    const variantId = variant._id || variant.id;
    const isDeleted = Boolean(variant.deleteAt);
    const action = isDeleted ? "khôi phục" : "xóa";
    if (!window.confirm(`Bạn muốn ${action} phiên bản "${variant.sku || variant.storage}"?`)) return;
    setActionId(variantId);
    setError("");
    setNotice("");
    try {
      const { data } = await axiosClient.delete(
        isDeleted ? `${api.variant}/restore/${variantId}` : `${api.variant}/${variantId}`
      );
      setVariants((current) => current.map((item) =>
        (item._id || item.id) === variantId ? { ...item, ...data } : item
      ));
      setRefreshKey((current) => current + 1);
      const message = isDeleted ? "Đã khôi phục phiên bản." : "Đã xóa phiên bản.";
      setNotice(message);
      showToast({ title: message, type: "success" });
    } catch (requestError) {
      const message = requestError.response?.data?.message || `Không thể ${action} phiên bản.`;
      setError(message);
      showToast({ title: message, type: "error" });
    } finally {
      setActionId("");
    }
  };

  const updateProductField = (event) => {
    const { name, value } = event.target;
    setProductForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "category"
        ? { productType: getProductTypeForCategory(value, categories, parentCategories) }
        : {}),
    }));
  };

  const updateProductSpecification = (event) => {
    const { name, value, type, checked } = event.target;
    setProductForm((current) => ({
      ...current,
      specifications: {
        ...current.specifications,
        [current.productType]: {
          ...current.specifications?.[current.productType],
          [name]: type === "checkbox" ? (checked ? "Có" : "Không") : value,
        },
      },
    }));
  };

  const updateVariantField = (event) => {
    const { name, value, files } = event.target;
    setVariantForm((current) => ({
      ...current,
      [name]: files ? Array.from(files) : value,
    }));
  };

  const handleProductAvatarChange = (event) => {
    setProductForm((current) => ({
      ...current,
      avatar: event.target.files?.[0] || null,
    }));
  };

  const handleProductImagesChange = (event) => {
    setProductForm((current) => ({
      ...current,
      images: Array.from(event.target.files || []),
    }));
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setSearching(true);
    setHasMoreProducts(false);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setSearching(true);
    setHasMoreProducts(false);
    setCurrentPage(1);
  };

  if (loading) return <div className={cx("loading")}><Loading /></div>;

  return (
    <section className={cx("page")}>
      <header className={cx("page-header")}>
        <div>
          <p className={cx("eyebrow")}>Quản lý hàng hóa</p>
          <h1>Sản phẩm & phiên bản</h1>
          <p className={cx("summary")}>Quản lý thông tin sản phẩm, biến thể, giá và tồn kho.</p>
        </div>
        <button
          className={cx("create-button")}
          type="button"
          disabled={activeTab === "products" ? categories.length === 0 : productOptions.every((product) => product.deletedAt)}
          aria-expanded={isFormOpen}
          onClick={startCreate}
        >
          <FontAwesomeIcon icon={isFormOpen ? faXmark : faPlus} />
          {isFormOpen ? "Đóng biểu mẫu" : activeTab === "products" ? "Thêm sản phẩm" : "Thêm phiên bản"}
        </button>
      </header>

      {error && <div className={cx("alert", "error")} role="alert">{error}</div>}
      {notice && <div className={cx("alert", "success")} role="status">{notice}</div>}

      <div className={cx("tabs")} role="tablist" aria-label="Quản lý sản phẩm và phiên bản">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "products"}
          className={cx("tab", { active: activeTab === "products" })}
          onClick={() => changeTab("products")}
        >
          Sản phẩm ({products.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "variants"}
          className={cx("tab", { active: activeTab === "variants" })}
          onClick={() => changeTab("variants")}
        >
          Variant ({variants.length})
        </button>
      </div>

      {isFormOpen && activeTab === "products" && (
        <ProductForm
          categories={categories}
          parentCategories={parentCategories}
          editingProduct={editingItem}
          formData={productForm}
          submitting={submitting}
          onChange={updateProductField}
          onSpecificationChange={updateProductSpecification}
          onAvatarChange={handleProductAvatarChange}
          onImagesChange={handleProductImagesChange}
          onSubmit={handleProductSubmit}
          onCancel={resetForm}
        />
      )}
      {isFormOpen && activeTab === "variants" && (
        <VariantForm
          products={products}
          editingVariant={editingItem}
          formData={variantForm}
          submitting={submitting}
          onChange={updateVariantField}
          onSubmit={handleVariantSubmit}
          onCancel={resetForm}
        />
      )}

      <div className={cx("toolbar")}>
        <label className={cx("search-field")}>
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <input
            type="search"
            value={search}
            placeholder={activeTab === "products" ? "Tìm tên, thương hiệu, danh mục" : "Tìm SKU, dung lượng, màu, sản phẩm"}
            aria-label={activeTab === "products" ? "Tìm sản phẩm" : "Tìm phiên bản"}
            onChange={(event) => {
                  handleSearchChange(event);
                }}
          />
        </label>
        <select
          className={cx("status-filter")}
          value={statusFilter}
          aria-label="Lọc theo trạng thái"
          onChange={(event) => {
            handleStatusChange(event);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="deleted">Đã ẩn / xóa</option>
        </select>
        <span className={cx("result-count")}>
          {searching
            ? "Đang tìm trong database..."
            : `${filteredItems.length} ${activeTab === "products" ? "sản phẩm" : "phiên bản"}`}
        </span>
      </div>

      <div className={cx("table-wrap")}>
        {activeTab === "products" ? (
          <ProductTable
            products={visibleItems}
            actionId={actionId}
            onEdit={startEditProduct}
            onToggleStatus={handleProductStatus}
          />
        ) : (
          <VariantTable
            variants={visibleItems}
            products={productOptions}
            actionId={actionId}
            onEdit={startEditVariant}
            onToggleStatus={handleVariantStatus}
          />
        )}
      </div>

      {totalPages > 1 && (
        <nav className={cx("pagination")} aria-label="Phân trang danh sách">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
            Trước
          </button>
          <span>Trang {currentPage} / {totalPages}</span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
            Sau
          </button>
        </nav>
      )}

      {activeTab === "products" && hasMoreProducts && (
        <div className={cx("load-more-wrap")}>
          <button
            className={cx("load-more")}
            type="button"
            disabled={loadingMoreProducts || searching}
            onClick={handleLoadMoreProducts}
          >
            {loadingMoreProducts ? "Đang tải..." : "Tải thêm 20 sản phẩm"}
          </button>
        </div>
      )}
    </section>
  );
}

export default ProductsManagement;
