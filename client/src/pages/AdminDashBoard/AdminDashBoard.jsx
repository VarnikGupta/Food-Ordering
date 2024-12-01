import React, { useState, useEffect } from "react";
import css from "./AdminDashBoard.module.css";
import imgSrc from "../../utils/images/food1.jpg";

import LogIn from "../../components/LogIn/LogIn";
import SignUp from "../../components/SignUp/SignUp";

const AdminDashBoard = () => {
  return (
    <>
      <div className={css.outermost}>
        <div className={css.outerDiv}>
          <div className={css.innerDiv}>
            <div className={css.sec1}>
              <div className={css.leftBox}>
                <div className={css.imgBox}>
                  <img
                    className={css.hotelImg}
                    src={imgSrc}
                    alt="hotel image"
                  />
                </div>
                <div className={css.txtBox1}>
                  <div className={css.title}>{"restName"}</div>
                </div>
              </div>
              <div className={css.rightBox}>
                <span className={css.delTxt}> {"formattedDate"} </span>
              </div>
            </div>
            <div className={css.sec}>
              <span className={css.delivery}>
                {/* <RatingNumberBox
                stars={rating}
                txt={rating}
                iconR={false}
                isActive={true}
                />{" "} */}
                <span className={css.days}>{"feedback"}</span>
              </span>
            </div>
            <div className={css.sec}>jnjn</div>
          </div>
        </div>
        <div className={css.outerDiv}>
          <div className={css.innerDiv}>
            <div className={css.sec1}>
              <div className={css.leftBox}>
                <div className={css.imgBox}>
                  <img
                    className={css.hotelImg}
                    src={imgSrc}
                    alt="hotel image"
                  />
                </div>
                <div className={css.txtBox1}>
                  <div className={css.title}>{"restName"}</div>
                </div>
              </div>
              <div className={css.rightBox}>
                <span className={css.delTxt}> {"formattedDate"} </span>
              </div>
            </div>
            <div className={css.sec}>
              <span className={css.delivery}>
                {/* <RatingNumberBox
                stars={rating}
                txt={rating}
                iconR={false}
                isActive={true}
                />{" "} */}
                <span className={css.days}>{"feedback"}</span>
              </span>
            </div>
            <div className={css.sec}>jnjn</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashBoard;
