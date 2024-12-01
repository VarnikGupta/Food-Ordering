import { useState } from "react";

import css from "./UserReviewedCard.module.css";

import starImg from "../../../../images/star.png";
import imgSrc from "../../../../images/profilepic.jpg";
import RatingNumberBox from "../../../../RestaurantUtils/RatingNumberBox/RatingNumberBox"

const UserReviewedCard = (props) => {
  const { restName, feedback, rating, createdAt, username } = props?.data || {};

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
                <img className={css.hotelImg} src={imgSrc} alt="hotel image" />
              </div>
              <div className={css.txtBox1}>
                <div className={css.title}>{restName}</div>
              </div>
            </div>
            <div className={css.rightBox}>
              <span className={css.delTxt}> {formattedDate} </span>
            </div>
          </div>
          <div className={css.sec}>
            <span className={css.delivery}>
            <RatingNumberBox
                stars={rating}
                txt={rating}
                iconR={false}
                isActive={true}
              />{" "}
              <span className={css.days}>
                {feedback}
              </span>
            </span>
          </div>
          <div className={css.sec}></div>
        </div>
      </div>
    </>
  );
};

export default UserReviewedCard;
