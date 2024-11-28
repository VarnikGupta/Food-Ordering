import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import css from "./RestaurantPage.module.css";

import HeroComponent from "../../components/HeroComponent/HeroComponent";
import OrderTitleComponent from "../../components/OrderTitleComponent/OrderTitleComponent";
import OrderBodyComponent from "../../components/OrderBodyComponent/OrderBodyComponent";
import axios from 'axios';

const RestaurantPage = () => {
  const { id } = useParams();
  const [menuData, setMenuData] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/restaurants/${id}`
        );
        console.log("details", response);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Restaurant not found");
          }
          throw new Error("Failed to fetch restaurant details");
        }
        const data = await response.data.restaurant;
        setRestaurantDetails(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (id) fetchRestaurantDetails();
  }, [id]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/restaurant/${id}/menu`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Restaurant not found");
          }
          throw new Error("Failed to fetch menu");
        }
        console.log("menu", response);
        const data = await response.json();
        setMenuData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (id) fetchMenu();
  }, [id]);

  return (
    <div className={css.outerDiv}>
      <HeroComponent />
      <div className={css.innerDiv2}>
        <OrderTitleComponent details={restaurantDetails} />
        <OrderBodyComponent menu={menuData} />
      </div>
    </div>
  );
};

export default RestaurantPage;
