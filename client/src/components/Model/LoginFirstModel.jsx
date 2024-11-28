import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./OrderModel.scss";
import React, { useEffect } from "react";
import { BsExclamationLg } from "react-icons/bs";

const LoginFirstModel = ({ setloginFirst }) => {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  function handleClick() {
    setloginFirst(false);
    navigate("/")
  }

  return (
    <div className="model" onClick={() => setloginFirst(false)}>
      <div className="message" onClick={(e) => e.stopPropagation()}>
        <div className="exclamation">
          <BsExclamationLg />
        </div>
        <h2 className="heading">Please login first!</h2>
        <p className="text">After login you will be able to order</p>
        <button className="cancel" onClick={() => handleClick()}>
          OK
        </button>
      </div>
    </div>
  );
};

export default LoginFirstModel;
