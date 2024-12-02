import "./Header.css";
import React, { useState } from "react";
import zomato from "../../utils/images/zomato.png";
import { HiLocationMarker, HiShoppingCart } from "react-icons/hi";
import { AiFillCaretDown } from "react-icons/ai";
import { CiSearch } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { createPortal } from "react-dom";
import SignUp from "../SignUp/SignUp";
import LogIn from "../LogIn/LogIn";
import { FaUserAlt } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { logout } from "../Redux/LoginUserSlice";
import { clearCart } from "../Redux/CartItemSlice";
import { restaurants } from "../../utils/restaurants/restaurants";
import GenerateSearchBarItem from "../GenerateSearchBarItem/GenerateSearchBarItem";
import { useNavigate, useLocation } from "react-router-dom";
import AddAddressPortal from "../../utils/AddAddressPortal/AddAddressPortal";
import AddRes from "../AddRes/AddRes";

const Header = () => {
  const [displayBarOptions, setDisplayBarOptions] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [logIn, setLogIn] = useState(false);
  const [addRes, setAddRes] = useState(false);
  const [displayLogOut, setDisplayLogOut] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchBarItems, setSearchBarItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const handleSearchNavigation = () => {
    navigate("/search");
  };
  // const cartItems = useSelector((state) => state.cart_items.items);
  const loginUser = useSelector((state) => state.login_user.user);
  const dispatch = useDispatch();

  const searchbarHandler = (e) => {
    let value = e.target.value;
    setSearchValue(value);
    value = value.trim();
    let regexValue;

    try {
      regexValue = new RegExp(value, "i");
    } catch {
      regexValue = new RegExp("", "i");
      value = "";
    }

    const matchesRestaurants = restaurants.filter((restaurant) => {
      return (
        regexValue.test(restaurant.info.name) ||
        regexValue.test(
          restaurant.info.cuisine.map((cuisineName) => cuisineName.name)
        )
      );
    });

    if (value === "") setSearchBarItems([]);
    else setSearchBarItems(matchesRestaurants.slice(0, 10));
    // console.log(matchesRestaurants);
  };

  const userHandler = () => {
    setDisplayLogOut(!displayLogOut);
  };

  const logOutHandler = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
  };

  return (
    <div className="header-container">
      <div className="header">
        {/* bar open-close button */}
        <div
          onClick={() => setDisplayBarOptions(!displayBarOptions)}
          className="bar"
        >
          <span
            style={{
              transform:
                displayBarOptions && "rotate(45deg) translate(3px, 3px)",
            }}
          ></span>
          <span style={{ opacity: displayBarOptions && 0 }}></span>
          <span
            style={{
              transform:
                displayBarOptions && "rotate(-45deg) translate(5px, -6px)",
            }}
          ></span>
        </div>

        <Link to="/" onClick={() => setDisplayBarOptions(false)}>
          <img id="logo" src={zomato} alt="Zomato" />
        </Link>

        {/* search bar */}
        <div className="search-container1">
          {location.pathname !== "/search" && (
            <div className="search-container">
              <div className="search" onClick={handleSearchNavigation}>
                <span id="search-icon">
                  <CiSearch />
                </span>
                <input
                  onChange={searchbarHandler}
                  value={searchValue}
                  placeholder="Search for restaurant or a dish"
                />
                {searchValue && (
                  <div className="search-bar-items-container">
                    {searchBarItems.length > 0 ? (
                      <div className="search-bar-items">
                        {searchBarItems.map((item, index) => {
                          return (
                            <GenerateSearchBarItem
                              key={index}
                              restaurant={item}
                              setSearchValue={setSearchValue}
                              setDisplayBarOptions={setDisplayBarOptions}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="not-match-container">
                        <p className="oops">Oops!</p>
                        <span className="text">
                          We could not understand what you mean, try rephrasing
                          the query.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* cart-login-signup */}
        <div className="authentications">
          <Link className="link" to="/checkout">
            <span className="cartIcon-total">
              <HiShoppingCart
              // style={{ color: Object.keys(cartItems).length && "green" }}
              />
              <span
                className="cartItemTotal"
                // style={{ color: Object.keys(cartItems).length && "white" }}
              >
                {/* {Object.keys(cartItems).length} */}
              </span>
            </span>
            Cart
          </Link>
          <div className="link" onClick={() => setAddRes(true)}>
            <span className="cartIcon-total">
              <span className="cartItemTotal"></span>
            </span>
            Add restaurant
          </div>
          {!loginUser ? (
            <>
              <span className="link" onClick={() => setLogIn(true)}>
                Log in
              </span>
              <span className="link" onClick={() => setSignUp(true)}>
                Sign up
              </span>
            </>
          ) : (
            <span className="link login-user" onClick={userHandler}>
              <FaUserAlt />
              <span className="name" title={loginUser.name}>
                {loginUser.name}
              </span>
              <MdKeyboardArrowDown
                style={{ rotate: displayLogOut && "180deg" }}
              />
              <span
                className="profile-option"
                style={{ display: displayLogOut && "block" }}
              >
                <Link to={`/user/${loginUser._id}/reviews`} className="profile-link">
                  Profile
                </Link>
              </span>
              <span
                className="log-out"
                style={{ display: displayLogOut && "block" }}
                onClick={logOutHandler}
              >
                Log out
              </span>
            </span>
          )}
        </div>
      </div>

      {/* bar */}
      <div
        style={{
          opacity: !displayBarOptions && 0,
          zIndex: !displayBarOptions && -1,
        }}
        className="bar-options"
      >
        <Link
          className="link"
          to="/checkout"
          onClick={() => setDisplayBarOptions(false)}
        >
          <span className="cartIcon-total">
            <HiShoppingCart
            // style={{ color: Object.keys(cartItems).length && "green" }}
            />
            <span
              className="cartItemTotal"
              // style={{ color: Object.keys(cartItems).length && "white" }}
            >
              {/* {Object.keys(cartItems).length} */}
            </span>
          </span>
          Cart
        </Link>
        {!loginUser ? (
          <>
            <span
              className="link"
              onClick={() => {
                setDisplayBarOptions(false);
                setLogIn(true);
              }}
            >
              Log in
            </span>
            <span
              className="link"
              onClick={() => {
                setDisplayBarOptions(false);
                setSignUp(true);
              }}
            >
              Sign up
            </span>
          </>
        ) : (
          <span className="link login-user" onClick={userHandler}>
            <FaUserAlt />
            <span className="name" title={loginUser.name}>
              {loginUser.name}
            </span>
            <MdKeyboardArrowDown
              style={{ rotate: displayLogOut && "180deg" }}
            />
            <span
              className="log-out"
              style={{ display: displayLogOut && "block" }}
              onClick={logOutHandler}
            >
              Log out
            </span>
          </span>
        )}

        {/* <div className="search-container">
          <div className="location">
            <span id="location-icon">
              <HiLocationMarker />
            </span>
            <input placeholder="Kolkata" readOnly />
            <span id="down-arrow-icon">
              <AiFillCaretDown />
            </span>
          </div>

          <div className="divider"></div>

          <div className="search" onClick={handleSearchNavigation}>
            <span id="search-icon">
              <CiSearch />
            </span>
            <input
              onChange={searchbarHandler}
              value={searchValue}
              placeholder="Search for restaurant, cuisine or a dish"
            />
            {searchValue && (
              <div className="search-bar-items-container">
                {searchBarItems.length > 0 ? (
                  <div className="search-bar-items">
                    {searchBarItems.map((item, index) => {
                      return (
                        <GenerateSearchBarItem
                          key={index}
                          restaurant={item}
                          setSearchValue={setSearchValue}
                          setDisplayBarOptions={setDisplayBarOptions}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="not-match-container">
                    <p className="oops">Oops!</p>
                    <span className="text">
                      We could not understand what you mean, try rephrasing the
                      query.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div> */}
      </div>

      {signUp &&
        createPortal(
          <SignUp setSignUp={setSignUp} setLogIn={setLogIn} />,
          document.getElementById("portal")
        )}
      {logIn &&
        createPortal(
          <LogIn setLogIn={setLogIn} setSignUp={setSignUp} />,
          document.getElementById("portal")
        )}
      {addRes &&
        createPortal(
          <AddRes setModal={setAddRes} />,
          document.getElementById("portal")
        )}
    </div>
  );
};

export default Header;
