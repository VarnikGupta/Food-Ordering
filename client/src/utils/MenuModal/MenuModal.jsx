import { useState } from "react";
import { createPortal } from "react-dom";

import css from "./MenuModal.module.css";
import closeBtn from "../images/closeBtn.jpg";
import RedBtnHov from "../RedBtnHov/RedBtnHov";
import WhiteBtnHov from "../WhiteBtnHov/WhiteBtnHov";
import axios from "axios";

const MenuModal = ({ restaurant, setModal }) => {
  const [dishes, setDishes] = useState([]);
  const [currentDish, setCurrentDish] = useState({
    dishName: "",
    category: "",
    cuisine: "",
    cost: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentDish({ ...currentDish, [name]: value });
  };

  const addDish = () => {
    const { dishName, category, cuisine, cost } = currentDish;

    // Validate fields
    if (!dishName || !category || !cuisine || !cost) {
      alert("Please fill in all fields!");
      return;
    }

    if (isNaN(cost) || cost <= 0) {
      alert("Please enter a valid cost!");
      return;
    }

    // Add to dishes array
    setDishes([...dishes, currentDish]);

    // Reset current dish
    setCurrentDish({
      dishName: "",
      category: "",
      cuisine: "",
      cost: "",
    });
  };

  const submitDishes = async () => {
    if (dishes.length === 0) {
      alert("No dishes to submit!");
      return;
    }

    try {
      const loginUser = JSON.parse(localStorage.getItem("auth"));
      const restId = restaurant?.restId; // Assuming `restaurant` contains `restId`

      if (!restId) {
        alert("Restaurant ID is missing!");
        return;
      }
      if (!dishes.length === 0) {
        alert("No dish added!");
        return;
      }

      const payload = {
        menuItems: dishes.map(({ dishName, category, cuisine, cost }) => ({
          dishName,
          cuisine,
          category,
          cost: parseFloat(cost),
        })),
      };

      console.log("Submitting Dishes Payload:", payload);

      const response = await axios.put(
        `http://localhost:5000/api/restaurants/${restId}/menu`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${loginUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(`Menu Updated Successfully: ${response.data.message}`);
      setModal(false); // Close modal after success
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update the menu";
      console.error("Error:", error);
      alert(`Error: ${errorMsg}`);
    }
  };

  return createPortal(
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.header}>
          <div className={css.headerLeft}>
            <div className={css.title}>Add Dishes</div>
          </div>
          <span className={css.closeBtn} onClick={() => setModal(false)}>
            <img className={css.closeBtnImg} src={closeBtn} alt="Close" />
          </span>
        </div>

        <div className={css.bdy}>
          {/* Current Dish Fields */}
          <div className={css.form}>
            <input
              type="text"
              name="dishName"
              value={currentDish.dishName}
              onChange={handleChange}
              placeholder="Enter Dish Name"
              className={css.inputField}
            />
            <input
              type="text"
              name="category"
              value={currentDish.category}
              onChange={handleChange}
              placeholder="Enter Category (e.g., Starter)"
              className={css.inputField}
            />
            <input
              type="text"
              name="cuisine"
              value={currentDish.cuisine}
              onChange={handleChange}
              placeholder="Enter Cuisine (e.g., Italian)"
              className={css.inputField}
            />
            <input
              type="number"
              name="cost"
              value={currentDish.cost}
              onChange={handleChange}
              placeholder="Enter Cost"
              className={css.inputField}
            />
            <div className={css.btns}>
              <RedBtnHov txt="Add Dish" onClick={addDish} />
            </div>
          </div>

          {/* Display Added Dishes */}
          <div className={css.dishList}>
            <h3>Added Dishes:</h3>
            {dishes.length > 0 ? (
              <ul>
                {dishes.map((dish, index) => (
                  <li key={index}>
                    {dish.dishName} - {dish.category} - {dish.cuisine} - ₹
                    {dish.cost}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No dishes added yet.</p>
            )}
          </div>

          {/* Submit or Cancel */}
          <div className={css.btns}>
            <WhiteBtnHov txt="Cancel" onClick={() => setModal(false)} />
            <RedBtnHov txt="Submit Dishes" onClick={submitDishes} />
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("portal")
  );
};

export default MenuModal;
