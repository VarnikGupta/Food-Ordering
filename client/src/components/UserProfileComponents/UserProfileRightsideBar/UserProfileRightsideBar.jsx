import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import css from "./UserProfileRightsideBar.module.css";

import UserReviewedCard from "../../../utils/UserProfileUtils/UserProfile/Activity/UserReviewedCard/UserReviewedCard";
import OrderHistory from "../../../utils/UserProfileUtils/UserProfile/OnlineOrdering/OrderHistory/OrderHistory";
import MyAddresses from "../../../utils/UserProfileUtils/UserProfile/OnlineOrdering/MyAddresses/MyAddresses";
import FavoriteOrders from "../../../utils/UserProfileUtils/UserProfile/OnlineOrdering/FavoriteOrders/FavoriteOrders";
import axios from "axios";
import UserProfileNoData from "../../../utils/UserProfileNoData/UserProfileNoData";

const hashIdToTitle = {
  "order-history": "Order History",
  address: "My Addresses",
  "favorite-orders": "Favorite Orders",
  default: "Reviews",
};

let UserProfileRightsideBar = () => {
  let [currComp, setCurrComp] = useState(<h1>Something Went Wrong!</h1>);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  let { id, hashId } = useParams();
  const userId = id;

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews?userId=${userId}`
      );
      if (response.status === 200) {
        setReviews(response.data.reviews || []);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("User or reviews not found.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchReviews();
  }, [userId, hashId]);

  useEffect(() => {
    switch (hashId) {
      case "order-history":
        setCurrComp(<OrderHistory hashId={hashId} />);
        break;
      case "address":
        setCurrComp(<MyAddresses hashId={hashId} />);
        break;
      case "favorite-orders":
        setCurrComp(<FavoriteOrders hashId={hashId} />);
        break;
      default:
        setCurrComp(
          loading ? (
            <p>Loading reviews...</p>
          ) : error ? (
            <p className={css.error}>{error}</p>
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <UserReviewedCard data={review} key={index} />
            ))
          ) : (
            <UserProfileNoData hashId={hashId} />
          )
        );
    }
  }, [hashId, reviews, loading, error]);

  const title = hashIdToTitle[hashId] || hashIdToTitle.default;

  return (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.title}>{title}</div>
        <div className={css.contectBox}>{currComp}</div>
      </div>
    </div>
  );
};

export default UserProfileRightsideBar;
