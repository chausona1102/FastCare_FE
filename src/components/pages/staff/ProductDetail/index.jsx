import classNames from "classnames/bind";
import style from "./ProductDetail.module.scss";
const cx = classNames.bind(style);

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPen } from "@fortawesome/free-solid-svg-icons";

import api from "~/api";
import { LoadingProduct } from "~/components/Loading";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const nfc = product?.specifications?.phone?.nfc ?? product?.nfc;
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${api.product}/${id}`);
      setProduct(response.data);
    } catch (err) {
      setError("Lỗi khi tải chi tiết sản phẩm");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  if (loading)
    return (
      <div className={cx("wrapper")}>
        <LoadingProduct />
      </div>
    );
  if (error)
    return (
      <div className={cx("wrapper")}>
        <div className={cx("error")}>{error}</div>
      </div>
    );
  if (!product)
    return (
      <div className={cx("wrapper")}>
        <div className={cx("error")}>Không tìm thấy sản phẩm</div>
      </div>
    );

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.avatar];

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <button
          className={cx("btn-back")}
          onClick={() => navigate("/staff/products")}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </button>
        <h1>{product.title}</h1>
        <button
          className={cx("btn-edit")}
          onClick={() => navigate(`/staff/products/${id}/edit`)}
        >
          <FontAwesomeIcon icon={faPen} /> Chỉnh sửa
        </button>
      </div>

      <div className={cx("content")}>
        <div className={cx("images-section")}>
          <div className={cx("main-image")}>
            <img src={images[currentImageIndex]} alt={product.title} />
          </div>
          {images.length > 1 && (
            <div className={cx("thumbnails")}>
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.title} ${idx + 1}`}
                  className={cx({ active: idx === currentImageIndex })}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={cx("info-section")}>
          <div className={cx("basic-info")}>
            <h2>{product.title}</h2>
            <div className={cx("price")}>
              <span className={cx("label")}>Giá:</span>
              <span className={cx("value")}>
                {formatPrice(product.minPrice)}
              </span>
            </div>
            {product.discount > 0 && (
              <div className={cx("discount")}>
                <span className={cx("label")}>Giảm giá:</span>
                <span className={cx("value")}>{product.discount}%</span>
              </div>
            )}
            <div className={cx("sold")}>
              <span className={cx("label")}>Đã bán:</span>
              <span className={cx("value")}>{product.sold}</span>
            </div>
            <div className={cx("status")}>
              <span className={cx("label")}>Trạng thái:</span>
              <span
                className={cx(
                  "badge",
                  product.deletedAt === null ? "selling" : "hidden",
                )}
              >
                {product.deletedAt === null ? "Đang bán" : "Đã ẩn"}
              </span>
            </div>
          </div>

          <div className={cx("specs")}>
            <h3>Thông số kỹ thuật</h3>
            <div className={cx("spec-grid")}>
              {product.brand && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Thương hiệu:</span>
                  <span className={cx("value")}>{product.brand}</span>
                </div>
              )}
              {product.category && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Danh mục:</span>
                  <span className={cx("value")}>{product.category.name}</span>
                </div>
              )}
              {product.ram && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>RAM:</span>
                  <span className={cx("value")}>{product.ram}</span>
                </div>
              )}
              {product.storage && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Bộ nhớ:</span>
                  <span className={cx("value")}>{product.storage}</span>
                </div>
              )}
              {product.screenSize && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Kích thước màn hình:</span>
                  <span className={cx("value")}>{product.screenSize}"</span>
                </div>
              )}
              {product.displayTech && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Công nghệ màn hình:</span>
                  <span className={cx("value")}>{product.displayTech}</span>
                </div>
              )}
              {product.rearCamera && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Camera sau:</span>
                  <span className={cx("value")}>{product.rearCamera}</span>
                </div>
              )}
              {product.frontCamera && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Camera trước:</span>
                  <span className={cx("value")}>{product.frontCamera}</span>
                </div>
              )}
              {product.chipset && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Chipset:</span>
                  <span className={cx("value")}>{product.chipset}</span>
                </div>
              )}
              {product.cpu && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>CPU:</span>
                  <span className={cx("value")}>{product.cpu}</span>
                </div>
              )}
              {product.os && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Hệ điều hành:</span>
                  <span className={cx("value")}>{product.os}</span>
                </div>
              )}
              {product.screenResolution && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Độ phân giải:</span>
                  <span className={cx("value")}>
                    {product.screenResolution}
                  </span>
                </div>
              )}
              {product.sim && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>Sim:</span>
                  <span className={cx("value")}>{product.sim}</span>
                </div>
              )}
              {nfc !== undefined && nfc !== null && nfc !== "" && (
                <div className={cx("spec-item")}>
                  <span className={cx("label")}>NFC:</span>
                  <span className={cx("value")}>
                    {nfc === true || nfc === "true"
                      ? "Có"
                      : nfc === false || nfc === "false"
                        ? "Không"
                        : nfc}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={cx("dates")}>
            <p>
              <span className={cx("label")}>Ngày tạo:</span>
              {new Date(product.createdAt).toLocaleString("vi-VN")}
            </p>
            <p>
              <span className={cx("label")}>Ngày cập nhật:</span>
              {new Date(product.updatedAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
