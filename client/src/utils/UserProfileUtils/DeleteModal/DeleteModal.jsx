import { useState } from "react";
import { createPortal } from "react-dom";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";

import css from "./DeleteModal.scss";

import closeBtn from "../../images/closeBtn.jpg";
import RedBtnHov from "../../RedBtnHov/RedBtnHov";
import WhiteBtnHov from "../../WhiteBtnHov/WhiteBtnHov";
import TextUtil from "../../TextUtil/TextUtil";
import { useParams } from "react-router-dom";
import { BsExclamationLg } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const DeleteModal = ({ setloginFirst }) => {
  const navigate = useNavigate();

  const { id } = useParams();
  const loginUser = JSON.parse(localStorage.getItem("auth"));

  const handleClick = () => {
    axios
      .delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${loginUser.token}`,
        },
      })
      .then((response) => {
        localStorage.removeItem("auth");
        navigate("/");
        setloginFirst(false);
        window.location.reload(); // Close the modal after success
      })
      .catch((error) => {
        console.error("Delete Failed:", error.response?.data || error.message);
      });
  };

  const cancelUpdate = () => {
    setloginFirst(false); // Close modal on cancel
  };

  const domObj = (
    <div className="model" onClick={() => setloginFirst(false)}>
      <div className="message" onClick={(e) => e.stopPropagation()}>
        <div className="exclamation">
          <BsExclamationLg />
        </div>
        <h2 className="heading">Account will be deleted!</h2>

        {/* <p className="text">After login you will be able to order</p> */}
        <div className="btns">
          <button className="cancel" onClick={() => handleClick()}>
            Ok
          </button>
          <button className="cancel" onClick={() => cancelUpdate()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(domObj, document.getElementById("portal"));
};

export default DeleteModal;
