import { useState } from "react";

import css from "./RestUserReviewedCard.module.css";

import profilepic from "../../utils/images/food1.jpg";
import RatingNumberBox from "../RestaurantUtils/RatingNumberBox/RatingNumberBox";

const RestUserReviewedCard = (props) => {
  console.log(props);
  let {
    restName,
    userName,
    rating,
    feedback,
    restId,
    userId,
    createdAt,
    // userImg
  } = props?.data;

  const formattedDate = new Date(createdAt * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <>
      <div className={css.outerDiv}>
        <div className={css.innerDiv}>
          <div className={css.sec1}>
            <div className={css.leftBox}>
              <div className={css.imgBox}>
                <img
                  className={css.hotelImg}
                  src={profilepic}
                  alt="hotel image"
                />
              </div>
              <div className={css.txtBox1}>
                <div className={css.title}>{restName}</div>
              </div>
            </div>
            <span className={css.delTxt}> {formattedDate} </span>
          </div>
          <div className={css.sec}>
            <span className={css.delivery}>
              {" "}
              <RatingNumberBox
                stars={rating}
                txt={rating}
                iconR={false}
                isActive={true}
              />{" "}
            </span>
            <span className={css.delivery}> {feedback}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestUserReviewedCard;
