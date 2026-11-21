import { useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownWideShort,
  faMagnifyingGlass,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import axiosClient from "~/api/axiosClient";
import styles from "./Leaderboard.module.scss";

const cx = classNames.bind(styles);
const FETCH_SIZE = 20;
const PAGE_SIZE = 10;
const RANKS = ["silver", "gold", "platinum", "diamond", "black"];
const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function Leaderboard() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const loadMoreController = useRef(null);

  useEffect(() => {
    loadMoreController.current?.abort();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setLoadingMore(false);
      setError("");
      setItems([]);
      setTotal(0);
      setHasNextPage(false);
      setCurrentPage(1);

      try {
        const { data } = await axiosClient.get("/api/rank/leaderboard", {
          params: {
            page: 1,
            limit: FETCH_SIZE,
            search: search.trim(),
            rank: selectedRank,
          },
          signal: controller.signal,
        });
        setItems(data.items);
        setTotal(data.total);
        setHasNextPage(data.hasNextPage);
        setCurrentPage(1);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.response?.data?.message ||
              "Không thể tải bảng xếp hạng. Vui lòng thử lại.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, search ? 300 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
      loadMoreController.current?.abort();
    };
  }, [search, selectedRank]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const visibleItems = items.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const loadMore = async (advancePage = false) => {
    if (loadingMore || !hasNextPage) return;

    const controller = new AbortController();
    loadMoreController.current = controller;
    setLoadingMore(true);
    setError("");
    try {
      const { data } = await axiosClient.get("/api/rank/leaderboard", {
        params: {
          page: Math.floor(items.length / FETCH_SIZE) + 1,
          limit: FETCH_SIZE,
          search: search.trim(),
          rank: selectedRank,
        },
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setItems((currentItems) => [...currentItems, ...data.items]);
        setHasNextPage(data.hasNextPage);
        if (advancePage) {
          setCurrentPage((page) => page + 1);
        }
      }
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(
          requestError.response?.data?.message ||
            "Không thể tải thêm dữ liệu. Vui lòng thử lại.",
        );
      }
    } finally {
      setLoadingMore(false);
      if (loadMoreController.current === controller) {
        loadMoreController.current = null;
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage * PAGE_SIZE < items.length) {
      setCurrentPage((page) => page + 1);
      return;
    }
    loadMore(true);
  };

  return (
    <section className={cx("page")}>
      <header className={cx("pageHeader")}>
        <div className={cx("titleGroup")}>
          <div className={cx("titleIcon")} aria-hidden="true">
            <FontAwesomeIcon icon={faTrophy} />
          </div>
          <div>
            <p className={cx("eyebrow")}>Khách hàng</p>
            <h1>Bảng xếp hạng</h1>
          </div>
        </div>
        <p className={cx("description")}>
          Tôn vinh khách hàng theo tổng chi tiêu tích lũy.
        </p>
      </header>

      <div className={cx("summaryCard")}>
        <div className={cx("summaryIcon")} aria-hidden="true">
          <FontAwesomeIcon icon={faArrowDownWideShort} />
        </div>
        <div>
          <strong>{total.toLocaleString("vi-VN")}</strong>
          <span>khách hàng xếp hạng theo tổng chi tiêu giảm dần</span>
        </div>
      </div>

      <div className={cx("toolbar")}>
        <label className={cx("searchField")}>
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên hoặc rank..."
            aria-label="Tìm theo tên hoặc rank"
          />
        </label>
        <label className={cx("filterField")}>
          <span>Lọc theo rank</span>
          <select
            value={selectedRank}
            onChange={(event) => setSelectedRank(event.target.value)}
            aria-label="Lọc theo rank"
          >
            <option value="">Tất cả rank</option>
            {RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank.charAt(0).toUpperCase() + rank.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className={cx("alert")} role="alert">
          {error}
        </div>
      )}

      <div className={cx("tableWrap")}>
        <table className={cx("leaderboardTable")}>
          <thead>
            <tr>
              <th scope="col">Thứ hạng</th>
              <th scope="col">Khách hàng</th>
              <th scope="col">Rank</th>
              <th scope="col">Tổng chi tiêu</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className={cx("emptyState")} colSpan={4} role="status">
                  Đang tải bảng xếp hạng...
                </td>
              </tr>
            ) : (
              <>
                {visibleItems.map((item, index) => {
                  const position = (currentPage - 1) * PAGE_SIZE + index + 1;
                  return (
                    <tr key={item._id}>
                      <td>
                        <span className={cx("position", { top: position <= 3 })}>
                          {position <= 3 && (
                            <FontAwesomeIcon
                              icon={faTrophy}
                              aria-hidden="true"
                            />
                          )}
                          #{position}
                        </span>
                      </td>
                      <td>
                        <div className={cx("customer")}>
                          {item.user.avatar ? (
                            <img
                              className={cx("avatar")}
                              src={item.user.avatar}
                              alt=""
                            />
                          ) : (
                            <span className={cx("avatarFallback")} aria-hidden="true">
                              {(item.user.fullname || "?").charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div>
                            <strong>{item.user.fullname}</strong>
                            <small>{item.user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={cx("rankBadge", item.rank)}>
                          {item.rank}
                        </span>
                      </td>
                      <td className={cx("totalSpent")}>
                        {CURRENCY_FORMATTER.format(item.totalSpent || 0)}
                      </td>
                    </tr>
                  );
                })}
                {visibleItems.length === 0 && (
                  <tr>
                    <td className={cx("emptyState")} colSpan={4}>
                      Không tìm thấy khách hàng phù hợp.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 0 && (
        <nav className={cx("pagination")} aria-label="Phân trang bảng xếp hạng">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            Trước
          </button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages || loadingMore}
            onClick={handleNextPage}
          >
            {loadingMore ? "Đang tải..." : "Sau"}
          </button>
        </nav>
      )}

      {!loading && hasNextPage && (
        <button
          className={cx("loadMore")}
          type="button"
          disabled={loadingMore}
          onClick={() => loadMore()}
        >
          {loadingMore ? "Đang tải..." : "Tải thêm khách hàng"}
        </button>
      )}
    </section>
  );
}

export default Leaderboard;
