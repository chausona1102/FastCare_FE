import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import classNames from "classnames/bind";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import { LoadingProduct } from "~/components/Loading";
import styles from "./Inventory.module.scss";

const cx = classNames.bind(styles);

function Inventory() {
  const location = useLocation();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const controller = new AbortController();

    const loadInventory = async () => {
      try {
        const { data } = await axiosClient.get(`${api.variant}/all`, {
          params: { status: "active" },
          signal: controller.signal,
        });
        setVariants(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.response?.data?.message || "Không thể tải tồn kho.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadInventory();
    return () => controller.abort();
  }, []);

  const visibleVariants = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return variants.filter((variant) => {
      const stock = Number(variant.stockQuantity) || 0;
      const createdAt = variant.createdAt ? new Date(variant.createdAt) : null;
      const endDate = dateTo ? new Date(`${dateTo}T00:00:00`) : null;
      if (endDate) endDate.setDate(endDate.getDate() + 1);
      const text = [
        variant.product?.title,
        variant.sku,
        variant.storage,
        ...(variant.colors || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi");
      const matchesSearch = !keyword || text.includes(keyword);
      const matchesFilter =
        stockFilter === "all" ||
        (stockFilter === "out" && stock === 0) ||
        (stockFilter === "low" && stock > 0 && stock <= 10) ||
        (stockFilter === "available" && stock > 10);
      const matchesDate =
        (!dateFrom ||
          (createdAt && createdAt >= new Date(`${dateFrom}T00:00:00`))) &&
        (!endDate || (createdAt && createdAt < endDate));
      return (
        !variant.deleteAt &&
        !variant.product?.deletedAt &&
        matchesSearch &&
        matchesFilter &&
        matchesDate
      );
    });
  }, [dateFrom, dateTo, search, stockFilter, variants]);

  const pageCount = Math.ceil(visibleVariants.length / pageSize);
  const paginatedVariants = visibleVariants.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const isAdminPage = location.pathname.startsWith("/admin/");

  if (loading)
    return (
      <div className={cx("loading")}>
        <LoadingProduct />
      </div>
    );

  return (
    <section className={cx("page")}>
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>Kho hàng</p>
          <h1>Quản lý tồn kho</h1>
          <p className={cx("summary")}>
            Theo dõi tồn kho theo phiên bản sản phẩm và lọc theo ngày tạo phiên
            bản.
          </p>
        </div>
        {!isAdminPage && (
          <Link className={cx("primaryButton")} to="/staff/imports/create">
            Tạo phiếu nhập
          </Link>
        )}
      </header>

      {error && (
        <div className={cx("alert", "error")} role="alert">
          {error}
        </div>
      )}

      <div className={cx("toolbar")}>
        <input
          type="search"
          value={search}
          placeholder="Tìm tên sản phẩm, SKU, màu hoặc bộ nhớ"
          aria-label="Tìm phiên bản sản phẩm"
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        <select
          value={stockFilter}
          aria-label="Lọc tồn kho"
          onChange={(event) => {
            setPage(1);
            setStockFilter(event.target.value);
          }}
        >
          <option value="all">Tất cả tồn kho</option>
          <option value="out">Hết hàng</option>
          <option value="low">Sắp hết (≤ 10)</option>
          <option value="available">Còn hàng (&gt; 10)</option>
        </select>
        <label>
          Tạo từ
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            aria-label="Ngày tạo phiên bản từ"
            onChange={(event) => {
              setPage(1);
              setDateFrom(event.target.value);
            }}
          />
        </label>
        <label>
          đến
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            aria-label="Ngày tạo phiên bản đến"
            onChange={(event) => {
              setPage(1);
              setDateTo(event.target.value);
            }}
          />
        </label>
        <span>{visibleVariants.length} phiên bản</span>
      </div>

      <div className={cx("tableWrap")}>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Phân loại</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedVariants.map((variant) => {
              const stock = Number(variant.stockQuantity) || 0;
              const id = variant._id || variant.id;
              return (
                <tr key={id}>
                  <td>{variant.product?.title || "Sản phẩm đã xóa"}</td>
                  <td>{variant.sku || "-"}</td>
                  <td>
                    {[variant.storage, ...(variant.colors || [])]
                      .filter(Boolean)
                      .join(" · ") || "-"}
                  </td>
                  <td className={cx("quantity")}>{stock}</td>
                  <td>
                    <span
                      className={cx(
                        "badge",
                        stock === 0
                          ? "empty"
                          : stock <= 10
                            ? "low"
                            : "available",
                      )}
                    >
                      {stock === 0
                        ? "Hết hàng"
                        : stock <= 10
                          ? "Sắp hết"
                          : "Đủ hàng"}
                    </span>
                  </td>
                  <td>
                    {!isAdminPage && (
                      <Link
                        to={`/staff/imports/create?variant=${encodeURIComponent(id)}`}
                      >
                        Nhập thêm
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {paginatedVariants.length === 0 && (
              <tr>
                <td className={cx("emptyState")} colSpan="6">
                  Không tìm thấy phiên bản sản phẩm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {visibleVariants.length > 0 && (
        <nav className={cx("pagination")} aria-label="Phân trang tồn kho">
          <span>
            Trang {page} / {pageCount} · Hiển thị{" "}
            {Math.min(pageSize, visibleVariants.length - (page - 1) * pageSize)}{" "}
            trên {visibleVariants.length} phiên bản
          </span>
          <div>
            <button
              type="button"
              onClick={() => setPage((current) => current - 1)}
              disabled={page <= 1}
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= pageCount}
            >
              Sau
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}

export default Inventory;
