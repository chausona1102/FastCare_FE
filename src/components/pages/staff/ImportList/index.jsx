import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames/bind";

import api from "~/api";
import axiosClient from "~/api/axiosClient";
import { LoadingProduct } from "~/components/Loading";
import styles from "./Imports.module.scss";

const cx = classNames.bind(styles);

const formatCurrency = (value) => {
  const numericValue = Number(value || 0);
  return `${numericValue.toLocaleString("vi-VN")} ₫`;
};

function ImportList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [costDrafts, setCostDrafts] = useState({});
  const [updatingCostId, setUpdatingCostId] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setError("");
      try {
        const { data } = await axiosClient.get(api.imports, {
          params: { limit: 100 },
          signal: controller.signal,
        });
        setRecords(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.response?.data?.message ||
              "Không thể tải thông tin nhập hàng.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, []);

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (left, right) =>
          new Date(right.effectiveAt || right.createdAt || 0) -
          new Date(left.effectiveAt || left.createdAt || 0),
      ),
    [records],
  );

  const visibleRecords = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");

    return sortedRecords.filter((record) => {
      if (!keyword) return true;

      const text = [
        record.product?.title,
        record.sku,
        record.variant?.sku,
        record.supplier,
        record.note,
        record.importedBy?.fullname,
        record.importedBy?.username,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi");

      return text.includes(keyword);
    });
  }, [search, sortedRecords]);

  const summary = useMemo(() => {
    const totalQuantity = records.reduce(
      (sum, record) => sum + (Number(record.quantity) || 0),
      0,
    );
    const totalValue = records.reduce((sum, record) => {
      const quantity = Number(record.quantity) || 0;
      const unitCost = Number(record.unitCost) || 0;
      return sum + quantity * unitCost;
    }, 0);

    return {
      totalQuantity,
      totalValue,
      latestRecord: sortedRecords.length
        ? new Date(
            sortedRecords[0].effectiveAt || sortedRecords[0].createdAt,
          ).toLocaleDateString("vi-VN")
        : "-",
    };
  }, [records, sortedRecords]);

  const updateMissingCost = async (event, recordId) => {
    event.preventDefault();
    const unitCost = costDrafts[recordId];
    if (unitCost === undefined || unitCost === "" || Number(unitCost) < 0) {
      setError("Vui lòng nhập đơn giá nhập hợp lệ.");
      return;
    }

    setError("");
    setNotice("");
    setUpdatingCostId(recordId);
    try {
      const { data } = await axiosClient.patch(
        `${api.imports}/${recordId}/unit-cost`,
        { unitCost: Number(unitCost) },
      );
      setRecords((current) =>
        current.map((record) =>
          record._id === recordId
            ? { ...record, unitCost: data.unitCost }
            : record,
        ),
      );
      setNotice("Đã bổ sung đơn giá cho phiếu nhập.");
      setCostDrafts((current) => {
        const next = { ...current };
        delete next[recordId];
        return next;
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể cập nhật đơn giá phiếu nhập.",
      );
    } finally {
      setUpdatingCostId("");
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
      <header className={cx("pageHeader")}>
        <div>
          <p className={cx("eyebrow")}>Kho hàng</p>
          <h1>Danh sách phiếu nhập</h1>
          <p className={cx("summary")}>
            Theo dõi lịch sử nhập hàng, đơn giá và giá trị tồn kho theo từng
            phiếu.
          </p>
        </div>
        <Link className={cx("primaryButton")} to="/staff/imports/create">
          Tạo phiếu nhập
        </Link>
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

      <div className={cx("summaryCards")}>
        <article className={cx("statCard")}>
          <span className={cx("label")}>Tổng phiếu</span>
          <strong className={cx("value")}>{records.length}</strong>
          <small className={cx("meta")}>phiếu nhập</small>
        </article>
        <article className={cx("statCard")}>
          <span className={cx("label")}>Sản phẩm nhập</span>
          <strong className={cx("value")}>{summary.totalQuantity}</strong>
          <small className={cx("meta")}>sản phẩm</small>
        </article>
        <article className={cx("statCard")}>
          <span className={cx("label")}>Tổng giá trị</span>
          <strong className={cx("value")}>
            {formatCurrency(summary.totalValue)}
          </strong>
          <small className={cx("meta")}>đã nhập</small>
        </article>
        <article className={cx("statCard")}>
          <span className={cx("label")}>Cập nhật gần nhất</span>
          <strong className={cx("value", "compact")}>
            {summary.latestRecord}
          </strong>
          <small className={cx("meta")}>mới nhất</small>
        </article>
      </div>

      <div className={cx("toolbar")}>
        <input
          type="search"
          value={search}
          placeholder="Tìm kiếm theo sản phẩm, SKU, NCC, người nhập..."
          aria-label="Tìm phiếu nhập"
          onChange={(event) => setSearch(event.target.value)}
        />
        <span>{visibleRecords.length} phiếu</span>
      </div>

      <div className={cx("tableWrap")}>
        <table>
          <thead>
            <tr>
              <th>Ngày hiệu lực</th>
              <th>Sản phẩm / SKU</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Giá trị</th>
              <th>Nhà cung cấp</th>
              <th>Người nhập</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record, index) => {
              const recordId =
                record._id ||
                record.id ||
                `${record.createdAt || "created"}-${index}`;
              const itemName = record.product?.title || "Sản phẩm";
              const sku = record.sku || record.variant?.sku || "-";
              const totalCost =
                (Number(record.quantity) || 0) * (Number(record.unitCost) || 0);

              return (
                <tr key={recordId}>
                  <td>
                    {new Date(
                      record.effectiveAt || record.createdAt,
                    ).toLocaleString("vi-VN")}
                    {record.isBackfill && <small>Phiếu nhập bù lịch sử</small>}
                  </td>
                  <td>
                    <div className={cx("productCell")}>
                      <span className={cx("productName")}>{itemName}</span>
                      <small>{sku}</small>
                    </div>
                  </td>
                  <td className={cx("quantity")}>
                    +{Number(record.quantity) || 0}
                  </td>
                  <td>
                    {record.unitCost == null ? (
                      <form
                        className={cx("missingCostForm")}
                        onSubmit={(event) => updateMissingCost(event, recordId)}
                      >
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={costDrafts[recordId] ?? ""}
                          aria-label={`Đơn giá nhập cho phiếu ${sku}`}
                          onChange={(event) =>
                            setCostDrafts((current) => ({
                              ...current,
                              [recordId]: event.target.value,
                            }))
                          }
                          required
                        />
                        <button
                          type="submit"
                          disabled={updatingCostId === recordId}
                        >
                          {updatingCostId === recordId
                            ? "Đang lưu..."
                            : "Bổ sung"}
                        </button>
                      </form>
                    ) : (
                      formatCurrency(record.unitCost)
                    )}
                  </td>
                  <td className={cx("amount")}>{formatCurrency(totalCost)}</td>
                  <td>{record.supplier || "-"}</td>
                  <td>
                    {record.importedBy?.fullname ||
                      record.importedBy?.username ||
                      "-"}
                  </td>
                  <td className={cx("notes")}>{record.note || "-"}</td>
                </tr>
              );
            })}
            {visibleRecords.length === 0 && (
              <tr>
                <td className={cx("emptyState")} colSpan="8">
                  Không tìm thấy phiếu nhập nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ImportList;
