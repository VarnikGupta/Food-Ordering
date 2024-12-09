import { useState } from "react";
import css from "./OrderHistoryCard.module.css";
import heartO from "../images/icons/heartO.png";
import heartF from "../images/icons/heartF.png";
import axios from "axios";

const OrderHistoryCard = ({ udata, setViewDet, setOrderId }) => {
  const {
    orderId,
    imgSrc,
    name,
    orderNum,
    items,
    orderedOn,
    grandTotal,
    status,
    isFavourite,
  } = udata;

  const [like, setLike] = useState(isFavourite || false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const loginUser = JSON.parse(localStorage.getItem("auth"));

  const handleLikeToggle = async () => {
    if (!loginUser || !loginUser.token) {
      alert("Unauthorized access. Please log in.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/userId/${loginUser.id}/orderId/${orderNum}`,
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
      alert("An unexpected error occurred.");
    }
  };

  const handleCancelOrder = async () => {
    if (status === "Cancelled") return;

    setLoading(true);
    setError(null);
    console.log(loginUser);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/userId/${loginUser._id}/orderId/${orderNum}`,
        { status: "Cancelled" },
        {
          headers: {
            authorization: `Bearer ${loginUser.token}`,
          },
        }
      );

      if (response.status === 200) {
        window.location.reload();
        // onCancelOrder(orderNum); // Notify parent component of the cancellation
      } else {
        alert("Failed to cancel the order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to cancel the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.topBar}>
          <div className={css.leftHead}>
            <div className={css.imgBox}>
              <img className={css.img} src={imgSrc} alt="Order" />
            </div>
            <div className={css.det}>
              <div className={css.name}>{name}</div>
              <div className={css.status}>{status}</div>
            </div>
          </div>
          <div className={css.fav} onClick={handleLikeToggle}>
            <div className={css.favImg}>
              {like ? (
                <img className={css.likedImg} src={heartF} alt="liked icon" />
              ) : (
                <img className={css.likedImg} src={heartO} alt="unliked icon" />
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
            {items?.map((val, i) => (
              <div className={css.itemDet} key={i}>
                <span className={css.qtyTxt}>{val.qty}</span>
                <span className={css.cross}>X</span>
                <div className={css.vlaTxt}>{val.itemName}</div>
              </div>
            ))}
          </div>
          <div className={css.txtBox}>
            <div className={css.titleTxt}>Ordered On</div>
            <div className={css.vlaTxt}>{orderedOn}</div>
          </div>
          <div className={css.footer}>
            {
              status === "Cancelled"
            }
            <button
              className={css.cancelBtn}
              onClick={handleCancelOrder}
              disabled={status === "Cancelled" || loading}
            >
              {status === "Cancelled" ? "Cancelled" : "Cancel Order"}
            </button>
          </div>
        </div>
      </div>
      {error && <p className={css.error}>{error}</p>}
    </div>
  );
};

export default OrderHistoryCard;
