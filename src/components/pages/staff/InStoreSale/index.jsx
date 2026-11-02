import { useEffect, useMemo, useState } from "react";
import classNames from "classnames/bind";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import Loading from "~/components/Loading";
import styles from "./InStoreSale.module.scss";

const cx = classNames.bind(styles);

const formatCurrency = (amount) =>
  `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;

const getCurrentPrice = (variant) =>
  Number(variant?.price || 0) *
  (1 - Number(variant?.product?.discount || 0) / 100);

const getVariantId = (variant) => variant?._id || variant?.id || "";

function InStoreSale() {
  const [variants, setVariants] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadVariants = async () => {
      try {
        const { data } = await axiosClient.get(`${api.variant}/all`, {
          params: { status: "active" },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setVariants(Array.isArray(data) ? data.filter(
            (variant) => !variant.deleteAt && !variant.product?.deletedAt
          ) : []);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || "Không thể tải danh sách sản phẩm.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadVariants();
    return () => controller.abort();
  }, []);

  const visibleVariants = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    return variants.filter((variant) => {
      const description = [
        variant.product?.title,
        variant.sku,
        variant.storage,
        ...(variant.colors || []),
      ].filter(Boolean).join(" ").toLocaleLowerCase("vi");
      return description.includes(keyword);
    });
  }, [search, variants]);

  const cartLines = useMemo(() => cart.map((line) => ({
    ...line,
    variant: variants.find((variant) => getVariantId(variant) === line.variantId),
  })).filter((line) => line.variant), [cart, variants]);

  const total = cartLines.reduce(
    (sum, line) => sum + getCurrentPrice(line.variant) * line.quantity,
    0,
  );
  const selectedVariant = variants.find(
    (variant) => getVariantId(variant) === selectedVariantId,
  );

  const addSelectedVariant = () => {
    if (!selectedVariant || Number(selectedVariant.stockQuantity) <= 0) return;
    const variantId = getVariantId(selectedVariant);
    setCart((current) => {
      const existing = current.find((line) => line.variantId === variantId);
      if (!existing) return [...current, { variantId, quantity: 1 }];
      return current.map((line) => line.variantId === variantId
        ? { ...line, quantity: Math.min(line.quantity + 1, Number(selectedVariant.stockQuantity)) }
        : line);
    });
  };

  const updateQuantity = (variantId, value) => {
    const line = cartLines.find((item) => item.variantId === variantId);
    if (!line) return;
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setCart((current) => current.map((item) => item.variantId === variantId
      ? { ...item, quantity: Math.min(quantity, Number(line.variant.stockQuantity)) }
      : item));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (cartLines.length === 0) {
      setError("Vui lòng thêm ít nhất một sản phẩm vào phiếu bán.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axiosClient.post(api.inStoreOrder, {
        customerName,
        customerPhone,
        paymentMethod,
        items: cartLines.map((line) => ({
          variant: line.variantId,
          quantity: line.quantity,
        })),
      });
      setNotice(`Đã tạo phiếu ${data.clientOrderCode} · ${formatCurrency(data.totalPrice)}.`);
      const soldQuantities = new Map(
        cartLines.map((line) => [line.variantId, line.quantity]),
      );
      setVariants((current) => current.map((variant) => {
        const quantitySold = soldQuantities.get(getVariantId(variant));
        return quantitySold
          ? { ...variant, stockQuantity: Number(variant.stockQuantity) - quantitySold }
          : variant;
      }));
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setSearch("");
      setSelectedVariantId("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không thể tạo phiếu bán tại quầy.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={cx("loading")}><Loading /></div>;

  return (
    <section className={cx("page")}>
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>Quản lý đơn hàng</p>
          <h1>Tạo phiếu bán tại quầy</h1>
          <p className={cx("summary")}>
            Ghi nhận giao dịch trực tiếp tại cửa hàng. Phiếu được hoàn tất và trừ tồn kho ngay sau khi lưu.
          </p>
        </div>
      </header>

      {error && <div className={cx("alert", "error")} role="alert">{error}</div>}
      {notice && <div className={cx("alert", "success")} role="status">{notice}</div>}

      <form className={cx("saleForm")} onSubmit={handleSubmit}>
        <section className={cx("panel")}>
          <h2>Thông tin khách hàng</h2>
          <div className={cx("customerFields")}>
            <label>
              Họ tên khách hàng *
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                maxLength="120"
                autoComplete="name"
                required
              />
            </label>
            <label>
              Số điện thoại *
              <input
                type="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                pattern="(?:0[0-9]{9}|\+84[0-9]{9})"
                title="Nhập số điện thoại Việt Nam gồm 10 số hoặc +84 và 9 số."
                autoComplete="tel"
                required
              />
            </label>
            <label>
              Phương thức thanh toán *
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản</option>
              </select>
            </label>
          </div>
        </section>

        <section className={cx("panel")}>
          <h2>Sản phẩm bán</h2>
          <div className={cx("productPicker")}>
            <label>
              Tìm sản phẩm
              <input
                type="search"
                value={search}
                placeholder="Tên sản phẩm, SKU, màu hoặc bộ nhớ"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label>
              Phiên bản sản phẩm
              <select
                value={selectedVariantId}
                onChange={(event) => setSelectedVariantId(event.target.value)}
              >
                <option value="">Chọn sản phẩm / SKU</option>
                {visibleVariants.map((variant) => (
                  <option key={getVariantId(variant)} value={getVariantId(variant)}>
                    {variant.product?.title || "Sản phẩm"} · {variant.sku || "Không có SKU"} ·
                    {" "}{getCurrentPrice(variant).toLocaleString("vi-VN")} ₫ ·
                    {" "}Tồn: {variant.stockQuantity || 0}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={cx("addButton")}
              type="button"
              onClick={addSelectedVariant}
              disabled={!selectedVariant || Number(selectedVariant.stockQuantity) <= 0}
            >
              Thêm sản phẩm
            </button>
          </div>

          <div className={cx("tableWrap")}>
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {cartLines.map((line) => (
                  <tr key={line.variantId}>
                    <td>
                      <strong>{line.variant.product?.title || "Sản phẩm"}</strong>
                      <small>
                        {[line.variant.storage, ...(line.variant.colors || []), line.variant.sku]
                          .filter(Boolean).join(" · ") || "Phiên bản mặc định"}
                      </small>
                    </td>
                    <td>{formatCurrency(getCurrentPrice(line.variant))}</td>
                    <td>
                      <input
                        className={cx("quantityInput")}
                        aria-label={`Số lượng ${line.variant.product?.title || "sản phẩm"}`}
                        type="number"
                        min="1"
                        max={line.variant.stockQuantity}
                        step="1"
                        value={line.quantity}
                        onChange={(event) => updateQuantity(line.variantId, event.target.value)}
                      />
                      <small>Tồn: {line.variant.stockQuantity}</small>
                    </td>
                    <td className={cx("amount")}>
                      {formatCurrency(getCurrentPrice(line.variant) * line.quantity)}
                    </td>
                    <td>
                      <button
                        className={cx("removeButton")}
                        type="button"
                        onClick={() => setCart((current) => current.filter(
                          (item) => item.variantId !== line.variantId
                        ))}
                        aria-label={`Xóa ${line.variant.product?.title || "sản phẩm"} khỏi phiếu`}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {cartLines.length === 0 && (
                  <tr><td className={cx("empty")} colSpan="5">Chưa có sản phẩm trong phiếu bán.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={cx("totalRow")}>
            <span>Tổng thanh toán</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          {variants.length === 0 && (
            <p className={cx("hint")}>Chưa có phiên bản sản phẩm đang hoạt động.</p>
          )}
        </section>

        <button
          className={cx("submitButton")}
          type="submit"
          disabled={submitting || cartLines.length === 0 || variants.length === 0}
        >
          {submitting ? "Đang lưu phiếu..." : "Hoàn tất bán và trừ tồn kho"}
        </button>
      </form>
    </section>
  );
}

export default InStoreSale;
