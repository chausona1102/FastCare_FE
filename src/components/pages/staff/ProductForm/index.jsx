import classNames from "classnames/bind";
import style from "./ProductForm.module.scss";
const cx = classNames.bind(style);

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import Loading from "~/components/Loading";

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    minPrice: "",
    discount: 0,
    sold: 0,
    brand: "",
    ram: "",
    storage: "",
    screenSize: "",
    displayTech: "",
    rearCamera: "",
    frontCamera: "",
    chipset: "",
    nfc: false,
    sim: "",
    os: "",
    screenResolution: "",
    cpu: "",
  });

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api.product}/${id}`);
      setFormData((prev) => ({
        ...prev,
        ...response.data,
      }));
    } catch (err) {
      setError("Lỗi khi tải thông tin sản phẩm");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      setError("Vui lòng nhập tên sản phẩm");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      if (isEdit) {
        console.log(formData);
        const token = localStorage.getItem("fastcare_access_token");
        await axios.patch(`${api.product}/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess("Cập nhật sản phẩm thành công!");
        setTimeout(() => navigate("/staff/products"), 1500);
      } else {
        await axios.post(`${api.product}`, formData);
        setSuccess("Thêm sản phẩm thành công!");
        setTimeout(() => navigate("/staff/products"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lưu sản phẩm");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className={cx("wrapper")}>
        <Loading />
      </div>
    );

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <button
          className={cx("btn-back")}
          onClick={() => navigate("/staff/products")}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </button>
        <h1>{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
      </div>

      <form className={cx("form-container")} onSubmit={handleSubmit}>
        {error && <div className={cx("error")}>{error}</div>}
        {success && <div className={cx("success")}>{success}</div>}

        <div className={cx("form-group")}>
          <label htmlFor="title">Tên sản phẩm *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div className={cx("form-row")}>
          <div className={cx("form-group")}>
            <label htmlFor="minPrice">Giá (VNĐ)</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={formData.minPrice}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div className={cx("form-group")}>
            <label htmlFor="discount">Giảm giá (%)</label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className={cx("form-row")}>
          <div className={cx("form-group")}>
            <label htmlFor="sold">Đã bán</label>
            <input
              type="number"
              id="sold"
              name="sold"
              value={formData.sold}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className={cx("form-group")}>
            <label htmlFor="brand">Thương hiệu</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="VD: iPhone, Samsung..."
            />
          </div>
        </div>

        <div className={cx("form-row")}>
          <div className={cx("form-group")}>
            <label htmlFor="ram">RAM</label>
            <input
              type="text"
              id="ram"
              name="ram"
              value={formData.ram}
              onChange={handleChange}
              placeholder="VD: 8GB"
            />
          </div>
          <div className={cx("form-group")}>
            <label htmlFor="storage">Bộ nhớ</label>
            <input
              type="text"
              id="storage"
              name="storage"
              value={formData.storage}
              onChange={handleChange}
              placeholder="VD: 128GB"
            />
          </div>
        </div>

        <div className={cx("form-row")}>
          <div className={cx("form-group")}>
            <label htmlFor="screenSize">Kích thước màn hình (")</label>
            <input
              type="number"
              id="screenSize"
              name="screenSize"
              value={formData.screenSize}
              onChange={handleChange}
              placeholder="VD: 6.1"
              step="0.1"
            />
          </div>
          <div className={cx("form-group")}>
            <label htmlFor="displayTech">Công nghệ màn hình</label>
            <input
              type="text"
              id="displayTech"
              name="displayTech"
              value={formData.displayTech}
              onChange={handleChange}
              placeholder="VD: OLED"
            />
          </div>
        </div>

        <div className={cx("form-row")}>
          <div className={cx("form-group")}>
            <label htmlFor="rearCamera">Camera sau</label>
            <input
              type="text"
              id="rearCamera"
              name="rearCamera"
              value={formData.rearCamera}
              onChange={handleChange}
              placeholder="VD: 48MP"
            />
          </div>
          <div className={cx("form-group")}>
            <label htmlFor="frontCamera">Camera trước</label>
            <input
              type="text"
              id="frontCamera"
              name="frontCamera"
              value={formData.frontCamera}
              onChange={handleChange}
              placeholder="VD: 12MP"
            />
          </div>
        </div>

        <div className={cx("form-row")}>
          <div className={cx("form-group")}>
            <label htmlFor="chipset">Chipset</label>
            <input
              type="text"
              id="chipset"
              name="chipset"
              value={formData.chipset}
              onChange={handleChange}
              placeholder="VD: A18"
            />
          </div>
          <div className={cx("form-group")}>
            <label htmlFor="cpu">CPU</label>
            <input
              type="text"
              id="cpu"
              name="cpu"
              value={formData.cpu}
              onChange={handleChange}
              placeholder="VD: 6 core"
            />
          </div>
        </div>

        <div className={cx("form-row")}>
          <div className={cx("form-group")}>
            <label htmlFor="os">Hệ điều hành</label>
            <input
              type="text"
              id="os"
              name="os"
              value={formData.os}
              onChange={handleChange}
              placeholder="VD: iOS 18"
            />
          </div>
          <div className={cx("form-group")}>
            <label htmlFor="screenResolution">Độ phân giải</label>
            <input
              type="text"
              id="screenResolution"
              name="screenResolution"
              value={formData.screenResolution}
              onChange={handleChange}
              placeholder="VD: 2556 x 1179"
            />
          </div>
        </div>

        <div className={cx("form-row")}>
          <div className={cx("form-group")}>
            <label htmlFor="sim">Sim</label>
            <input
              type="text"
              id="sim"
              name="sim"
              value={formData.sim}
              onChange={handleChange}
              placeholder="VD: 2 Sim"
            />
          </div>
          <div className={cx("form-group")}>
            <label className={cx("checkbox")}>
              <span>NFC</span>
              <input
                type="checkbox"
                name="nfc"
                checked={formData.nfc}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        <div className={cx("button-group")}>
          <button
            type="submit"
            className={cx("btn-submit")}
            disabled={submitting}
          >
            {submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm"}
          </button>
          <button
            type="button"
            className={cx("btn-cancel")}
            onClick={() => navigate("/staff/products")}
            disabled={submitting}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
