import { useState } from "react";
import React from "react";
import { useDispatch } from "react-redux";
import GenerateImage from "../../../components/GenerateImage/GenerateImage";
import wowMomo from "../../../utils/images/food1.jpg";
import css from "./FoodItemProduct.scss";

import starGIcon from "../../../utils/images/starGIcon.png";
import starGrIcon from "../../../utils/images/starGrIcon.png";

const FoodItemProduct = ({ item, itemHandler }) => {
  // State to track if the item has been added to the cart
  const [isAdded, setIsAdded] = useState(false);

  // Add item to cart and update state
  const addItemsHandler = () => {
    if (!isAdded) {
      itemHandler(item, "add");
      setIsAdded(true); // Mark item as added to the cart
    }
  };

  return (
    <div className="cart-item" id={item.id}>
      <div className="image-name">
        <div className="cart-item-image">
          <GenerateImage url={wowMomo} alt={"item"} title={"name"} />
        </div>
        <div className="cart-item-name">{item.dishName}</div>
      </div>

      <div className="buttons-price">
        <div className="cart-item-buttons">
          {/* Button text changes based on isAdded state */}
          <span
            className="count"
            onClick={addItemsHandler}
            style={{ cursor: isAdded ? "not-allowed" : "pointer" }} // Disable pointer if added
          >
            {isAdded ? "Added to Cart" : "ADD TO CART"}
          </span>
        </div>
        <div className="cart-item-price">₹{item.cost}</div>
      </div>
    </div>
  );
};

export default FoodItemProduct;
