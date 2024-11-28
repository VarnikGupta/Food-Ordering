import React from "react";

import css from "./OrderTitleComponent.module.css";

import RatingUtil from "../../utils/RestaurantUtils/RatingUtil/RatingUtil";

const OrderTitleComponent = ({ details }) => {
  console.log("yha pe",details);
  return (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.left}>
          <div className={css.title}>Krupa Mess & Tiffins</div>
          {/* <div className={css.specials}>South Indian, Chinese, North Indian, Sichuan, Pizza</div> */}
          <div className={css.address}>Abids, Hyderabad</div>
          <div className={css.timings}>
            <span className={css.opORclo}>Contact now -</span>
            <span className={css.time}>89658673</span>
          </div>
        </div>
        <div className={css.right}>
          <RatingUtil rating="4.1" count="601" txt="Reviews" />
        </div>
      </div>
    </div>
  );
};

export default OrderTitleComponent;
