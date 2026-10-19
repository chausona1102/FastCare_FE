import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import classNames from "classnames/bind";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import Loading from "~/components/Loading";
import styles from "./Imports.module.scss";

const cx = classNames.bind(styles);
const EMPTY_FORM = { variantId: "", quantity: "1", unitCost: "", supplier: "", note: "" };

function Imports() {
  const [searchParams] = useSearchParams();
  const [variants, setVariants] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const selectedVariantId = searchParams.get("variant") || "";

  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      setError("");
      try {
        const [{ data: variantData }, { data: importData }] = await Promise.all([
          axiosClient.get(`${api.variant}/all`, {
            params: { status: "active" },
            signal: controller.signal,
          }),
          axiosClient.get(api.imports, {
            params: { limit: 100 },
            signal: controller.signal,
          }),
        ]);
        setVariants(Array.isArray(variantData) ? variantData.filter(
          (variant) => !variant.deleteAt && !variant.product?.deletedAt
        ) : []);
        setRecords(Array.isArray(importData) ? importData : []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || "Không thể tải thông tin nhập hàng.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadData();
    return () => controller.abort();
  }, [refreshKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const { data } = await axiosClient.post(api.imports, {
        ...form,
        quantity: Number(form.quantity),
        unitCost: form.unitCost === "" ? undefined : Number(form.unitCost),
      });
      setNotice(`Đã nhập ${data.record.quantity} sản phẩm vào kho.`);
      setForm((current) => ({ ...EMPTY_FORM, variantId: current.variantId }));
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể tạo phiếu nhập.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={cx("loading")}><Loading /></div>;

  return (
    <section className={cx("page")}>
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>Kho hàng</p>
          <h1>Nhập hàng</h1>
          <p className={cx("summary")}>Tạo phiếu nhập và tự động cập nhật tồn kho theo phiên bản.</p>
        </div>
      </header>

      {error && <div className={cx("alert", "error")} role="alert">{error}</div>}
      {notice && <div className={cx("alert", "success")} role="status">{notice}</div>}

      <form className={cx("form")} onSubmit={handleSubmit}>
        <h2>Tạo phiếu nhập</h2>
        <div className={cx("formGrid")}>
          <label className={cx("wide")}>
            Phiên bản sản phẩm *
            <select name="variantId" value={form.variantId || selectedVariantId} onChange={handleChange} required>
              <option value="">Chọn sản phẩm / SKU</option>
              {variants.map((variant) => (
                <option key={variant._id || variant.id} value={variant._id || variant.id}>
                  {variant.product?.title || "Sản phẩm"} · {variant.sku || "Không có SKU"} · Tồn: {variant.stockQuantity || 0}
                </option>
              ))}
            </select>
          </label>
          <label>
            Số lượng nhập *
            <input name="quantity" type="number" min="1" step="1" value={form.quantity} onChange={handleChange} required />
          </label>
          <label>
            Đơn giá nhập (₫)
            <input name="unitCost" type="number" min="0" step="1" value={form.unitCost} onChange={handleChange} />
          </label>
          <label>
            Nhà cung cấp
            <input name="supplier" value={form.supplier} onChange={handleChange} maxLength="120" />
          </label>
          <label className={cx("wide")}>
            Ghi chú
            <textarea name="note" value={form.note} onChange={handleChange} maxLength="500" rows="3" />
          </label>
        </div>
        <button className={cx("submitButton")} type="submit" disabled={submitting || variants.length === 0}>
          {submitting ? "Đang ghi nhận..." : "Lưu phiếu nhập và cập nhật kho"}
        </button>
        {variants.length === 0 && <p className={cx("hint")}>Chưa có phiên bản sản phẩm đang hoạt động để nhập kho.</p>}
      </form>

      <section className={cx("history")}>
        <div className={cx("historyHeader")}>
          <h2>Lịch sử nhập hàng</h2>
          <span>{records.length} phiếu gần nhất</span>
        </div>
        <div className={cx("tableWrap")}>
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Sản phẩm / SKU</th>
                <th>Số lượng</th>
                <th>Đơn giá nhập</th>
                <th>Nhà cung cấp</th>
                <th>Nhân viên</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.createdAt).toLocaleString("vi-VN")}</td>
                  <td>{record.product?.title || "Sản phẩm"}<small>{record.sku || record.variant?.sku || "-"}</small></td>
                  <td className={cx("quantity")}>+{record.quantity}</td>
                  <td>{record.unitCost == null ? "-" : `${Number(record.unitCost).toLocaleString("vi-VN")} ₫`}</td>
                  <td>{record.supplier || "-"}</td>
                  <td>{record.importedBy?.fullname || record.importedBy?.username || "-"}</td>
                  <td>{record.note || "-"}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td className={cx("empty")} colSpan="7">Chưa có phiếu nhập hàng.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default Imports;
