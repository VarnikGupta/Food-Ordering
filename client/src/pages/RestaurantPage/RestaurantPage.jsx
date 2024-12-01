import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import css from "./RestaurantPage.module.css";

import HeroComponent from "../../components/HeroComponent/HeroComponent";
import OrderTitleComponent from "../../components/OrderTitleComponent/OrderTitleComponent";
import OrderBodyComponent from "../../components/UserBodyComponents/OrderBodyComponent";
import axios from 'axios';

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [error, setError] = useState(null);
  // const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/restaurants/${id}`
        );
        setRestaurantDetails(response.data.restaurant); // Correctly set restaurant details
      } catch (err) {
        setError(err.response?.status === 404 ? "Restaurant not found" : err.message);
      }
    };

    if (id) fetchRestaurantDetails();
  }, [id]);

  return (
    <div className={css.outerDiv}>
      <HeroComponent />
      <div className={css.innerDiv2}>
        <OrderTitleComponent details={restaurantDetails} />
        <OrderBodyComponent />
      </div>
    </div>
  );
};

export default RestaurantPage;
