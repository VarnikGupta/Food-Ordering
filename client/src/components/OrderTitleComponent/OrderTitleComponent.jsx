import React from "react";

import css from "./OrderTitleComponent.module.css";

import RatingUtil from "../../utils/RestaurantUtils/RatingUtil/RatingUtil";

const OrderTitleComponent = ({ details }) => {
  if (!details) {
    return <div className={css.outerDiv}>Loading...</div>;
  }

  const {
    name = "N/A",
    location = {},
    contact = "N/A",
    rating = 0,
    ratingCount = 0,
  } = details;

  const { addressLine, street, state, country, pincode } = location;

  return (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.left}>
          <div className={css.title}>{name}</div>
          <div className={css.address}>
            {`${addressLine || ""}, ${street || ""}, ${state || ""}, ${country || ""} - ${pincode || ""}`}
          </div>
          <div className={css.timings}>
            <span className={css.opORclo}>Contact now - </span>
            <span className={css.time}>{contact}</span>
          </div>
        </div>
        <div className={css.right}>
          <RatingUtil
            rating={rating.toFixed(1)}
            count={ratingCount}
            txt="Reviews"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderTitleComponent;
