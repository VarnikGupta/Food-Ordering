import React, { useState, useEffect } from "react";
import axios from "axios";
import css from "./AdminDashBoard.module.css";
import imgSrc from "../../utils/images/food1.jpg";
import { useNavigate } from "react-router-dom";
import RedBtnHov from "../../utils/RedBtnHov/RedBtnHov";
import MenuModal from "../../utils/MenuModal/MenuModal"; // Import the modal component
import {createPortal} from "react-dom"

const AdminDashBoard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // Track selected restaurant
  const loginUser = JSON.parse(localStorage.getItem("auth"));
  const navigate = useNavigate();

  const handleRestaurantClick = (restId) => {
    navigate(`/admin/dashboard/orders`, { state: { restId } });
  };

  const handleClick = (restaurant) => {
    setSelectedRestaurant(restaurant); // Set the selected restaurant
  };

  const closeModal = () => {
    setSelectedRestaurant(null); // Close the modal
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
          // onClick={() =>}
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
              <span>
                <RedBtnHov
                  txt="View Orders"
                  onClick={() => handleRestaurantClick(restaurant.restId)}
                />
                <RedBtnHov
                  txt="Edit Menu"
                  onClick={() => handleClick(restaurant)}
                />
              </span>
            </div>
          </div>
        </div>
      ))}
      {selectedRestaurant &&
        createPortal(
          <MenuModal
            restaurant={selectedRestaurant}
            setModal={closeModal}
          />,
          document.getElementById("portal")
        )}
    </div>
  );
};

export default AdminDashBoard;
