import React from "react";
import Card from "react-bootstrap/Card";
import food1 from "../images/food1.jpg";
import RedBtn from "../RedBtnHov/RedBtnHov";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const Cards = ({ data }) => {
  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("auth"));

  const [addedItems, setAddedItems] = useState({});

  const itemHandler = async (item, action) => {
    if (addedItems[item.dishName]) return;
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${loginUser._id}/cart`,
        {
          action: action,
          item: {
            dishName: item.dishName,
            quantity: 1,
            price: item.cost,
            restId: item.restId,
            restName: item.restName,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${loginUser.token}`,
          },
        }
      );

      if (response.status === 200) {
        setAddedItems((prevItems) => ({
          ...prevItems,
          [item.dishName]: true, // Mark the item as added
        }));
        // navigate("/cart");
      }
    } catch (err) {
      console.error(
        "Failed to add item:",
        err.response?.data?.message || err.message
      );
    }
  };

  return (
    <>
      {data.map((element, index) => (
        <Card
          key={index}
          style={{ width: "22rem", border: "none" }}
          className="hove mb-4"
        >
          <Card.Img variant="top" className="cd" src={food1} />
          <div className="card_body">
            {/* Render for Restaurant */}
            {element.type === "restaurant" ? (
              <>
                <div className="upper_data d-flex justify-content-between align-items-center">
                  <h4 className="mt-2">{element.restName}</h4>
                  <span>{element.rating.toFixed(1)} ★</span>
                </div>

                <div className="lower_data d-flex justify-content-between">
                  <h5>{element.location.addressLine}</h5>
                  <span>{element.ratingCount} ratings</span>
                </div>
              </>
            ) : null}

            {/* Render for Dish */}
            {element.type === "dish" ? (
              <>
                <div className="upper_data d-flex justify-content-between align-items-center">
                  <h4 className="mt-2">{element.dishName}</h4>
                  <span>${element.cost}</span>
                </div>

                <div className="lower_data d-flex justify-content-between">
                  <h5>{element.restName}</h5>
                </div>
              </>
            ) : null}

            {/* Common Footer */}
            <div className="last_data d-flex justify-content-between align-items-center mt-2 h-2">
              {element.type === "restaurant" ? (
                <RedBtn
                  txt={"Menu"}
                  onClick={() =>
                    navigate(`/restaurant/${element.restId}/orders`)
                  }
                />
              ) : (
                // For Dish, add item to the cart
                <RedBtn
                  txt={addedItems[element.dishName] ? "Added" : "Add to cart"}
                  onClick={() => itemHandler(element, "add")}
                />
              )}
              <p>{element.type === "restaurant" ? "Restaurant" : "Dish"}</p>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};

export default Cards;
