import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import api from "~/api";
import axiosClient from "~/api/axiosClient";
import { useToast } from "~/contexts/ToastContext";
import { converseVND } from "~/utils/functions.jsx";
import styles from "./Favorites.module.scss";

const cx = classNames.bind(styles);

function Favorites() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = useSelector((state) => state.auth.token);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingIds, setPendingIds] = useState([]);

  useEffect(() => {
    if (!token) {
      showToast({ title: "Vui lòng đăng nhập để xem sản phẩm yêu thích.", type: "warning" });
      navigate("/login");
      return undefined;
    }

    let isCurrentRequest = true;
    setLoading(true);
    setError("");

    axiosClient
      .get(`${api.favorite}/user`)
      .then(({ data }) => {
        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu yêu thích không hợp lệ.");
        }
        if (isCurrentRequest) {
          setFavorites(data.filter((favorite) => favorite.product && typeof favorite.product === "object"));
        }
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(requestError.response?.data?.message || "Không thể tải danh sách yêu thích.");
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [navigate, showToast, token]);

  const handleRemoveFavorite = async (favorite) => {
    const productId = favorite.product._id || favorite.product.id;
    if (!productId) {
      showToast({ title: "Không tìm thấy sản phẩm cần xóa khỏi yêu thích.", type: "error" });
      return;
    }

    setPendingIds((currentIds) => [...currentIds, favorite._id]);
    try {
      await axiosClient.delete(api.favorite, { data: { product: productId } });
      setFavorites((currentFavorites) =>
        currentFavorites.filter((item) => item._id !== favorite._id)
      );
      showToast({ title: "Đã xóa sản phẩm khỏi danh sách yêu thích.", type: "success" });
    } catch (requestError) {
      showToast({
        title: requestError.response?.data?.message || "Không thể xóa sản phẩm khỏi danh sách yêu thích.",
        type: "error",
      });
    } finally {
      setPendingIds((currentIds) => currentIds.filter((id) => id !== favorite._id));
    }
  };

  return (
    <main className={cx("page")}>
      <div className={cx("container")}>
        <header className={cx("page-header")}>
          <div>
            <h1>Sản phẩm yêu thích</h1>
            <p>Danh sách sản phẩm bạn đã lưu để xem lại.</p>
          </div>
          <span className={cx("count")}>{favorites.length} sản phẩm</span>
        </header>

        {error && (
          <div className={cx("error")} role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className={cx("state")} role="status">Đang tải danh sách yêu thích...</div>
        ) : favorites.length === 0 ? (
          <div className={cx("state", "empty")}>
            <FontAwesomeIcon icon={faHeart} />
            <h2>Chưa có sản phẩm yêu thích</h2>
            <p>Hãy khám phá sản phẩm và lưu lại những món bạn quan tâm.</p>
            <button type="button" onClick={() => navigate("/products")}>
              Khám phá sản phẩm <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        ) : (
          <ul className={cx("list")}>
            {favorites.map((favorite) => {
              const product = favorite.product;
              const productId = product._id || product.id;
              const pending = pendingIds.includes(favorite._id);

              return (
                <li className={cx("row")} key={favorite._id}>
                  <button
                    type="button"
                    className={cx("product")}
                    onClick={() => navigate(`/product-detail/${productId}`)}
                    aria-label={`Xem chi tiết ${product.title}`}
                  >
                    <img src={product.avatar} alt={product.title} />
                    <span className={cx("product-info")}>
                      <span className={cx("product-title")}>{product.title}</span>
                      <span className={cx("price")}>{converseVND(product.minPrice)}</span>
                    </span>
                  </button>
                  <div className={cx("actions")}>
                    <button
                      type="button"
                      className={cx("buy-button")}
                      onClick={() => navigate(`/product-detail/${productId}`)}
                    >
                      Mua ngay
                    </button>
                    <button
                      type="button"
                      className={cx("remove-button")}
                      onClick={() => handleRemoveFavorite(favorite)}
                      disabled={pending}
                    >
                      <FontAwesomeIcon icon={faHeart} />
                      {pending ? "Đang xóa..." : "Hủy yêu thích"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

export default Favorites;
