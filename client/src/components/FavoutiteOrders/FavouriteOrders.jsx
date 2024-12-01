import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import css from "./FavouriteOrders.module.css";

import RestUserReviewedCard from "../../utils/UserReviewCard/RestUserReviewedCard";

import profilepic from "../../utils/images/profilepic.jpg";

const FavouriteOrders = () => {
  const [favourite, setFavourite] = useState([]);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("auth"));

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/order-history?userId=${id}`,
          {
            headers: {
              Authorization: `Bearer ${loginUser.token}`,
            },
          }
        );
        console.log(response.data);
        if (response.status === 200 && response.data.orderHistory) {
          setFavourite(response.data.orderHistory);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("User or Restaurant not found");
        } else {
          setError("Failed to fetch reviews");
        }
      }
    };

    if (id) {
      fetchOrders();
    }
  }, [id]);

  return (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.left}>
          {error && <div className={css.error}>{error}</div>}

          {favourite.length === 0 ? (
            <div className="empty-cart">
              <h1 className="heading">No Favourite Orders</h1>
            </div>
          ) : (
            <div className={css.re}>
              {favourite.map((item, id) => (
                <RestUserReviewedCard key={id} data={item} />
              ))}
            </div>
          )}
        </div>
        {/* <div className={css.right}>
          <RateYourExperienceCard />
        </div> */}
      </div>
    </div>
  );
};

export default FavouriteOrders;
