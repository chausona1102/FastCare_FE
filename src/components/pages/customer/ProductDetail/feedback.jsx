
import style from "./ProductDetail.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faXmark } from "@fortawesome/free-solid-svg-icons";

import Button from "~/components/Button";
import Title from "~/components/Title";
import { formatDateHour } from "~/utils/functions.jsx";

function Feedback({
  feedbacks,
  currentFeedBack,
  setCurrentFeedBack,
  feedBack,
  setFeedBack,
  currentPage,
  setCurrentPage,
  starRating,
  amountOfStar,
  setFeedBackByStar,
}) {
  const itemsPerPage = 3;
  const [previewImage, setPreviewImage] = useState(null);

  const paginatedFeedBack = currentFeedBack.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className={cx("feedback")}>
      {previewImage && (
        <div
          className={cx("image-preview-overlay")}
          onClick={() => setPreviewImage(null)}
          role="presentation"
        >
          <div
            className={cx("image-preview-box")}
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              className={cx("image-preview-close")}
              onClick={() => setPreviewImage(null)}
              aria-label="Đóng ảnh lớn"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <img src={previewImage} alt="Ảnh sản phẩm đánh giá" />
          </div>
        </div>
      )}
      <Title title="Đánh giá sản phẩm" className={cx("title")} />
      <div className={cx("star-fb")}>
        <div className={cx("container")}>
          <h1>
            {starRating()}
            <span>/5.0</span>
          </h1>
          <h2>
            {Array.from({ length: 5 }, (_, i) => (
              <FontAwesomeIcon key={i} icon={faStar} />
            ))}
          </h2>
        </div>
        <div className={cx("container")}>
          <Button
            onClick={() => {
              setCurrentFeedBack(feedbacks);
              setFeedBack("all");
              setCurrentPage(0);
            }}
            outline
            size="medium"
            className={cx("btn-feedback", { active: feedBack === "all" })}
          >
            Tất cả ({feedbacks.length})
          </Button>
          <Button
            onClick={() => {
              setCurrentFeedBack(setFeedBackByStar(feedbacks, 5));
              setFeedBack("5");
              setCurrentPage(0);
            }}
            outline
            size="medium"
            className={cx("btn-feedback", { active: feedBack === "5" })}
          >
            5 sao ({amountOfStar(5)})
          </Button>
          <Button
            onClick={() => {
              setCurrentFeedBack(setFeedBackByStar(feedbacks, 4));
              setFeedBack("4");
              setCurrentPage(0);
            }}
            outline
            size="medium"
            className={cx("btn-feedback", { active: feedBack === "4" })}
          >
            4 sao ({amountOfStar(4)})
          </Button>
          <Button
            onClick={() => {
              setCurrentFeedBack(setFeedBackByStar(feedbacks, 3));
              setFeedBack("3");
              setCurrentPage(0);
            }}
            outline
            size="medium"
            className={cx("btn-feedback", { active: feedBack === "3" })}
          >
            3 sao ({amountOfStar(3)})
          </Button>
          <Button
            onClick={() => {
              setCurrentFeedBack(setFeedBackByStar(feedbacks, 2));
              setFeedBack("2");
              setCurrentPage(0);
            }}
            outline
            size="medium"
            className={cx("btn-feedback", { active: feedBack === "2" })}
          >
            2 sao ({amountOfStar(2)})
          </Button>
          <Button
            onClick={() => {
              setCurrentFeedBack(setFeedBackByStar(feedbacks, 1));
              setFeedBack("1");
              setCurrentPage(0);
            }}
            outline
            size="medium"
            className={cx("btn-feedback", { active: feedBack === "1" })}
          >
            1 sao ({amountOfStar(1)})
          </Button>
        </div>
      </div>
      <div className={cx("feedback-column")}>
        {paginatedFeedBack.length > 0 ? (
          paginatedFeedBack.map((feed) => (
            <div key={feed.id} className={cx("row")}>
              <div className={cx("col-1")}>
                <img src={feed.user.avatar} alt={feed.user.fullname} />
              </div>
              <div className={cx("col-11")}>
                <span className={cx("name")}>{feed.user.fullname}</span>
                <span className={cx("star")}>
                  {Array.from({ length: feed.star }, (_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} />
                  ))}
                </span>
                {feed.feedbackTags && (
                  <div className={cx("tags")}>
                    {feed.feedbackTags.matchDescription && (
                      <span className={cx("tag")}>Đúng mô tả</span>
                    )}
                    {feed.feedbackTags.deliverySpeed && (
                      <span className={cx("tag")}>Giao nhanh</span>
                    )}
                    {feed.feedbackTags.quality && (
                      <span className={cx("tag")}>Chất lượng tốt</span>
                    )}
                  </div>
                )}
                <span className={cx("date")}>
                  {formatDateHour(feed.createdAt)}
                </span>
                <span className={cx("feedback-text")}>{feed.feedback}</span>
                <div className={cx("images")}>
                  {feed.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="review"
                      onClick={() => setPreviewImage(img)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setPreviewImage(img);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <h2>Không có bài đánh giá nào</h2>
        )}

        <div className={cx("pagination")}>
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ‹
          </button>

          {Array.from(
            { length: Math.ceil(currentFeedBack.length / itemsPerPage) },
            (_, i) => (
              <button
                key={i}
                className={cx({ active: i === currentPage })}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </button>
            )
          )}

          <button
            disabled={
              currentPage ===
              Math.ceil(currentFeedBack.length / itemsPerPage) - 1
            }
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default Feedback;