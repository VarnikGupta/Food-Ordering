import { useEffect, useState } from "react";
import { Formik, Form } from "formik";

import css from "./OrderOnlineFieldComponent.module.css";
import CartItem from "../../../CartItem/CartItem";
import CheckBoxUtil from "../../../../utils/CheckBoxUtil/CheckBoxUtil";

import FoodItemProduct from "../../../../utils/RestaurantUtils/FoodItemProduct/FoodItemProduct";

import compassIcon from "../../../../utils/images/compass.png";
import vegIcon from "../../../../utils/images/veg.png";
import clockIcon from "../../../../utils/images/clock.png";

import hariyalikebab from "../../../../utils/images/hariyalikebab.jpg";
import axios from "axios";
import { useParams } from "react-router-dom";

const OrderOnlineFieldComponent = () => {
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [groupedMenu, setGroupedMenu] = useState({});
  const [restName, setrestName] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/restaurants/${id}/menu`
        );
        setMenuData(response.data.menu); // Correctly set menu data
        setrestName(response.data.name);
        const grouped = response.data.menu.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});
        setGroupedMenu(grouped);
      } catch (err) {
        setError(err.response?.status === 404 ? "Menu not found" : err.message);
      }
    };

    if (id) fetchMenu();
  }, [id]);

  const [isActive, setIsActive] = useState({
    recommended: true,
  });

  let breakDiv = <hr className={css.hr2} />;
  const foodItemsDataLength = Object.keys(groupedMenu).length;
  const breakDivFunc = (index) => {
    if (+foodItemsDataLength - 1 > +index) {
      return breakDiv;
    }
    breakDiv = "";
    return breakDiv;
  };

  const sideNavHandler = (val) => {
    setIsActive({ [val]: true });
    document.getElementById(`${val}`).scrollIntoView({
      behavior: "smooth",
    });
  };
  const loginUser = JSON.parse(localStorage.getItem("auth"));

  useEffect(() => {
    const allTtls = document.querySelectorAll("[data-id=secTtl]");
    const options = {
      threshold: 0.1,
    };

    const handleIntersection = (entries) => {
      entries?.map((entry) => {
        if (entry.isIntersecting) {
          document
            .querySelector(`[data-sb-id='${entry.target.id}']`)
            ?.classList.add(css.activeNavTab);
        } else {
          document
            .querySelector(`[data-sb-id='${entry.target.id}']`)
            ?.classList.remove(css.activeNavTab);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    allTtls.forEach((post) => observer.observe(post));
  }, []);

  const itemHandler = async (item, action) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${loginUser._id}/cart`,
        {
          action: action,
          item: {
            dishName: item.dishName,
            quantity: 1,
            price: item.cost,
            restId: id,
            restName: restName,
          },
        },
        {
          headers: {
            authorization: `Bearer ${loginUser.token}`,
          },
        }
      );

      if (response.status === 200) {
        // fetchCartItems(loginUser._id);
      }
    } catch (err) {
      console.error(
        "Failed to add item:",
        err.response?.data?.message || err.message
      );
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!menuData) {
    return <div>Loading menu...</div>;
  }

  return (
    <div className={css.outerDiv}>
      <div className={css.innerDiv}>
        <div className={css.leftBox}>
          {/* {Object.entries(groupedMenu)?.map((val, id) => {
          return <div data-sb-id={val?.[0]} key={id} onClick={() => sideNavHandler(val)} className={isActive[val?.[0]] ? [css.navTab, css.activeNavTab].join(" ") : css.navTab}>{val?.[0]} ({val?.[1]?.length})</div>
        })} */}
          {Object.entries(groupedMenu)?.map(
            ([groupName, groupItems], index) => (
              <div
                data-sb-id={groupName}
                key={index}
                id={groupName}
                onClick={() => sideNavHandler(groupName)}
                className={
                  isActive[groupName]
                    ? [css.navTab, css.activeNavTab].join(" ")
                    : css.navTab
                }
              >
                {groupName} ({groupItems?.length})
              </div>
            )
          )}
        </div>
        <div className={css.rightBox}>
          <div className={css.hSec}></div>
          <div className={css.itemsBox} id="itemsBox">
            {Object.entries(groupedMenu)?.map(
              ([groupName, groupItems], index) => (
                <div key={index} id={groupName}>
                  <div className={css.sec}>
                    {/* Group Title */}
                    <div className={css.secTtl}>{groupName}</div>

                    {groupItems?.map((item, id) => (
                      <FoodItemProduct
                        key={id}
                        item={item}
                        itemHandler={(items, action) => {
                          itemHandler(items, action);
                        }}
                      />
                    ))}
                  </div>
                  {breakDivFunc(index)}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderOnlineFieldComponent;
