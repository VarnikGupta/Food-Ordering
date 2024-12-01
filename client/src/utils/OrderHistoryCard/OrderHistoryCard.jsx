import { useState } from "react";

import css from "./OrderHistoryCard.module.css";
import heartO from "../images/icons/heartO.png";
import heartF from "../images/icons/heartF.png";
import OrderDetails from "../OrderDetailsModal/OrderDetails";

import { useParams } from "react-router-dom";
import axios from "axios";

const OrderHistoryCard = ({ udata, setViewDet, setOrderId }) => {
  const {
    orderId,
    imgSrc,
    name,
    address,
    orderNum,
    items,
    orderedOn,
    itemTotal,
    coupon,
    taxesandcharges,
    totalSavings,
    grandTotal,
    paymentType,
    status,
    phoneNum,
    deliveredTo,
    fssaiNo,
    fav,
    summaryLinkId,
    isFavourite,
  } = udata;
  let [like, setLike] = useState(isFavourite || false);
  const [error, setError] = useState(null);

  const loginUser = JSON.parse(localStorage.getItem("auth"));
  const { id } = useParams();

  const handleLikeToggle = async () => {
    if (!loginUser || !loginUser.token) {
      alert("Unauthorized access. Please log in.");
      return;
    }

    try {
      // API call to update the favourite status
      console.log(!like)
      const response = await axios.put(
        `http://localhost:5000/api/orders/userId/${id}/orderId/${orderNum}`,
        { favourite: !like },
        {
          headers: {
            authorization: `Bearer ${loginUser.token}`,
          },
        }
      );

      if (response.status === 200) {
        setLike((prev) => !prev); // Update UI state
      } else {
        alert("Failed to update favourite status. Please try again.");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Unauthorized access. Please log in.");
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <div className={css.outerDiv}>
        <div className={css.innerDiv}>
          <div className={css.topBar}>
            <div className={css.leftHead}>
              <div className={css.imgBox}>
                <img className={css.img} src={imgSrc} alt="Picture" />
              </div>
              <div className={css.det}>
                <div className={css.name}>{name}</div>
                {/* <div className={css.address}>{"address"}</div> */}
                <div className={css.status}>{status}</div>
              </div>
            </div>

            <div className={css.fav} onClick={handleLikeToggle}>
              <div className={css.favImg}>
                {like ? (
                  <img className={css.likedImg} src={heartF} alt="liked icon" />
                ) : (
                  <img className={css.likedImg} src={heartO} alt="liked icon" />
                )}
              </div>
            </div>
          </div>
          <div className={css.midBar}>
            <div className={css.txtBox}>
              <div className={css.titleTxt}>Order Id</div>
              <div className={css.vlaTxt}>{orderNum}</div>
            </div>
            <div className={css.txtBox}>
              <div className={css.titleTxt}>Total Amount</div>
              <div className={css.vlaTxt}>₹ {grandTotal}</div>
            </div>
            <div className={css.txtBox}>
              <div className={css.titleTxt}>Items</div>
              {items?.map((val, i) => {
                return (
                  <div className={css.itemDet} key={i}>
                    <span className={css.qtyTxt}>{val?.qty}</span>
                    <span className={css.cross}>X</span>
                    <div className={css.vlaTxt}>{val?.itemName}</div>
                  </div>
                );
              })}
            </div>
            <div className={css.txtBox}>
              <div className={css.titleTxt}>Ordered On</div>
              <div className={css.vlaTxt}>{orderedOn}</div>
            </div>
          </div>
          <div className={css.footerBar}>
            {/* <button
              className={css.viewBtn}
              onClick={() => {
                setViewDet((val) => !val);
                setOrderId(id);
              }}
            >
              View Details
            </button> */}
          </div>
        </div>
        {/* {error && <p className={css.error}>{error}</p>} */}
      </div>
    </>
  );
};

export default OrderHistoryCard;
