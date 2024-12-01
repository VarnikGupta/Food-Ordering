import React, { useState, useEffect } from "react";
import axios from "axios";
import css from "./AdminDashBoard.module.css";
import imgSrc from "../../utils/images/food1.jpg";
import { useNavigate } from "react-router-dom";

const AdminDashBoard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loginUser = JSON.parse(localStorage.getItem("auth"));
  const navigate = useNavigate()

  const handleRestaurantClick = (restId) => {
    navigate(`/admin/dashboard/orders`, { state: { restId } });
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/restaurants",
          {
            headers: {
              authorization: `Bearer ${loginUser.token}`,
            },
          }
        );
        if (response.data && response.data.restaurants) {
          setRestaurants(response.data.restaurants);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch restaurants");
        console.error(err);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={css.outermost}>
      {restaurants.map((restaurant) => (
        <div
          key={restaurant.restId}
          className={css.outerDiv}
          onClick={() => handleRestaurantClick(restaurant.restId)}
        >
          <div className={css.innerDiv}>
            <div className={css.sec1}>
              <div className={css.leftBox}>
                <div className={css.imgBox}>
                  <img
                    className={css.hotelImg}
                    src={imgSrc}
                    alt={`${restaurant.name} image`}
                  />
                </div>
                <div className={css.txtBox1}>
                  <div className={css.title}>{restaurant.name}</div>
                  <div className={css.contact}>
                    Contact: {restaurant.contact}
                  </div>
                </div>
              </div>
              <div className={css.rightBox}>
                <span className={css.delTxt}>
                  Rating: {restaurant.rating.toFixed(1)} ★
                </span>
                <span className={css.ratingCount}>
                  ({restaurant.ratingCount} ratings)
                </span>
              </div>
            </div>
            <div className={css.sec}>
              <span className={css.delivery}>
                Address: {restaurant.location.addressLine},{" "}
                {restaurant.location.street}, {restaurant.location.city},{" "}
                {restaurant.location.state}, {restaurant.location.country} -{" "}
                {restaurant.location.pincode}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashBoard;
